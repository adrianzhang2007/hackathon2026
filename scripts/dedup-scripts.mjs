import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dedupScripts() {
  console.log('开始检查重复数据...');
  
  // 查找所有剧本
  const scripts = await prisma.script.findMany({
    orderBy: { createdAt: 'asc' }
  });
  
  console.log(`总共 ${scripts.length} 条剧本记录`);
  
  // 按 sourceEvent 分组
  const grouped = {};
  for (const script of scripts) {
    const key = script.sourceEvent || 'null';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(script);
  }
  
  // 找出重复的
  const duplicates = [];
  for (const [key, items] of Object.entries(grouped)) {
    if (items.length > 1) {
      duplicates.push({ key, count: items.length, items });
    }
  }
  
  if (duplicates.length === 0) {
    console.log('没有发现重复数据');
    return;
  }
  
  console.log(`\n发现 ${duplicates.length} 组重复数据：`);
  for (const dup of duplicates) {
    console.log(`\nSourceEvent: ${dup.key}`);
    console.log(`  重复数量: ${dup.count}`);
    console.log(`  保留: ${dup.items[0].id} (${dup.items[0].title})`);
    console.log(`  删除: ${dup.items.slice(1).map(i => i.id).join(', ')}`);
    
    // 删除重复的（保留第一条）
    for (let i = 1; i < dup.items.length; i++) {
      try {
        await prisma.script.delete({
          where: { id: dup.items[i].id }
        });
        console.log(`  ✅ 已删除: ${dup.items[i].id}`);
      } catch (e) {
        console.log(`  ❌ 删除失败: ${dup.items[i].id} - ${e.message}`);
      }
    }
  }
  
  console.log('\n去重完成');
}

dedupScripts().catch(console.error).finally(() => prisma.$disconnect());
