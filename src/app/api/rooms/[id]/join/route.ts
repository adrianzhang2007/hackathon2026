import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // 检查房间是否存在
    const room = await prisma.room.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!room) {
      return NextResponse.json({ code: 404, message: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json({ code: 400, message: 'Room is not waiting for players' }, { status: 400 });
    }

    // 检查用户是否已在房间中
    const existingMember = room.members.find((m: { userId: string }) => m.userId === user.id);
    if (existingMember) {
      return NextResponse.json({ code: 0, data: existingMember });
    }

    // 加入房间
    const member = await prisma.roomMember.create({
      data: {
        roomId: id,
        userId: user.id,
        isReady: false,
        isDemo: false,
      },
    });

    return NextResponse.json({
      code: 0,
      data: member,
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ code: 500, message: 'Failed to join room' }, { status: 500 });
  }
}
