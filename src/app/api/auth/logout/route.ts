import { NextResponse } from 'next/server';
import { clearUserCookie } from '@/lib/auth';

export async function POST() {
  await clearUserCookie();
  return NextResponse.json({ code: 0, message: 'Logged out successfully' });
}

export async function GET() {
  await clearUserCookie();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
