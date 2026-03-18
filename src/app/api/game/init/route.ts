import { NextResponse } from 'next/server';
import { startAllActiveRooms } from '@/lib/game-runner';

// GET: 启动所有活跃房间的游戏
export async function GET() {
  try {
    await startAllActiveRooms();
    return NextResponse.json({
      code: 0,
      message: '已启动所有活跃房间的游戏',
    });
  } catch (error) {
    console.error('Error initializing games:', error);
    return NextResponse.json(
      { code: 500, message: '初始化游戏失败' },
      { status: 500 }
    );
  }
}
