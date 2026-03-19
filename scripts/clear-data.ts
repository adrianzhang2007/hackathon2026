import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  await prisma.chatMessage.deleteMany();
  await prisma.note.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.script.deleteMany();
  console.log('All data cleared!');
}

clearData().then(() => process.exit(0));
