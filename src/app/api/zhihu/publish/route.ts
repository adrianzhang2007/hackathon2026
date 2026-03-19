import { NextRequest } from 'next/server';
import { publishPin } from '@/lib/zhihu';

export async function POST(req: NextRequest) {
  const { ring_id, title, content, image_urls } = await req.json();

  if (!ring_id || !title || !content) {
    return Response.json({ error: 'ring_id, title, content required' }, { status: 400 });
  }

  const result = await publishPin(ring_id, title, content, image_urls);
  return Response.json(result);
}
