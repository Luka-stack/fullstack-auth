import 'server-only';

import { jwtVerify, SignJWT } from 'jose';
import { cookies, headers } from 'next/headers';
import {
  parseCookie,
  RequestCookie,
  ResponseCookie,
} from 'next/dist/compiled/@edge-runtime/cookies';

import { User } from '@/types';
import { NextResponse } from 'next/server';

const SessionConfig = {
  cookieName: 'plain-session',
  algorithm: 'HS256',
  key: new TextEncoder().encode(
    'very-fucking-long-secret-password-so-noone-can-decode'
  ),
} as const;

const CookieConfig: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: false, // unless in production
  sameSite: 'lax',
  path: '/',
} as const;

export type PlainSession = {
  isAuth: boolean;

  user: User;

  accessToken: string;
  refreshToken: string;

  expiresAt: string;
};

export async function createPlainSession(
  user: User,
  accessToken: string,
  refreshToken: string,
  expiresAt: string
) {
  const cookieExpireDate = new Date(
    new Date(expiresAt).getTime() + 7 * 24 * 60 * 60 * 1000
  );

  const session = await encrypt({
    user,
    accessToken,
    refreshToken,
    isAuth: true,
    expiresAt,
  });

  cookies().set(SessionConfig.cookieName, session, {
    ...CookieConfig,
    expires: cookieExpireDate,
  });
}

export function deletePlainSession(response?: NextResponse) {
  if (response) {
    response.cookies.delete(SessionConfig.cookieName);
  } else {
    cookies().delete(SessionConfig.cookieName);
  }
}

export async function getPlainSession(): Promise<PlainSession | null> {
  const cookie = getCookie()?.value;
  if (!cookie) {
    return null;
  }

  const session = await decrypt(cookie);
  if (!session) {
    return null;
  }

  return session as PlainSession;
}

export async function updatePlainSession(
  res: NextResponse,
  payload: Omit<PlainSession, 'isAuth'>
): Promise<void> {
  const expiresAt = new Date(
    new Date(payload.expiresAt).getTime() + 7 * 24 * 60 * 60 * 1000
  );

  const session = await encrypt({
    isAuth: true,
    user: payload.user,
    expiresAt: payload.expiresAt,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });

  res.cookies.set(SessionConfig.cookieName, session, {
    ...CookieConfig,
    expires: expiresAt,
  });
}

async function encrypt(session: PlainSession) {
  return new SignJWT(session)
    .setProtectedHeader({
      alg: SessionConfig.algorithm,
    })
    .setIssuedAt()
    .setExpirationTime('1hr')
    .sign(SessionConfig.key);
}

async function decrypt(session: string) {
  try {
    const { payload } = await jwtVerify(session, SessionConfig.key, {
      algorithms: [SessionConfig.algorithm],
    });

    return payload;
  } catch (error) {
    console.error('DECRYPT ERROR:', error);
    return null;
  }
}

function getCookie(): RequestCookie | undefined {
  const allCookiesAsString = headers().get('Set-Cookie');

  if (!allCookiesAsString) {
    return cookies().get(SessionConfig.cookieName);
  }

  const allCookiesAsObjects = allCookiesAsString
    .split(', ')
    .map((singleCookieAsString) => parseCookie(singleCookieAsString.trim()));

  const targetCookieAsObject = allCookiesAsObjects.find(
    (singleCookieAsObject) =>
      typeof singleCookieAsObject.get(SessionConfig.cookieName) == 'string'
  );

  if (!targetCookieAsObject) {
    return cookies().get(SessionConfig.cookieName);
  }

  return {
    name: SessionConfig.cookieName,
    value: targetCookieAsObject.get(SessionConfig.cookieName) ?? '',
  };
}
