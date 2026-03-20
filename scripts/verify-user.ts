import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 通过 ID 查找用户验证
  const user = await prisma.user.findUnique({
    where: { id: 'cmmyn0htx0088w0e9yx39643x' },
  });
  
  if (!user) {
    console.log('用户不存在');
    await prisma.$disconnect();
    return;
  }
  
  console.log('=== 验证结果 ===');
  console.log(`ID: ${user.id}`);
  console.log(`SecondMe ID: ${user.secondmeUserId}`);
  console.log(`名称: ${user.name}`);
  console.log(`更新时间: ${user.updatedAt}`);
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
