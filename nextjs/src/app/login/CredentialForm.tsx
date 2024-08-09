'use client';

import { signIn } from '@/actions/iron-actions';
// import { signIn } from '@/actions/plain-actions';
import { useFormState, useFormStatus } from 'react-dom';

export function CredentialForm() {
  // const [state, action] = useFormState(signIn, undefined);
  const [state, action] = useFormState(signIn, undefined);

  return (
    <form className="space-y-5" action={action}>
      {state?.message && (
        <div className="border border-red-900 bg-red-500/20 text-sm p-2 rounded-md">
          {state.message}
        </div>
      )}

      <div className="grid gap-1.5">
        <label>Email</label>
        <input
          required
          type="email"
          name="email"
          autoComplete="off"
          className="bg-transparent border border-white/20 rounded-md px-2 py-1"
        />
      </div>

      <div className="grid gap-1.5">
        <label>Password</label>
        <input
          required
          type="password"
          name="password"
          autoComplete="off"
          className="bg-transparent border border-white/20 rounded-md px-2 py-1"
        />
      </div>

      <LoginButton />
    </form>
  );
}

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="bg-green-900 rounded-md px-4 py-2 w-full"
      disabled={pending}
    >
      Login
    </button>
  );
}
