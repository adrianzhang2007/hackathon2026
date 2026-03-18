import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fillDemoBots, removeDemoBots } from '@/lib/demo';
import { Script } from '@/types';

// POST: 填充 DEMO 机器人
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
      include: { script: true },
    });

    if (!room) {
      return NextResponse.json({ code: 404, message: 'Room not found' }, { status: 404 });
    }

    if (!room.script) {
      return NextResponse.json({ code: 400, message: 'Room has no script' }, { status: 400 });
    }

    // 检查当前用户是否已选择角色
    const currentMember = await prisma.roomMember.findFirst({
      where: {
        roomId: id,
        userId: user.id,
        isDemo: false,
      },
    });

    if (!currentMember) {
      return NextResponse.json({ code: 403, message: '您不在房间中' }, { status: 403 });
    }

    if (!currentMember.roleId) {
      return NextResponse.json({ code: 400, message: '请先选择角色，再填充 AI 玩家' }, { status: 400 });
    }

    // 解析剧本数据
    const script = {
      ...room.script,
      description: room.script.description || undefined,
      sourceEvent: room.script.sourceEvent || undefined,
      background: room.script.background ? JSON.parse(room.script.background) : undefined,
      roles: JSON.parse(room.script.roles),
      scenes: JSON.parse(room.script.scenes),
      endings: JSON.parse(room.script.endings),
    } as Script;

    // 填充 DEMO 机器人
    const demoBots = await fillDemoBots(id, script);

    return NextResponse.json({
      code: 0,
      data: {
        message: `已填充 ${demoBots.length} 个 DEMO 机器人`,
        bots: demoBots,
      },
    });
  } catch (error) {
    console.error('Error filling demo bots:', error);
    return NextResponse.json({ code: 500, message: 'Failed to fill demo bots' }, { status: 500 });
  }
}

// DELETE: 移除 DEMO 机器人
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

    await removeDemoBots(id);

    return NextResponse.json({
      code: 0,
      message: 'DEMO 机器人已移除',
    });
  } catch (error) {
    console.error('Error removing demo bots:', error);
    return NextResponse.json({ code: 500, message: 'Failed to remove demo bots' }, { status: 500 });
  }
}
