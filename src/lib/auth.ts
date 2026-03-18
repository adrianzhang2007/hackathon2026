import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { SecondMeUser, TokenResponse } from '@/types';

const SECONDME_OAUTH_URL = process.env.SECONDME_OAUTH_URL || 'https://go.second.me/oauth/';
const SECONDME_TOKEN_ENDPOINT = process.env.SECONDME_TOKEN_ENDPOINT || '';
const SECONDME_REFRESH_ENDPOINT = process.env.SECONDME_REFRESH_ENDPOINT || '';
const SECONDME_USER_PROFILE_ENDPOINT = process.env.SECONDME_USER_PROFILE_ENDPOINT || '';
const CLIENT_ID = process.env.SECONDME_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SECONDME_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.SECONDME_REDIRECT_URI || '';

// 生成随机 state
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 获取 OAuth 登录 URL
export function getLoginUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    state: state,
    scope: 'user.info user.info.shades user.info.softmemory chat note.add',
  });

  return `${SECONDME_OAUTH_URL}?${params.toString()}`;
}

// 使用 code 换取 token
export async function exchangeCodeForToken(code: string): Promise<TokenResponse | null> {
  try {
    console.log('exchangeCodeForToken: Starting...');
    console.log('exchangeCodeForToken: endpoint =', SECONDME_TOKEN_ENDPOINT);

    // 使用 application/x-www-form-urlencoded 格式
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
    console.log('exchangeCodeForToken: request body =', params.toString());

    const response = await fetch(SECONDME_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log('exchangeCodeForToken: response status =', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      return null;
    }

    const result = await response.json();
    console.log('exchangeCodeForToken: response =', JSON.stringify(result, null, 2));

    if (result.code !== 0 || !result.data) {
      console.error('Token exchange error:', result);
      return null;
    }

    // SecondMe 返回驼峰命名，转换为下划线命名以兼容
    return {
      access_token: result.data.accessToken,
      refresh_token: result.data.refreshToken,
      expires_in: result.data.expiresIn,
    } as TokenResponse;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
}

// 刷新 access token
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse | null> {
  try {
    // 使用 application/x-www-form-urlencoded 格式
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    const response = await fetch(SECONDME_REFRESH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', await response.text());
      return null;
    }

    const result = await response.json();
    if (result.code !== 0 || !result.data) {
      console.error('Token refresh error:', result);
      return null;
    }

    // SecondMe 返回驼峰命名，转换为下划线命名以兼容
    return {
      access_token: result.data.accessToken,
      refresh_token: result.data.refreshToken,
      expires_in: result.data.expiresIn,
    } as TokenResponse;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// 获取用户信息
export async function getUserInfo(accessToken: string): Promise<SecondMeUser | null> {
  try {
    const response = await fetch(`${SECONDME_USER_PROFILE_ENDPOINT}?type=BASE`, {
      headers: {
                'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Get user info failed:', await response.text());
      return null;
    }

    const result = await response.json();
    console.log('getUserInfo: response =', JSON.stringify(result, null, 2));

    if (result.code !== 0 || !result.data) {
      console.error('Get user info error:', result);
      return null;
    }

    // SecondMe 可能返回不同的字段名，做兼容性处理
    const data = result.data;
    return {
      id: data.id || data.userId || data.user_id || data.uid || '',
      name: data.name || data.nickname || data.username || '',
      avatar: data.avatar || data.avatarUrl || data.headimgurl || '',
    } as SecondMeUser;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// 获取用户兴趣标签
export async function getUserShades(accessToken: string): Promise<{ shades: { id: string; name: string }[] } | null> {
  try {
    const response = await fetch(`${SECONDME_USER_PROFILE_ENDPOINT}?type=SHADES`, {
      headers: {
                'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Get user shades failed:', await response.text());
      return null;
    }

    const result = await response.json();
    if (result.code !== 0 || !result.data) {
      console.error('Get user shades error:', result);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error getting user shades:', error);
    return null;
  }
}

// 获取当前登录用户
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  console.log('getCurrentUser: userId from cookie:', userId);

  if (!userId) {
    console.log('getCurrentUser: No user_id cookie found');
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  // 检查 token 是否过期
  if (new Date() >= user.tokenExpiresAt) {
    // 尝试刷新 token
    const tokenData = await refreshAccessToken(user.refreshToken);
    if (tokenData) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        },
      });
      return updatedUser;
    } else {
      // 刷新失败，返回 null
      return null;
    }
  }

  return user;
}

// 设置用户 cookie
export async function setUserCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set('user_id', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30天
  });
}

// 清除用户 cookie
export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
}
