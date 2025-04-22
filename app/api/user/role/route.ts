import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Verify the user is authenticated
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query the user table to get the role for this user
    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    // Return the role or default to 'client' if not found
    const role = result.length > 0 ? result[0].role : 'client';

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
