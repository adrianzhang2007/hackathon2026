'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import Link from 'next/link';

export default function HotPage() {
  const [hotList, setHotList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedScripts, setGeneratedScripts] = useState<Set<string>>(new Set());
  const [generatingScripts, setGeneratingScripts] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState({ show: false, title: '', message: '', icon: '🎭' });

  useEffect(() => {
    fetchHot();
    checkGeneratedScripts();
    // 每5秒检查一次生成状态
    const interval = setInterval(checkGeneratedScripts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchHot = async () => {
    const res = await fetch('/api/zhihu/hot-mock');
    const data = await res.json();
    if (data.success) setHotList(data.data);
    setLoading(false);
  };

  const checkGeneratedScripts = async () => {
    const res = await fetch('/api/scripts');
    const data = await res.json();
    if (data.code === 0) {
      const generated = new Set(data.data.map((s: any) => s.sourceEvent));
      setGeneratedScripts(generated);
    }
  };

  const handleGenerate = async (topic: any) => {
    setGeneratingScripts(prev => new Set([...prev, topic.token]));

    try {
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic.title,
          body: topic.body,
          zhihuToken: topic.token,
          answers: []
        })
      });
      const data = await res.json();

      if (data.success) {
        setModal({ show: true, title: '生成成功', message: `剧本《${data.data.title}》生成成功！`, icon: '✨' });
        checkGeneratedScripts();
        setTimeout(() => window.location.href = '/scripts', 1500);
      } else {
        setModal({ show: true, title: '生成失败', message: data.error || '未知错误', icon: '❌' });
      }
    } catch (e) {
      setModal({ show: true, title: '生成失败', message: '请稍后重试', icon: '❌' });
    } finally {
      setGeneratingScripts(prev => {
        const next = new Set(prev);
        next.delete(topic.token);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-[#2c2824] mb-8">知乎热榜 → 剧本生成</h1>

        {loading ? (
          <div className="text-center py-20">加载中...</div>
        ) : (
          <div className="space-y-4">
            {hotList.map((topic) => {
              const isGenerated = generatedScripts.has(topic.token);
              const isGenerating = generatingScripts.has(topic.token);

              return (
                <div key={topic.token} className="bg-white rounded-xl p-6 border border-[#e8e4df]">
                  <h3 className="font-serif text-lg font-semibold text-[#2c2824] mb-2">{topic.title}</h3>
                  <p className="text-sm text-[#5c5650] mb-4">{topic.body}</p>

                  {isGenerating && (
                    <div className="mb-4 flex items-center space-x-2 text-sm text-[#5c5650]">
                      <div className="animate-spin">⚙️</div>
                      <span>AI 正在创作剧本，请稍候...</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[#8b8379]">🔥 {topic.heat_score.toLocaleString()}</span>
                    {isGenerated ? (
                      <Link
                        href="/scripts"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✓ 去体验
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleGenerate(topic)}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] disabled:opacity-50 transition-colors"
                      >
                        {isGenerating ? '生成中...' : '生成剧本'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Modal
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
        message={modal.message}
        icon={modal.icon}
      />
    </div>
  );
}
