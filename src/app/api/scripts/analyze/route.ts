import { NextRequest, NextResponse } from 'next/server';
import { analyzeZhihuTopic } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const { title, body } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  const analysis = await analyzeZhihuTopic(title, body);

  if (!analysis) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: analysis });
}
