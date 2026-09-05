import { NextRequest } from 'next/server';
import { GET as getMilestones, DELETE as deleteMilestone } from '../route';

type RouteContext = { params: Promise<{ id: string }> };

function baseRequest(request: NextRequest, id: string) {
  const url = new URL(request.url);
  url.pathname = '/api/milestones';
  url.search = `?id=${encodeURIComponent(id)}`;
  return new NextRequest(url, { headers: request.headers });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return getMilestones(baseRequest(request, (await context.params).id));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return deleteMilestone(baseRequest(request, (await context.params).id));
}
