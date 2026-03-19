import { NextRequest, NextResponse } from 'next/server';
import { getZhihuHotList } from '@/lib/zhihu';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topCnt = parseInt(searchParams.get('top_cnt') || '50');
  const publishInHours = parseInt(searchParams.get('publish_in_hours') || '72');

  const hotList = await getZhihuHotList(topCnt, publishInHours);
  return NextResponse.json({ success: true, data: hotList });
}
