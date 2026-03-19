import { NextRequest } from 'next/server';
import { searchGlobal } from '@/lib/zhihu';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const count = parseInt(searchParams.get('count') || '10');

  if (!query) return Response.json({ error: 'query required' }, { status: 400 });

  const data = await searchGlobal(query, count);
  return Response.json({ success: true, data });
}
