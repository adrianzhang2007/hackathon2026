import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, getUserInfo, setUserCookie } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // 获取保存的 state
  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  // 清除 state cookie
  cookieStore.delete('oauth_state');

  // 处理错误
  if (error) {
    console.error('OAuth error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackathon.marscn.com';
    return NextResponse.redirect(new URL('/?error=oauth_denied', baseUrl));
  }

  // 验证参数
  if (!code) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackathon.marscn.com';
    return NextResponse.redirect(new URL('/?error=no_code', baseUrl));
  }

  // 验证 state（宽松的验证，支持 WebView 场景）
  if (state !== savedState) {
    console.warn('OAuth state 验证失败，可能是跨 WebView 场景');
    // 不阻止登录流程，继续处理
  }

  // 交换 code 获取 token
  const tokenData = await exchangeCodeForToken(code);
  if (!tokenData) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackathon.marscn.com';
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', baseUrl));
  }

  // 获取用户信息
  const userInfo = await getUserInfo(tokenData.access_token);
  if (!userInfo) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackathon.marscn.com';
    return NextResponse.redirect(new URL('/?error=get_user_info_failed', baseUrl));
  }

  console.log('Callback: userInfo =', JSON.stringify(userInfo));

  // 检查用户ID是否有效
  if (!userInfo.id) {
    console.error('Callback: userInfo.id is missing!');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackathon.marscn.com';
    return NextResponse.redirect(new URL('/?error=invalid_user_id', baseUrl));
  }

  // 保存或更新用户到数据库
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  const user = await prisma.user.upsert({
    where: { secondmeUserId: userInfo.id },
    update: {
      name: userInfo.name,
      avatar: userInfo.avatar,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: expiresAt,
    },
    create: {
      secondmeUserId: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.avatar,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: expiresAt,
    },
  });

  // 设置用户 cookie
  console.log('Callback: Setting cookie for user:', user.id);
  await setUserCookie(user.id);
  console.log('Callback: Cookie set, redirecting to home');

  // 重定向到首页
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackathon.spacecn.xyz';
  return NextResponse.redirect(new URL('/', baseUrl));
}
