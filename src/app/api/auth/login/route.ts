import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateState, getLoginUrl } from '@/lib/auth';

export async function GET() {
  const state = generateState();

  // 将 state 保存到 cookie
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10分钟
  });

  // 重定向到 SecondMe OAuth 页面
  const loginUrl = getLoginUrl(state);
  return NextResponse.redirect(loginUrl);
}
