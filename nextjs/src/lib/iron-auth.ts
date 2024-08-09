import 'server-only';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession, SessionOptions } from 'iron-session';
import {
  RequestCookies,
  ResponseCookies,
} from 'next/dist/server/web/spec-extension/cookies';

import { User } from '@/types';

export interface IronSession {
  isAuth: boolean;

  user: User;

  accessToken: string;
  refreshToken: string;

  expiresAt: string;
}

export const SessionConfig: SessionOptions = {
  password: 'very-fucking-long-secret-password-so-noone-can-decode',
  cookieName: 'iron-session',
  cookieOptions: {
    secure: false,
    sameSite: 'lax',
    path: '/',
  },
} as const;

export async function ironSession(response?: NextResponse) {
  if (response) {
    return getIronSession<IronSession>(response.cookies, SessionConfig);
  }

  return getIronSession<IronSession>(cookies(), SessionConfig);
}

export async function createIronSession(
  user: User,
  accessToken: string,
  refreshToken: string,
  expiresAt: string
) {
  const session = await ironSession();

  session.isAuth = true;
  session.user = user;
  session.accessToken = accessToken;
  session.refreshToken = refreshToken;
  session.expiresAt = expiresAt;

  await session.save();
}

export async function updateIronSession(
  res: NextResponse,
  payload: Omit<IronSession, 'isAuth'>
) {
  const session = await getIronSession<IronSession>(res.cookies, SessionConfig);

  session.user = payload.user;

  session.isAuth = true;

  session.expiresAt = payload.expiresAt;
  session.accessToken = payload.accessToken;
  session.refreshToken = payload.refreshToken;

  await session.save();
}

export async function deleteIronSession(response?: NextResponse) {
  if (response) {
    const session = await getIronSession<IronSession>(
      response.cookies,
      SessionConfig
    );

    session.isAuth = false;

    await session.save();
  }

  const session = await ironSession();
  session.destroy();
}

export function applySetCookie(req: NextRequest, res: NextResponse): void {
  // parse the outgoing Set-Cookie header
  const setCookies = new ResponseCookies(res.headers);

  // Build a new Cookie header for the request by adding the setCookies
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));

  // set “request header overrides” on the outgoing response
  NextResponse.next({
    request: { headers: newReqHeaders },
  }).headers.forEach((value, key) => {
    if (
      key === 'x-middleware-override-headers' ||
      key.startsWith('x-middleware-request-')
    ) {
      res.headers.set(key, value);
    }
  });
}
