import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetUserName = '8618610708761';
  
  // 查找用户 (通过 name 字段)
  const user = await prisma.user.findFirst({
    where: { name: targetUserName },
  });
  
  if (!user) {
    console.log(`用户 ${targetUserName} 不存在`);
    await prisma.$disconnect();
    return;
  }
  
  console.log('=== 用户信息 ===');
  console.log(`ID: ${user.id}`);
  console.log(`SecondMe ID: ${user.secondmeUserId}`);
  console.log(`名称: ${user.name}`);
  console.log(`头像: ${user.avatar}`);
  console.log(`创建时间: ${user.createdAt}`);
  
  // 查询用户参与的所有房间
  const roomMembers = await prisma.roomMember.findMany({
    where: { userId: user.id },
    include: {
      room: {
        include: {
          script: {
            select: {
              id: true,
              title: true,
              scriptType: true,
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  });
  
  console.log(`\n=== 用户参与的房间 (共 ${roomMembers.length} 个) ===`);
  
  if (roomMembers.length === 0) {
    console.log('该用户没有参与任何房间');
  } else {
    roomMembers.forEach((member, index) => {
      console.log(`\n[${index + 1}] 房间 ID: ${member.roomId}`);
      console.log(`   房间状态: ${member.room.status}`);
      console.log(`   剧本名称: ${member.room.script?.title || 'N/A'}`);
      console.log(`   剧本类型: ${member.room.script?.scriptType || 'N/A'}`);
      console.log(`   角色名称: ${member.roleName || '未选择'}`);
      console.log(`   是否准备: ${member.isReady}`);
      console.log(`   是否Demo: ${member.isDemo}`);
      console.log(`   加入时间: ${member.joinedAt}`);
      if (member.leftAt) {
        console.log(`   离开时间: ${member.leftAt}`);
      }
    });
  }
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
