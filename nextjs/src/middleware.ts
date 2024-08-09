import { NextRequest, NextResponse } from 'next/server';

import { hasExpired, refreshToken } from './lib/token-utils';
import {
  applySetCookie,
  deleteIronSession,
  ironSession,
  updateIronSession,
} from './lib/iron-auth';

//
// Middleware base on IronSession implementation
//
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProfileRoute = path === '/profile';
  const isLoginRoute = path === '/login';

  let response = NextResponse.next();
  const session = await ironSession();

  if (isLoginRoute && session.isAuth) {
    response = NextResponse.redirect(new URL('/profile', request.nextUrl));
  }

  if (session.isAuth && hasExpired(session.expiresAt)) {
    const refreshed = await refreshToken(session.refreshToken);

    if (refreshed) {
      await updateIronSession(response, {
        user: session.user,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
      });
    } else {
      response = NextResponse.redirect(new URL('/login', request.nextUrl));
      await deleteIronSession(response);
    }

    applySetCookie(request, response);
    return response;
  }

  if (isProfileRoute && !session) {
    response = NextResponse.redirect(new URL('/login', request.nextUrl));
    await deleteIronSession(response);
    applySetCookie(request, response);
  }

  return response;
}

//
// Middleware base on PlainSession implementation
//
// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;
//   const isProfileRoute = path === '/profile';
//   const isLoginRoute = path === '/login';

//   const session = await getPlainSession();
//   let response = NextResponse.next();

//   if (isLoginRoute && session) {
//     response = NextResponse.redirect(new URL('/profile', request.nextUrl));
//   }

//   if (session && hasExpired(session.expiresAt)) {
//     const response = NextResponse.next();
//     const refreshed = await refreshToken(session.refreshToken);

//     if (refreshed) {
//       await updatePlainSession(response, {
//         user: session.user,
//         accessToken: refreshed.accessToken,
//         refreshToken: refreshed.refreshToken,
//         expiresAt: refreshed.expiresAt,
//       });
//     } else {
//       deletePlainSession(response);
//       return NextResponse.redirect(new URL('/login', request.nextUrl));
//     }
//   }

//   if (isProfileRoute && !session) {
//     deletePlainSession(response);
//     return NextResponse.redirect(new URL('/login', request.nextUrl));
//   }

//   return response;
// }

export const config = {
  matcher: ['/profile', '/login'],
};
