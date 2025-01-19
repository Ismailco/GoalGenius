import { auth } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) {
    console.warn('No authenticated user found');
    return null;
  }
  return userId;
}

export async function createUserIfNotExists(): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    console.warn('No authenticated user found during user creation');
    return;
  }

  try {
    const response = await fetch(`${process.env.WORKER_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({
        id: userId,
        name: 'Anonymous', // We'll update this later with actual user data
        email: '',
      }),
    });

    if (!response.ok) {
      console.error('Failed to create user:', await response.text());
    }
  } catch (error) {
    console.error('Error creating user:', error);
  }
}
