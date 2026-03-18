import { NextResponse } from 'next/server';
import { getCurrentUser, getUserShades } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const shadesData = await getUserShades(user.accessToken);

  if (!shadesData) {
    return NextResponse.json({ code: 500, message: 'Failed to get shades' }, { status: 500 });
  }

  return NextResponse.json({
    code: 0,
    data: shadesData,
  });
}
