import { NextRequest } from 'next/server';
import { DELETE as deleteGoal, GET as getGoals } from '../route';

type RouteContext = { params: Promise<{ id: string }> };

function baseRequest(request: NextRequest, id: string) {
  const url = new URL(request.url);
  url.pathname = '/api/goals';
  url.search = `?id=${encodeURIComponent(id)}`;
  return new NextRequest(url, { headers: request.headers });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return getGoals(baseRequest(request, (await context.params).id));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return deleteGoal(baseRequest(request, (await context.params).id));
}
