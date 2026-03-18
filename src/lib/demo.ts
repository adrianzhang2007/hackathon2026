import { prisma } from './prisma';
import { Script, Role } from '@/types';

// DEMO 机器人名称池
const DEMO_BOT_NAMES = [
  '小剧场助手', '剧本精灵', '故事讲述者', '角色扮演者',
  '戏剧大师', '情境演员', '剧场导游', '剧本陪伴者',
  '角色填补员', '戏剧同伴'
];

// 创建独立的 DEMO 机器人用户
export async function createDemoBotUser(roleName: string, index: number) {
  const uniqueId = `demo-bot-${Date.now()}-${index}`;
  const botName = DEMO_BOT_NAMES[index % DEMO_BOT_NAMES.length];

  const demoUser = await prisma.user.create({
    data: {
      secondmeUserId: uniqueId,
      name: `${botName}(${roleName})`,
      avatar: '🤖',
      accessToken: 'demo-token',
      refreshToken: 'demo-refresh',
      tokenExpiresAt: new Date('2099-12-31'),
    },
  });

  return demoUser;
}

// 为房间填充 DEMO 机器人
export async function fillDemoBots(roomId: string, script: Script) {
  const roles: Role[] = Array.isArray(script.roles) ? script.roles : JSON.parse(script.roles as string);

  // 获取当前房间成员
  const existingMembers = await prisma.roomMember.findMany({
    where: { roomId },
  });

  const existingRoleIds = existingMembers
    .map(m => m.roleId)
    .filter((id): id is string => !!id);

  // 找出未分配的角色
  const unassignedRoles = roles.filter(role => !existingRoleIds.includes(role.id));

  // 为每个未分配的角色创建独立的 DEMO 机器人用户
  const demoBots = [];
  for (let i = 0; i < unassignedRoles.length; i++) {
    const role = unassignedRoles[i];

    // 为每个角色创建独立的用户
    const demoUser = await createDemoBotUser(role.name, i);

    const member = await prisma.roomMember.create({
      data: {
        roomId,
        userId: demoUser.id,
        roleId: role.id,
        roleName: role.name,
        isReady: true,
        isDemo: true,
      },
    });

    demoBots.push({
      ...member,
      user: demoUser,
      roleInfo: role,
    });
  }

  return demoBots;
}

// 移除房间的 DEMO 机器人
export async function removeDemoBots(roomId: string) {
  // 先获取所有 DEMO 成员
  const demoMembers = await prisma.roomMember.findMany({
    where: {
      roomId,
      isDemo: true,
    },
  });

  // 删除成员记录
  await prisma.roomMember.deleteMany({
    where: {
      roomId,
      isDemo: true,
    },
  });

  // 删除对应的 DEMO 用户
  const demoUserIds = demoMembers.map(m => m.userId);
  for (const userId of demoUserIds) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.log('Failed to delete demo user:', userId);
    }
  }
}

// DEMO 机器人发言内容生成
export async function generateDemoMessage(
  role: Role,
  scene: any,
  recentMessages: any[]
): Promise<string> {
  const templates = [
    `（${role.name}静静地看着周围，若有所思）`,
    `（${role.name}叹了口气，似乎在思考什么）`,
    `（${role.name}保持着沉默，但眼神中透露出复杂的情绪）`,
    `（${role.name}轻轻点了点头）`,
    `（${role.name}欲言又止，最终还是没有开口）`,
    `（${role.name}环顾四周，表情凝重）`,
    `（${role.name}低头看着地面，似乎在整理思绪）`,
    `（${role.name}抬起头，目光坚定了一些）`,
  ];

  // 随机选择一个模板
  const message = templates[Math.floor(Math.random() * templates.length)];

  return message;
}

// 检查是否需要触发 DEMO 机器人发言
export async function shouldDemoBotRespond(roomId: string): Promise<boolean> {
  const recentMessages = await prisma.chatMessage.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  // 如果最近没有消息，不触发
  if (recentMessages.length === 0) return false;

  // 如果最后一条消息是 DEMO 发的，不触发
  const lastMessage = recentMessages[0];
  const lastMessageUser = await prisma.user.findUnique({
    where: { id: lastMessage.userId },
  });

  if (lastMessageUser?.secondmeUserId?.startsWith('demo-bot-')) return false;

  // 检查时间间隔（超过 10 秒）
  const timeDiff = Date.now() - lastMessage.createdAt.getTime();
  return timeDiff > 10000;
}
