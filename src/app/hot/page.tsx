'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Script {
  id: string;
  title: string;
  description?: string;
  sourceEvent?: string;
  scriptType: string;
  difficulty: number;
  duration: number;
}

export default function HotPage() {
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2c2824] mb-2">热榜剧本</h1>
          <p className="text-[#5c5650]">基于知乎热榜生成的剧本，点击卡片进入剧本工坊</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-[#e8e4df] animate-pulse">
                <div className="h-6 bg-[#e8e4df] rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-[#e8e4df] rounded mb-4 w-full"></div>
                <div className="h-4 bg-[#e8e4df] rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="font-serif text-xl text-[#2c2824] mb-2">暂无剧本</h3>
            <p className="text-[#5c5650]">剧本正在创作中，请稍后再来</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scripts.map((script) => (
              <Link
                key={script.id}
                href={`/scripts#script-${script.id}`}
                className="block bg-white rounded-xl p-6 border border-[#e8e4df] hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-lg font-semibold text-[#2c2824] flex-1 mr-4">
                    {script.title}
                  </h3>
                  <span className="text-sm text-[#8b8379] shrink-0">{getDifficultyStars(script.difficulty)}</span>
                </div>

                <p className="text-sm text-[#5c5650] mb-4 line-clamp-2">
                  {script.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-[#8b8379]">
                    <span className="px-2 py-1 bg-[#f0ece6] rounded">{script.scriptType}</span>
                    <span>⏱️ {script.duration} 分钟</span>
                  </div>
                  
                  {script.sourceEvent && (
                    <a
                      href={`https://www.zhihu.com/question/${script.sourceEvent}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      知乎热榜 ↗
                    </a>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
