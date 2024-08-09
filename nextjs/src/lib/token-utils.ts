type Payload = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

const REFRESH_TOKEN_URL = 'http://localhost:5000/authentication/refresh-token';

export async function refreshToken(
  refreshToken: string
): Promise<Payload | null> {
  const data = await fetch(REFRESH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!data.ok) {
    return null;
  }

  return data.json();
}

export function hasExpired(expiresAt: string): boolean {
  return new Date() >= new Date(expiresAt);
}
