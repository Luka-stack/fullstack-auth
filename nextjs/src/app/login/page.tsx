import { CredentialForm } from './CredentialForm';

export default async function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="border p-4 rounded-md border-white/20 flex flex-col w-fit space-y-4">
        <CredentialForm />

        <form>
          <button
            type="submit"
            className="bg-blue-900 rounded-md px-4 py-2 w-full"
          >
            Login with Google
          </button>
        </form>
      </div>
    </main>
  );
}
