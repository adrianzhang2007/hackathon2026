'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Script } from '@/types';

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (data.code === 0) {
        setScripts(data.data);
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStars = (level: number) => {
    return '⭐'.repeat(level);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2c2824] mb-2">剧本工坊</h1>
          <p className="text-[#5c5650]">从知乎热榜获取真实事件，改编为可演绎的剧本</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-[#e8e4df] animate-pulse">
                <div className="h-6 bg-[#e8e4df] rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-[#e8e4df] rounded mb-2 w-full"></div>
                <div className="h-4 bg-[#e8e4df] rounded mb-4 w-2/3"></div>
                <div className="h-10 bg-[#e8e4df] rounded mt-6"></div>
              </div>
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-serif text-xl text-[#2c2824] mb-2">暂无剧本</h3>
            <p className="text-[#5c5650] mb-6">剧本正在创作中，请稍后再来</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <div key={script.id} className="bg-white rounded-xl p-6 border border-[#e8e4df] hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-[#f0ece6] text-[#5c5650] text-sm rounded-full">
                    {script.scriptType}
                  </span>
                  <span className="text-sm">{getDifficultyStars(script.difficulty)}</span>
                </div>

                <h3 className="font-serif text-xl font-semibold text-[#2c2824] mb-2">
                  {script.title}
                </h3>

                <p className="text-[#5c5650] text-sm mb-4 line-clamp-2">
                  {script.description}
                </p>

                <div className="flex items-center text-sm text-[#8b8379] mb-4">
                  <span className="mr-4">👥 {script.roles.length} 个角色</span>
                  <span>⏱️ {script.duration} 分钟</span>
                </div>

                {script.sourceEvent && (
                  <p className="text-xs text-[#8b8379] mb-4 italic">
                    来源：{script.sourceEvent}
                  </p>
                )}

                <Link
                  href={`/rooms/create?scriptId=${script.id}`}
                  className="block w-full text-center px-4 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors"
                >
                  创建房间
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
