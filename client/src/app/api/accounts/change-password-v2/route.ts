import accountApiRequest from '@/apiRequests/account';
import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from '@/constants/cookiesKey';
import { ChangePasswordV2BodyType } from '@/schemaValidations/account.schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { HttpError } from '@/lib/http';

type DecodedTokenType = {
  exp: number;
};

export async function PUT(request: Request) {
  const body = (await request.json()) as ChangePasswordV2BodyType;
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  if (!accessToken) {
    return (
      Response.json({
        message: 'Missing access token',
      }),
      { status: 401 }
    );
  }

  try {
    const { payload } = await accountApiRequest.serverChangePasswordV2(
      accessToken,
      body
    );
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      payload.data;

    const decodedAccessToken = jwt.decode(newAccessToken) as DecodedTokenType;
    const decodedRefreshToken = jwt.decode(newRefreshToken) as DecodedTokenType;

    if (!decodedAccessToken || !decodedRefreshToken) {
      return Response.json(
        { message: 'Invalid token format' },
        { status: 500 }
      );
    }

    // Set expiration time for cookies
    cookieStore.set(ACCESS_TOKEN_COOKIE_KEY, newAccessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE_KEY, newRefreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    });

    return Response.json(payload);
  } catch (error: any) {
    console.error('>>> Failed to change password: ', error);
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    }
    return Response.json(
      {
        message: 'Failed to change password',
      },
      { status: error.status ?? 500 }
    );
  }
}
