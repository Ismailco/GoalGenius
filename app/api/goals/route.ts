import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { getAuthenticatedUserId } from '@/app/lib/auth';
// Type for Next.js redirect error
interface RedirectError extends Error {
  digest?: string;
}

export const runtime = 'edge';
const WORKER_URL = process.env.WORKER_URL || 'http://127.0.0.1:8787';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${WORKER_URL}/api/goals`, {
      headers: {
        'X-User-Id': userId,
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Worker response error:', errorText);
      throw new Error(`Failed to fetch goals: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Check if it's a redirect error
    if (error instanceof Error && (error as RedirectError).digest?.includes('NEXT_REDIRECT')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Failed to fetch goals:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Creating goal with body:', body); // Debug log

    const response = await fetch(`${WORKER_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        userId,
        status: 'active',
        progress: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Worker response error:', errorData); // Debug log
      throw new Error(`Failed to create goal: ${errorData}`);
    }

    const goal = await response.json();
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Failed to create goal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create goal' },
      { status: 500 }
    );
  }
}
