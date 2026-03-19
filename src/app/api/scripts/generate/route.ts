import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/lib/ai';
import { generateImage } from '@/lib/image';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { title, body, answers, zhihuToken } = await req.json();

  if (!title || !body) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  // 检查是否已生成过
  const existing = await prisma.script.findFirst({
    where: { sourceEvent: zhihuToken }
  });

  if (existing) {
    return NextResponse.json({ success: true, data: existing, cached: true });
  }

  // 生成新剧本
  console.log('[Generate] Starting script generation...');
  const scriptData = await generateScript(title, body, answers || []);
  console.log('[Generate] Script data:', scriptData ? 'Success' : 'Failed');

  if (!scriptData) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }

  // 生成封面图
  const imagePrompt = `${title}，剧本杀场景，电影海报风格，戏剧性，视觉冲击力，电影大片，氛围感，oc渲染，光线追踪，质感真实`;
  const coverImage = await generateImage(imagePrompt);
  console.log('[Generate] Cover image:', coverImage || 'Failed');

  // 保存到数据库
  try {
    const script = await prisma.script.create({
      data: {
        title: scriptData.title,
        description: scriptData.description,
        sourceEvent: zhihuToken || title,
        scriptType: scriptData.scriptType,
        difficulty: scriptData.difficulty,
        duration: scriptData.duration,
        background: JSON.stringify(scriptData.background),
        roles: JSON.stringify(scriptData.roles),
        scenes: JSON.stringify(scriptData.scenes),
        endings: JSON.stringify(scriptData.endings),
        coverImage: coverImage,
      }
    });
    return NextResponse.json({ success: true, data: script });
  } catch (e: any) {
    console.error('[Generate] DB error:', e.message);
    return NextResponse.json({ error: 'Database error: ' + e.message }, { status: 500 });
  }
}
