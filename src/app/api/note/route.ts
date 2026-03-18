import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 添加笔记
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, scriptId, roomId } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ code: 400, message: 'Content is required' }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        userId: user.id,
        content,
        scriptId,
        roomId,
      },
    });

    return NextResponse.json({
      code: 0,
      data: note,
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json({ code: 500, message: 'Failed to create note' }, { status: 500 });
  }
}

// 获取用户笔记列表
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notes = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      code: 0,
      data: notes,
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    return NextResponse.json({ code: 500, message: 'Failed to get notes' }, { status: 500 });
  }
}
