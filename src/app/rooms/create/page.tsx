'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Script } from '@/types';

function CreateRoomForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scriptId = searchParams.get('scriptId');

  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchScripts();
  }, []);

  useEffect(() => {
    if (scriptId && scripts.length > 0) {
      const script = scripts.find(s => s.id === scriptId);
      if (script) {
        setSelectedScript(script);
      }
    }
  }, [scriptId, scripts]);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (data.code === 0) {
        setScripts(data.data);
        if (!scriptId && data.data.length > 0) {
          setSelectedScript(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedScript) return;

    setCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptId: selectedScript.id }),
      });
      const data = await res.json();
      if (data.code === 0) {
        router.push(`/rooms/${data.data.id}`);
      } else if (data.code === 401) {
        setShowLoginModal(true);
      } else {
        alert('创建失败：' + (data.message || '未知错误'));
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('创建失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl p-8 border border-[#e8e4df] animate-pulse">
          <div className="h-8 bg-[#e8e4df] rounded w-1/3 mb-4" />
          <div className="h-32 bg-[#e8e4df] rounded" />
        </div>
      </div>
    );
  }

  if (scripts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-xl p-12 border border-[#e8e4df]">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="font-serif text-xl text-[#2c2824] mb-4">暂无剧本</h2>
          <p className="text-[#5c5650]">剧本正在创作中，请稍后再来</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-[#2c2824] mb-8">
        {scriptId ? '确认剧本' : '创建房间'}
      </h1>

      {/* 剧本选择 - 仅在无 scriptId 时显示 */}
      {!scriptId && (
        <div className="bg-white rounded-xl p-6 border border-[#e8e4df] mb-6">
          <h2 className="font-serif text-lg font-semibold text-[#2c2824] mb-4">选择剧本</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {scripts.map((script) => (
              <div
                key={script.id}
                onClick={() => setSelectedScript(script)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedScript?.id === script.id
                    ? 'border-[#2c2824] bg-[#faf8f5]'
                    : 'border-[#e8e4df] hover:border-[#2c2824]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-[#2c2824]">{script.title}</h3>
                  {selectedScript?.id === script.id && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
                <p className="text-sm text-[#5c5650] mb-2 line-clamp-2">{script.description}</p>
                <div className="flex items-center text-xs text-[#8b8379]">
                  <span className="mr-3">👥 {script.roles.length} 个角色</span>
                  <span>⏱️ {script.duration} 分钟</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 剧本详情 */}
      {selectedScript && (
        <div className="bg-white rounded-xl p-6 border border-[#e8e4df] mb-6">
          <h2 className="font-serif text-lg font-semibold text-[#2c2824] mb-4">剧本详情</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#5c5650] mb-2">背景设定</h3>
              <p className="text-[#3d3833]">
                {typeof selectedScript.background === 'string'
                  ? JSON.parse(selectedScript.background)?.socialContext
                  : selectedScript.background?.socialContext}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#5c5650] mb-2">角色列表</h3>
              <div className="flex flex-wrap gap-2">
                {(typeof selectedScript.roles === 'string'
                  ? JSON.parse(selectedScript.roles)
                  : selectedScript.roles
                ).map((role: any, index: number) => (
                  <span key={role.id || `role-${index}`} className="px-3 py-1 bg-[#f0ece6] text-[#2c2824] rounded-full text-sm">
                    {role.name} · {role.occupation}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleCreateRoom}
          disabled={!selectedScript || creating}
          className="px-8 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creating ? '创建中...' : '创建房间'}
        </button>
      </div>

      {/* 登录提示弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="font-serif text-2xl font-semibold text-[#2c2824] mb-3">嘿，先登录一下吧</h3>
              <p className="text-[#5c5650] mb-6">登录后就能开启你的剧本之旅啦～</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-6 py-3 border border-[#e8e4df] text-[#5c5650] rounded-lg hover:bg-[#faf8f5] transition-colors"
                >
                  再看看
                </button>
                <button
                  onClick={() => window.location.href = '/api/auth/login'}
                  className="flex-1 px-6 py-3 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors"
                >
                  去登录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateRoomPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />
      <Suspense fallback={
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 border border-[#e8e4df] animate-pulse">
            <div className="h-8 bg-[#e8e4df] rounded w-1/3 mb-4" />
            <div className="h-32 bg-[#e8e4df] rounded" />
          </div>
        </div>
      }>
        <CreateRoomForm />
      </Suspense>
    </div>
  );
}
