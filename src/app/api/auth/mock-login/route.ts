import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // 创建或获取 mock 用户
  let user = await prisma.user.findFirst({
    where: { secondmeUserId: 'mock_user_123' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        secondmeUserId: 'mock_user_123',
        name: '测试用户',
        avatar: '',
        accessToken: 'mock_token',
        refreshToken: 'mock_refresh',
        tokenExpiresAt: new Date(Date.now() + 86400000),
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
