import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  console.log('API /user/info: Getting current user...');
  const user = await getCurrentUser();
  console.log('API /user/info: User result:', user ? `Found user ${user.name}` : 'No user');

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    code: 0,
    data: {
      id: user.id,
      secondmeUserId: user.secondmeUserId,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
}
