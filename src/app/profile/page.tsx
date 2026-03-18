'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Shade } from '@/types';

interface UserInfo {
  id: string;
  secondmeUserId: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [shades, setShades] = useState<Shade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
    fetchUserShades();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch('/api/user/info');
      const data = await res.json();
      if (data.code === 0) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserShades = async () => {
    try {
      const res = await fetch('/api/user/shades');
      const data = await res.json();
      if (data.code === 0 && data.data?.shades) {
        setShades(data.data.shades);
      }
    } catch (error) {
      console.error('Error fetching user shades:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 border border-[#e8e4df] animate-pulse">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-[#e8e4df] rounded-full mr-6" />
              <div className="flex-1">
                <div className="h-8 bg-[#e8e4df] rounded w-1/3 mb-2" />
                <div className="h-4 bg-[#e8e4df] rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-xl p-12 border border-[#e8e4df]">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="font-serif text-xl text-[#2c2824] mb-4">请先登录</h2>
            <p className="text-[#5c5650] mb-6">登录后即可查看个人信息</p>
            <a
              href="/api/auth/login"
              className="inline-block px-6 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors"
            >
              SecondMe 登录
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 用户基本信息 */}
        <div className="bg-white rounded-xl p-8 border border-[#e8e4df] mb-6">
          <div className="flex items-center mb-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full mr-6"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#d4cfc7] flex items-center justify-center text-2xl text-[#5c5650] mr-6">
                {user.name?.[0] || '?'}
              </div>
            )}
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#2c2824] mb-1">
                {user.name}
              </h1>
              <p className="text-[#8b8379] text-sm">
                SecondMe ID: {user.secondmeUserId.slice(0, 8)}...
              </p>
              <p className="text-[#8b8379] text-sm mt-1">
                加入时间: {new Date(user.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>

        {/* 兴趣标签 */}
        <div className="bg-white rounded-xl p-8 border border-[#e8e4df] mb-6">
          <h2 className="font-serif text-xl font-semibold text-[#2c2824] mb-4">
            🏷️ 兴趣标签 (Shades)
          </h2>
          {shades.length === 0 ? (
            <p className="text-[#8b8379]">暂无兴趣标签</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {shades.map((shade) => (
                <span
                  key={shade.id}
                  className="px-4 py-2 bg-[#f0ece6] text-[#2c2824] rounded-full text-sm"
                >
                  {shade.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 功能入口 */}
        <div className="grid md:grid-cols-2 gap-6">
          <a
            href="/rooms"
            className="bg-white rounded-xl p-6 border border-[#e8e4df] hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-3">🎪</div>
            <h3 className="font-serif text-lg font-semibold text-[#2c2824] mb-1">
              我的房间
            </h3>
            <p className="text-[#5c5650] text-sm">查看参与过的剧本杀房间</p>
          </a>

          <a
            href="/notes"
            className="bg-white rounded-xl p-6 border border-[#e8e4df] hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-serif text-lg font-semibold text-[#2c2824] mb-1">
              我的笔记
            </h3>
            <p className="text-[#5c5650] text-sm">查看添加到 SecondMe 的笔记</p>
          </a>
        </div>
      </div>
    </div>
  );
}
