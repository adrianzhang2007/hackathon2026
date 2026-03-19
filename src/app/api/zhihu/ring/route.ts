import { NextRequest } from 'next/server';
import { getRingDetail } from '@/lib/zhihu';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ringId = searchParams.get('ring_id');
  const pageNum = parseInt(searchParams.get('page_num') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '20');

  if (!ringId) return Response.json({ error: 'ring_id required' }, { status: 400 });

  const data = await getRingDetail(ringId, pageNum, pageSize);
  return Response.json({ success: true, data });
}
