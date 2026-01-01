import authApiRequest from '@/apiRequests/auth';
import { LoginBodyType } from '@/schemaValidations/auth.schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from '@/constants/cookiesKey';
import { HttpError } from '@/lib/http';

type DecodedTokenType = {
  exp: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginBodyType;
  const cookieStore = await cookies();

  try {
    // Call from route handler to BE server
    const { payload } = await authApiRequest.serverLogin(body);
    const { accessToken, refreshToken } = payload.data;

    // Get expiration time of access token and refresh token
    const decodedAccessToken = jwt.decode(accessToken) as DecodedTokenType;
    const decodedRefreshToken = jwt.decode(refreshToken) as DecodedTokenType;

    if (!decodedAccessToken || !decodedRefreshToken) {
      return Response.json(
        { message: 'Invalid token format' },
        { status: 500 }
      );
    }

    // Set expiration time for cookies
    cookieStore.set(ACCESS_TOKEN_COOKIE_KEY, accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp * 1000,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE_KEY, refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp * 1000,
    });

    return Response.json(payload);
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status });
    }
    return Response.json(
      {
        message: 'Failed to login',
      },
      { status: 500 }
    );
  }
}
