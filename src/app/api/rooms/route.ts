import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取房间列表
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        status: { in: ['waiting', 'ready', 'playing'] },
      },
      include: {
        script: {
          select: {
            id: true,
            title: true,
            scriptType: true,
            difficulty: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      code: 0,
      data: rooms,
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    return NextResponse.json({ code: 500, message: 'Failed to get rooms' }, { status: 500 });
  }
}

// 创建房间
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { scriptId } = await request.json();

    if (!scriptId) {
      return NextResponse.json({ code: 400, message: 'Script ID is required' }, { status: 400 });
    }

    // 创建房间
    const room = await prisma.room.create({
      data: {
        scriptId,
        status: 'waiting',
      },
    });

    // 创建者加入房间
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: user.id,
        isReady: false,
        isDemo: false,
      },
    });

    return NextResponse.json({
      code: 0,
      data: room,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ code: 500, message: 'Failed to create room' }, { status: 500 });
  }
}
