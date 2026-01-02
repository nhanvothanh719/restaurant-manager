import authApiRequest from '@/apiRequests/auth';
import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from '@/constants/cookiesKey';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_KEY)?.value;

  // Always delete tokens stored in cookies
  cookieStore.delete(ACCESS_TOKEN_COOKIE_KEY);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_KEY);

  if (!accessToken || !refreshToken) {
    return Response.json(
      {
        message: 'Missing access token, refresh token',
      },
      { status: 200 } // MEMO: Always allow top logout
    );
  }

  try {
    const res = await authApiRequest.serverLogout({
      accessToken,
      refreshToken,
    });
    return Response.json(res.payload);
  } catch (error) {
    console.error('>>> Failed to logout: ', error);
    return Response.json(
      {
        message: 'Failed to logout',
      },
      { status: 200 } // MEMO: Always allow top logout
    );
  }
}
