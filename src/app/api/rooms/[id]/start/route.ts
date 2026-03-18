import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startRoomGame, endRoomGame } from '@/lib/game-runner';

// POST: 启动房间游戏
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // 获取房间信息
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        members: {
          where: { isReady: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ code: 404, message: 'Room not found' }, { status: 404 });
    }

    // 检查是否有足够玩家
    const readyCount = room.members.length;
    if (readyCount < 2) {
      return NextResponse.json(
        { code: 400, message: '需要至少2个准备好的玩家才能开始游戏' },
        { status: 400 }
      );
    }

    // 启动游戏
    await startRoomGame(id);

    return NextResponse.json({
      code: 0,
      message: '游戏已启动',
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json({ code: 500, message: '启动游戏失败' }, { status: 500 });
  }
}

// DELETE: 停止房间游戏
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await endRoomGame(id);

    return NextResponse.json({
      code: 0,
      message: '游戏已结束',
    });
  } catch (error) {
    console.error('Error ending game:', error);
    return NextResponse.json({ code: 500, message: '结束游戏失败' }, { status: 500 });
  }
}
