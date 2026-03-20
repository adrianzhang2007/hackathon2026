import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const targetUserName = '8618610708761';
  
  // 查找用户
  const user = await prisma.user.findFirst({
    where: { name: targetUserName },
  });
  
  if (!user) {
    console.log(`用户 ${targetUserName} 不存在`);
    await prisma.$disconnect();
    return;
  }
  
  console.log('=== 当前用户信息 ===');
  console.log(`ID: ${user.id}`);
  console.log(`当前名称: ${user.name}`);
  
  // 将最后四位替换为 ***
  const originalName = user.name;
  const maskedName = originalName.slice(0, -4) + '****';
  
  console.log(`\n新名称: ${maskedName}`);
  
  // 更新用户名称
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: maskedName },
  });
  
  console.log('\n=== 更新成功 ===');
  console.log(`ID: ${updatedUser.id}`);
  console.log(`新名称: ${updatedUser.name}`);
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
