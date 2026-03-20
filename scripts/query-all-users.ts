import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 查询所有用户
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  
  console.log(`=== 所有用户 (共 ${users.length} 个) ===\n`);
  
  users.forEach((user, index) => {
    console.log(`[${index + 1}] ID: ${user.id}`);
    console.log(`    SecondMe ID: ${user.secondmeUserId}`);
    console.log(`    名称: ${user.name}`);
    console.log(`    创建时间: ${user.createdAt}`);
    console.log('');
  });
  
  // 查询包含 861 的用户
  console.log('\n=== 搜索包含 861 的用户 ===');
  const usersWith861 = users.filter(u => u.secondmeUserId.includes('861'));
  if (usersWith861.length === 0) {
    console.log('未找到包含 861 的用户');
  } else {
    usersWith861.forEach((user, index) => {
      console.log(`[${index + 1}] SecondMe ID: ${user.secondmeUserId}`);
    });
  }
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
