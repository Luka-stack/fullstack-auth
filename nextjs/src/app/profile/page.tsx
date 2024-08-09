import { ironSession } from '@/lib/iron-auth';
// import { getPlainSession } from '@/lib/plain-session';

const COFFEES_ENDPOINT = 'http://localhost:5000/coffees';

async function getCoffees(token: string) {
  console.log('token', token);

  try {
    const response = await fetch(COFFEES_ENDPOINT, {
      cache: 'no-cache',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('Error fetching coffees');
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error fetching coffees');
  }

  return [];
}

export default async function ProfilePage() {
  // const session = await getPlainSession();
  const session = await ironSession();

  const coffees = await getCoffees(session!.accessToken);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <h1 className="font-bold text-xl">Profile Page</h1>
      <p>Welcome to your profile page {session!.user.email}</p>

      <div className="border p-4 rounded-md mt-10 border-white/20">
        <h2>Your Coffees</h2>
        <ul>
          {coffees.map((coffee: any) => (
            <li key={coffee.name}>{coffee.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
