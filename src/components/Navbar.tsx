'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      console.log('Navbar: Fetching user info...');
      const res = await fetch('/api/user/info', {
        credentials: 'include', // 确保携带 cookie
      });
      console.log('Navbar: Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Navbar: Response data:', data);

        if (data.code === 0 && data.data) {
          setUser(data.data);
          console.log('Navbar: User set:', data.data.name);
        } else {
          console.log('Navbar: No user in response');
          setUser(null);
        }
      } else {
        console.log('Navbar: Response not ok:', res.status);
        setUser(null);
      }
    } catch (error) {
      console.error('Navbar: Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-[#e8e4df]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎭</span>
            <span className="font-serif text-xl font-semibold text-[#2c2824]">知乎热榜剧本杀</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/hot" className="text-[#5c5650] hover:text-[#2c2824] transition-colors">
              热榜
            </Link>
            <Link href="/scripts" className="text-[#5c5650] hover:text-[#2c2824] transition-colors">
              剧本工坊
            </Link>
            <Link href="/rooms" className="text-[#5c5650] hover:text-[#2c2824] transition-colors">
              游戏大厅
            </Link>
            <Link href="/profile" className="text-[#5c5650] hover:text-[#2c2824] transition-colors">
              我的
            </Link>
          </div>

          {/* User */}
          <div className="flex items-center">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-[#e8e4df] animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#d4cfc7] flex items-center justify-center text-[#5c5650]">
                      {user.name?.[0] || '?'}
                    </div>
                  )}
                  <span className="text-sm text-[#5c5650] hidden sm:block">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-[#8b8379] hover:text-[#5c5650] transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-[#2c2824] text-[#faf8f5] rounded-lg text-sm hover:bg-[#3d3833] transition-colors"
              >
                SecondMe 登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
