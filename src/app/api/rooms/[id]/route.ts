import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        script: true,
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
        messages: {
          orderBy: { createdAt: 'asc' },
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
    });

    if (!room) {
      return NextResponse.json({ code: 404, message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: 0,
      data: {
        ...room,
        script: room.script ? {
          ...room.script,
          background: room.script.background ? JSON.parse(room.script.background) : null,
          roles: JSON.parse(room.script.roles),
          scenes: JSON.parse(room.script.scenes),
          endings: JSON.parse(room.script.endings),
        } : null,
      },
    });
  } catch (error) {
    console.error('Error getting room:', error);
    return NextResponse.json({ code: 500, message: 'Failed to get room' }, { status: 500 });
  }
}
