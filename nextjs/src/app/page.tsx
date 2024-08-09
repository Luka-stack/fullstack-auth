import Link from 'next/link';

// import { logOut } from '@/actions/plain-actions';
import { ironSession } from '@/lib/iron-auth';
import { logOut } from '@/actions/iron-actions';
// import { getPlainSession } from '@/lib/plain-session';

export default async function HomePage() {
  // const session = await getPlainSession();
  const session = await ironSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-3 text-xl">Home Page</h1>

      <div className="border p-4 rounded-md border-white/20 flex flex-col w-52 space-y-4">
        <Link
          href="/login"
          className="bg-green-900 rounded-md px-4 py-2 w-full text-center"
        >
          Login Page
        </Link>

        {session.isAuth && (
          <form action={logOut}>
            <button
              type="submit"
              className="bg-red-900 rounded-md px-4 py-2 w-full"
            >
              Logout
            </button>
          </form>
        )}

        <Link
          href="/profile"
          className="bg-blue-900 rounded-md px-4 py-2 mt-2 w-full text-center"
        >
          Profile Page
        </Link>
      </div>
    </main>
  );
}
