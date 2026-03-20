import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取剧本列表
export async function GET() {
  try {
    const scripts = await prisma.script.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      code: 0,
      data: scripts.map((script: {
        id: string;
        title: string;
        description: string | null;
        sourceEvent: string | null;
        scriptType: string;
        difficulty: number;
        duration: number;
        background: string | null;
        roles: string;
        scenes: string;
        endings: string;
        createdAt: Date;
        updatedAt: Date;
      }) => ({
        ...script,
        background: script.background ? JSON.parse(script.background) : null,
        roles: JSON.parse(script.roles).map((r: any, index: number) => ({ ...r, id: r.id || `role_${index + 1}` })),
        scenes: JSON.parse(script.scenes),
        endings: JSON.parse(script.endings),
      })),
    });
  } catch (error) {
    console.error('Error getting scripts:', error);
    return NextResponse.json({ code: 500, message: 'Failed to get scripts' }, { status: 500 });
  }
}
