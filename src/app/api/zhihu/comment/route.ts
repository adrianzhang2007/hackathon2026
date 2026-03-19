import { NextRequest } from 'next/server';
import { createComment, deleteComment, getCommentList } from '@/lib/zhihu';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentToken = searchParams.get('content_token');
  const contentType = searchParams.get('content_type') as 'pin' | 'comment';
  const pageNum = parseInt(searchParams.get('page_num') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '10');

  if (!contentToken || !contentType) {
    return Response.json({ error: 'content_token, content_type required' }, { status: 400 });
  }

  const data = await getCommentList(contentToken, contentType, pageNum, pageSize);
  return Response.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.comment_id) {
    const result = await deleteComment(body.comment_id);
    return Response.json(result);
  }

  if (body.content_token && body.content_type && body.content) {
    const result = await createComment(body.content_token, body.content_type, body.content);
    return Response.json(result);
  }

  return Response.json({ error: 'Invalid request' }, { status: 400 });
}
