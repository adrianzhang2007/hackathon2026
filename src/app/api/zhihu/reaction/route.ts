import { NextRequest } from 'next/server';
import { likeContent } from '@/lib/zhihu';

export async function POST(req: NextRequest) {
  const { content_token, content_type, action_value } = await req.json();

  if (!content_token || !content_type || action_value === undefined) {
    return Response.json({ error: 'content_token, content_type, action_value required' }, { status: 400 });
  }

  const result = await likeContent(content_token, content_type, action_value);
  return Response.json(result);
}
