'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Room } from '@/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    // 每 5 秒刷新一次房间列表
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.code === 0) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      waiting: { text: '等待中', color: 'bg-yellow-100 text-yellow-800' },
      ready: { text: '准备中', color: 'bg-blue-100 text-blue-800' },
      playing: { text: '游戏中', color: 'bg-green-100 text-green-800' },
      ended: { text: '已结束', color: 'bg-gray-100 text-gray-800' },
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100' };
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2c2824] mb-2">游戏大厅</h1>
            <p className="text-[#5c5650]">加入现有房间或创建新房间开始剧本杀</p>
          </div>
          <Link
            href="/scripts"
            className="px-6 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors"
          >
            创建房间
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-[#e8e4df] animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-[#e8e4df] rounded w-1/3"></div>
                  <div className="h-6 bg-[#e8e4df] rounded w-20"></div>
                </div>
                <div className="h-4 bg-[#e8e4df] rounded mb-2 w-2/3"></div>
                <div className="h-4 bg-[#e8e4df] rounded mb-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#e8e4df]">
            <div className="text-4xl mb-4">🎪</div>
            <h3 className="font-serif text-xl text-[#2c2824] mb-2">暂无房间</h3>
            <p className="text-[#5c5650] mb-6">还没有人创建房间，快来创建第一个吧！</p>
            <Link
              href="/scripts"
              className="inline-block px-6 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors"
            >
              创建房间
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {rooms.map((room) => {
              const status = getStatusText(room.status);
              return (
                <Link
                  key={room.id}
                  href={`/rooms/${room.id}`}
                  className="block bg-white rounded-xl p-6 border border-[#e8e4df] hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-xl font-semibold text-[#2c2824]">
                      {room.script?.title || '未知剧本'}
                    </h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-[#8b8379] mb-4">
                    <span className="mr-4">🎭 {room.script?.scriptType || '未知类型'}</span>
                    <span>
                      👥 {room.members?.length || 0} 人在线
                    </span>
                  </div>

                  <div className="flex -space-x-2">
                    {room.members?.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full bg-[#d4cfc7] border-2 border-white flex items-center justify-center text-xs text-[#5c5650]"
                        title={member.user?.name || '未知用户'}
                      >
                        {member.user?.name?.[0] || '?'}
                      </div>
                    ))}
                    {(room.members?.length || 0) > 5 && (
                      <div className="w-8 h-8 rounded-full bg-[#e8e4df] border-2 border-white flex items-center justify-center text-xs text-[#5c5650]">
                        +{room.members.length - 5}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
