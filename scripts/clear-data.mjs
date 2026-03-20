import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('清空数据...');
  await prisma.chatMessage.deleteMany({});
  await prisma.roomMember.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.script.deleteMany({});
  console.log('✅ 已清空房间、剧本、消息数据');
}

clearData().catch(console.error).finally(() => prisma.$disconnect());
