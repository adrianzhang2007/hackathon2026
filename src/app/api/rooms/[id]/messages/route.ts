import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取房间消息
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await prisma.chatMessage.findMany({
      where: { roomId: id },
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
    });

    return NextResponse.json({
      code: 0,
      data: messages,
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json({ code: 500, message: 'Failed to get messages' }, { status: 500 });
  }
}

// 发送消息
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
    const { content, type = 'text', roleName } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ code: 400, message: 'Content is required' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomId: id,
        userId: user.id,
        content,
        type,
        roleName,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      code: 0,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ code: 500, message: 'Failed to send message' }, { status: 500 });
  }
}
