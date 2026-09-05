import { NextRequest } from 'next/server';
import { GET as getNotes, DELETE as deleteNote } from '../route';

type RouteContext = { params: Promise<{ id: string }> };

function baseRequest(request: NextRequest, id: string) {
  const url = new URL(request.url);
  url.pathname = '/api/notes';
  url.search = `?id=${encodeURIComponent(id)}`;
  return new NextRequest(url, { headers: request.headers });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return getNotes(baseRequest(request, (await context.params).id));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return deleteNote(baseRequest(request, (await context.params).id));
}
