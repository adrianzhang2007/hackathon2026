import { prisma } from '../src/lib/prisma';

async function main() {
  const scriptId = 'cmmxnq5ff0001w0nbdynh6c9c';
  
  const script = await prisma.script.update({
    where: { id: scriptId },
    data: { coverImage: '/covers/1773939118916.jpeg' }
  });
  
  console.log('Updated script:', script.title, 'with cover:', script.coverImage);
}

main().catch(console.error).finally(() => prisma.$disconnect());
