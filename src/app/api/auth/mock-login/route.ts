import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // 创建或获取 mock 用户
  let user = await prisma.user.findFirst({
    where: { email: 'mock@test.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        secondmeId: 'mock_user_123',
        name: '测试用户',
        email: 'mock@test.com',
        avatar: '',
      }
    });
  }

  // 设置 session cookie
  const cookieStore = await cookies();
  cookieStore.set('user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 1天
  });

  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
