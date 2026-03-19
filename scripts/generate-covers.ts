import { prisma } from '../src/lib/prisma';
import { generateImage } from '../src/lib/image';

async function main() {
  const scripts = await prisma.script.findMany({
    where: { coverImage: null }
  });

  console.log(`找到 ${scripts.length} 个需要生成封面的剧本`);

  for (const script of scripts) {
    console.log(`\n生成封面: ${script.title}`);
    const prompt = `${script.title}，剧本杀场景，电影海报风格，戏剧性，视觉冲击力，氛围感`;
    const coverImage = await generateImage(prompt);

    if (coverImage) {
      await prisma.script.update({
        where: { id: script.id },
        data: { coverImage }
      });
      console.log(`✓ 封面已保存: ${coverImage}`);
    } else {
      console.log(`✗ 生成失败`);
    }
  }
}

main();
