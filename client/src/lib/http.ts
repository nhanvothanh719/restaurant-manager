import envConfig from '@/config';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants/localStorageKeys';
import { normalizePath } from '@/lib/utils';
import { LoginResType } from '@/schemaValidations/auth.schema';
import { redirect } from 'next/navigation';

const UNPROCESSABLE_ENTITY_STATUS = 422;
const AUTHENTICATION_ERROR_STATUS = 401;

type UnprocessableEntityErrorPayload = {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
};

type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined;
};

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };

  constructor({
    status,
    payload,
    message = 'HTTP Error',
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

let clientLogoutRequest: null | Promise<any> = null;
const request = async <Response>(
  method: HttpMethod,
  url: string,
  options?: CustomOptions | undefined
) => {
  let body: FormData | string | undefined = undefined;
  if (options?.body) {
    body =
      options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body);
  }

  const baseHeaders: Record<string, string> =
    method !== 'GET' &&
    method !== 'DELETE' &&
    !(options?.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {};

  // Only add Authorization from localStorage in client components
  // Server components should pass auth token explicitly via options.headers
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) baseHeaders.Authorization = `Bearer ${accessToken}`;
  }

  // MEMO: Set url of the BE server as the default base url
  // MEMO: `options.baseUrl = ''` means call to the Next.js server
  const baseUrl =
    options?.baseUrl === undefined ? envConfig.apiEndpoint : options.baseUrl;
  const fullUrl = `${baseUrl}/${normalizePath(url)}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    },
    body,
    method,
  });
  const payload: Response = await res.json();

  const data = {
    status: res.status,
    payload,
  };

  if (!res.ok) {
    if (res.status === UNPROCESSABLE_ENTITY_STATUS) {
      throw new UnprocessableEntityError(
        data as { status: 422; payload: UnprocessableEntityErrorPayload }
      );
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      // Only handle logout in browser (client-side rendering)
      if (typeof window !== 'undefined') {
        // Xử lý cho client component
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch('/api/auth/logout', {
            method: 'POST',
            body: null,
            headers: {
              ...baseHeaders,
            },
          });
          try {
            await clientLogoutRequest;
          } catch {
          } finally {
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            clientLogoutRequest = null;
            // Full-reload page
            location.href = '/login';
          }
        } else {
          // Xử lý cho server component
          // Bởi vì từ server component muốn gọi được BE server thì cần truyền Authorization vào header
          const accessToken = (options?.headers as any).Authorization.split(
            'Bearer '
          )[1];
          redirect(`/logout?accessToken=${accessToken}`);
        }
      }
    } else {
      throw new HttpError(data);
    }
  }

  if (typeof window !== 'undefined') {
    const normalizedPath = normalizePath(url);
    if (normalizedPath === 'api/auth/login') {
      const { accessToken, refreshToken } = (payload as LoginResType).data;
      localStorage.setItem(ACCESS_TOKEN, accessToken);
      localStorage.setItem(REFRESH_TOKEN, refreshToken);
    } else if (normalizedPath === 'api/auth/logout') {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
    }
  }
  return data;
};

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('GET', url, options);
  },
  post<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('POST', url, { ...options, body });
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('PUT', url, { ...options, body });
  },
  delete<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined
  ) {
    return request<Response>('DELETE', url, options);
  },
};
export default http;

export class UnprocessableEntityError extends HttpError {
  status: typeof UNPROCESSABLE_ENTITY_STATUS; // 422
  payload: UnprocessableEntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: typeof UNPROCESSABLE_ENTITY_STATUS; // 422
    payload: UnprocessableEntityErrorPayload;
  }) {
    super({ status, payload, message: 'Unprocessable Entity Error' });
    this.status = status;
    this.payload = payload;
  }
}
