import { NextResponse } from 'next/server';
import { getAuthenticatedUserId } from '@/app/lib/auth';

// Type for Next.js redirect error
interface RedirectError extends Error {
  digest?: string;
}

export const runtime = 'edge';
const WORKER_URL = process.env.WORKER_URL || 'http://127.0.0.1:8787';

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.WORKER_URL}/api/milestones`, {
      headers: {
        'X-User-Id': userId,
      },
    });

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

    console.error('Failed to fetch milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${WORKER_URL}/api/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        title: body.title,
        description: body.description || '',
        date: body.date,
        completed: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Worker response error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to create milestone' },
        { status: response.status }
      );
    }

    const milestone = await response.json();
    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Failed to create milestone:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
