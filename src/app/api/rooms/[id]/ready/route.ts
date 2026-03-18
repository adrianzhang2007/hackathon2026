import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startRoomGame } from '@/lib/game-runner';

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
    const { isReady, roleId } = await request.json();

    // 更新成员状态
    const member = await prisma.roomMember.updateMany({
      where: {
        roomId: id,
        userId: user.id,
      },
      data: {
        isReady: isReady ?? true,
        ...(roleId && { roleId }),
      },
    });

    if (member.count === 0) {
      return NextResponse.json({ code: 404, message: 'Member not found' }, { status: 404 });
    }

    // 检查是否所有成员都准备好了
    const members = await prisma.roomMember.findMany({
      where: { roomId: id },
    });

    const allReady = members.length > 0 && members.every((m: { isReady: boolean }) => m.isReady);

    if (allReady && members.length >= 2) {
      // 自动启动游戏
      await startRoomGame(id);
    }

    return NextResponse.json({
      code: 0,
      data: { ready: isReady ?? true, allReady },
    });
  } catch (error) {
    console.error('Error updating ready status:', error);
    return NextResponse.json({ code: 500, message: 'Failed to update ready status' }, { status: 500 });
  }
}
