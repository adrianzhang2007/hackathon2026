import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取房间列表
export async function GET() {
  try {
    // 获取当前用户信息
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.id;

    const rooms = await prisma.room.findMany({
      where: {
        status: { in: ['waiting', 'ready', 'playing', 'ended'] },
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
          orderBy: { joinedAt: 'asc' },
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

    // 过滤房间：等待中状态、不是自己创建、且没有真人选择角色的房间不展示
    let filteredRooms = rooms.filter((room) => {
      // 只处理等待中状态的房间
      if (room.status !== 'waiting') {
        return true;
      }

      // 获取真人成员（非 Demo）
      const realMembers = room.members.filter((m) => !m.isDemo);

      // 判断是否有真人选择了角色
      const hasRealPlayerWithRole = realMembers.some((m) => m.roleId);

      // 判断当前用户是否是创建者（第一个加入的真人成员）
      const creator = realMembers[0]; // 按 joinedAt 排序的第一个真人成员是创建者
      const isCreator = creator?.userId === currentUserId;

      // 如果是等待中状态，不是自己创建，且没有真人选择角色，则不展示
      if (!isCreator && !hasRealPlayerWithRole) {
        return false;
      }

      return true;
    });

    // 排序：非 ended 状态的房间在前（按 createdAt desc），ended 状态的房间排在最后
    filteredRooms.sort((a, b) => {
      const aIsEnded = a.status === 'ended';
      const bIsEnded = b.status === 'ended';

      if (aIsEnded && !bIsEnded) return 1; // a 是 ended，排在后面
      if (!aIsEnded && bIsEnded) return -1; // b 是 ended，a 排在前面

      // 都不是 ended 或都是 ended，按 createdAt 降序
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      code: 0,
      data: filteredRooms,
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
