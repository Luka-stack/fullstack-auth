'use server';

import { redirect } from 'next/navigation';
import { createIronSession, deleteIronSession } from '@/lib/iron-auth';

import { FormState } from '@/types';

const SIGN_IN_ENDPOINT = 'http://localhost:5000/authentication/sign-in';

export async function signIn(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { message: 'Email and password are required' };
  }

  const response = await fetch(SIGN_IN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { message: 'Invalid email or password' };
  }

  const data = await response.json();
  await createIronSession(
    data.user,
    data.accessToken,
    data.refreshToken,
    data.expiresAt
  );

  redirect('/profile');
}

export async function logOut() {
  await deleteIronSession();
  redirect('/');
}
