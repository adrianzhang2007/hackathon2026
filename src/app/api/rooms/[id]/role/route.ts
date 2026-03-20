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
    const { roleId } = await request.json();

    // 获取房间信息
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        script: true,
        members: true,
      },
    });

    if (!room) {
      return NextResponse.json({ code: 404, message: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json({ code: 400, message: 'Room is not waiting for players' }, { status: 400 });
    }

    // 检查角色是否已被其他真实玩家选择
    const existingMemberWithRole = room.members.find(
      (m) => m.roleId === roleId && !m.isDemo && m.userId !== user.id
    );
    if (existingMemberWithRole) {
      return NextResponse.json({ code: 400, message: '该角色已被选择' }, { status: 400 });
    }

    // 获取剧本角色信息，并为没有 id 的角色生成 id
    const scriptRoles = JSON.parse(room.script!.roles).map((r: any, index: number) => ({
      ...r,
      id: r.id || `role_${index + 1}`
    }));
    console.log('[API SelectRole] Looking for roleId:', roleId, 'Available roles:', scriptRoles.map((r: any) => ({ id: r.id, name: r.name })));
    const selectedRole = scriptRoles.find((r: any) => r.id === roleId);
    if (!selectedRole) {
      return NextResponse.json({ code: 400, message: '角色不存在' }, { status: 400 });
    }

    // 更新当前用户的角色
    const member = await prisma.roomMember.updateMany({
      where: {
        roomId: id,
        userId: user.id,
      },
      data: {
        roleId: roleId,
        roleName: selectedRole.name,
        isReady: true, // 选择角色后自动准备
      },
    });

    if (member.count === 0) {
      return NextResponse.json({ code: 404, message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: 0,
      message: '角色选择成功',
      data: { roleId, roleName: selectedRole.name },
    });
  } catch (error) {
    console.error('Error selecting role:', error);
    return NextResponse.json({ code: 500, message: 'Failed to select role' }, { status: 500 });
  }
}
