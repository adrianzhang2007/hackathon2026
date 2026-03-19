'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Modal from '@/components/Modal';
import { Room, Script, Role } from '@/types';

interface MessageWithUser {
  id: string;
  roomId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  roleName?: string;
  content: string;
  type: 'text' | 'action' | 'thought' | 'system';
  createdAt: string;
}

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [modal, setModal] = useState({ show: false, title: '', message: '', icon: '🎭' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
      // 每 1 秒刷新一次消息
      const interval = setInterval(fetchRoom, 1000);
      return () => clearInterval(interval);
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (data.code === 0) {
        setRoom(data.data);
        setMessages(data.data.messages || []);
        // 更新当前选中的角色
        const myMember = data.data.members?.find((m: any) => m.userId === data.data.currentUserId);
        if (myMember?.roleId) {
          setSelectedRole(myMember.roleId);
        }
      }
    } catch (error) {
      console.error('Error fetching room:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleJoinRoom = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.code === 0) {
        fetchRoom();
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleSelectRole = async (roleId: string) => {
    // 检查角色是否已被选择
    const isTaken = room?.members?.some((m: any) => m.roleId === roleId && !m.isDemo);
    if (isTaken) {
      setModal({ show: true, title: '角色已被选择', message: '该角色已被其他玩家选择', icon: '⚠️' });
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      });
      const data = await res.json();
      if (data.code === 0) {
        setSelectedRole(roleId);
        fetchRoom();
      } else {
        setModal({ show: true, title: '选择失败', message: data.message || '选择角色失败', icon: '❌' });
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      setModal({ show: true, title: '选择失败', message: '选择角色失败', icon: '❌' });
    }
  };

  const handleFillDemoBots = async () => {
    // 前端检查：确保真人已选择角色
    if (!hasSelectedRole) {
      setModal({ show: true, title: '请先选择角色', message: '请先选择角色，再填充 AI 玩家', icon: '⚠️' });
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}/demo`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.code === 0) {
        setModal({ show: true, title: '填充成功', message: data.data.message, icon: '✅' });
        fetchRoom();
      } else {
        setModal({ show: true, title: '填充失败', message: data.message || '填充失败', icon: '❌' });
      }
    } catch (error) {
      console.error('Error filling demo bots:', error);
      setModal({ show: true, title: '填充失败', message: '填充 DEMO 机器人失败', icon: '❌' });
    }
  };

  const handleStartGame = async () => {
    // 检查是否有真实玩家
    const realPlayers = room?.members?.filter((m: any) => !m.isDemo);
    if (!realPlayers || realPlayers.length === 0) {
      setModal({ show: true, title: '无法启动', message: '房间需要至少一名真实玩家才能启动', icon: '⚠️' });
      return;
    }

    // 检查真实玩家是否都选择了角色
    const unselectedRealPlayers = realPlayers.filter((m: any) => !m.roleId);
    if (unselectedRealPlayers.length > 0) {
      setModal({ show: true, title: '无法启动', message: '所有真实玩家都需要选择一个角色才能开始游戏', icon: '⚠️' });
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.code === 0) {
        setModal({ show: true, title: '游戏已启动', message: 'AI 角色开始自动对话', icon: '🎬' });
        fetchRoom();
      } else {
        setModal({ show: true, title: '启动失败', message: data.message || '启动失败', icon: '❌' });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      setModal({ show: true, title: '启动失败', message: '启动游戏失败', icon: '❌' });
    }
  };

  const handleEndGame = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.code === 0) {
        setModal({ show: true, title: '游戏已结束', message: '感谢参与本次剧本演绎', icon: '🎭' });
        fetchRoom();
      }
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  const getMyRole = () => {
    return room?.members?.find((m: any) => !m.isDemo)?.roleId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#e8e4df] rounded w-1/3 mb-4" />
            <div className="h-64 bg-[#e8e4df] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="font-serif text-xl text-[#2c2824]">房间不存在</h2>
        </div>
      </div>
    );
  }

  const isMember = room.members?.some((m: any) => !m.isDemo);
  const myRoleId = getMyRole();
  const myMember = room.members?.find((m: any) => !m.isDemo);
  const hasSelectedRole = !!myRoleId;
  const script = room.script;
  const roles: Role[] = script?.roles ? (Array.isArray(script.roles) ? script.roles : JSON.parse(script.roles as string)) : [];
  const totalCount = room.members?.length || 0;
  const realPlayerCount = room.members?.filter((m: any) => !m.isDemo).length || 0;

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 房间头部 */}
        <div className="bg-white rounded-xl p-6 border border-[#e8e4df] mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#2c2824] mb-2">
                🎭 {script?.title || '未知剧本'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-[#8b8379]">
                <span>房间 ID: {room.id.slice(0, 8)}</span>
                <span className={`px-2 py-1 rounded ${room.status === 'playing' ? 'bg-green-100 text-green-800' : room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                  {room.status === 'playing' ? '游戏中' : room.status === 'waiting' ? '等待中' : '已结束'}
                </span>
                <span>{realPlayerCount} 真实玩家 / {totalCount} 总人数</span>
              </div>
            </div>

            <div className="flex space-x-2">
              {!isMember && room.status === 'waiting' && (
                <button onClick={handleJoinRoom} className="px-6 py-2 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors">
                  加入房间
                </button>
              )}

              {isMember && room.status === 'waiting' && (
                <>
                  {!hasSelectedRole ? (
                    <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                      请先选择角色，再填充 AI
                    </span>
                  ) : (
                    <button
                      onClick={handleFillDemoBots}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>🤖</span>
                      <span>填充 AI 玩家</span>
                    </button>
                  )}
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ▶️ 开始游戏
                  </button>
                </>
              )}

              {room.status === 'playing' && (
                <button
                  onClick={handleEndGame}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  ⏹️ 结束游戏
                </button>
              )}
            </div>
          </div>

          {/* 角色列表 */}
          <div className="mt-4 pt-4 border-t border-[#e8e4df]">
            <h3 className="text-sm font-semibold text-[#5c5650] mb-3">已选角色 ({room.members?.length || 0})</h3>
            <div className="flex flex-wrap gap-3">
              {room.members?.map((member: any) => (
                <div key={member.id} className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${member.isDemo ? 'bg-blue-50 border border-blue-100' : 'bg-[#f0ece6]'}`}>
                  <div className="w-8 h-8 rounded-full bg-[#d4cfc7] flex items-center justify-center text-sm">
                    {member.user?.name?.[0] || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#2c2824]">{member.user?.name}</div>
                    {member.roleName && <div className="text-xs text-[#8b8379]">饰演: {member.roleName}</div>}
                  </div>
                  {member.isDemo && <span className="text-blue-500 text-xs">🤖 AI</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 角色选择 */}
        {isMember && room.status === 'waiting' && (
          <div className="bg-white rounded-xl p-6 border border-[#e8e4df] mb-6">
            <h3 className="font-serif text-lg font-semibold text-[#2c2824] mb-4">选择你的角色</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const isTaken = room.members?.some((m: any) => m.roleId === role.id);
                const isMine = myRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => !isTaken && handleSelectRole(role.id)}
                    className={`p-4 border rounded-lg transition-all ${
                      isTaken
                        ? isMine
                          ? 'bg-green-50 border-green-400 cursor-pointer'
                          : 'bg-gray-100 border-gray-200 opacity-60'
                        : 'border-[#e8e4df] hover:border-[#2c2824] cursor-pointer hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[#2c2824]">{role.name}</h4>
                      {isTaken && (
                        <span className={`text-xs px-2 py-1 rounded ${isMine ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {isMine ? '✓ 我的角色' : '已被选择'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#5c5650] mb-2">{role.occupation} · {role.age}岁</p>
                    <p className="text-xs text-[#8b8379]">{role.coreGoal}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 聊天区域 - 纯展示模式 */}
        <div className="bg-white rounded-xl border border-[#e8e4df] overflow-hidden">
          <div className="p-4 border-b border-[#e8e4df] bg-[#faf8f5] flex justify-between items-center">
            <h3 className="font-serif text-lg font-semibold text-[#2c2824]">💬 剧情演绎</h3>
            {room.status === 'playing' && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <span className="animate-pulse">●</span>
                <span>AI 自动对话中...</span>
              </div>
            )}
          </div>

          <div
            ref={messagesContainerRef}
            className="h-[500px] overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="text-center py-12 text-[#8b8379]">
                <div className="text-4xl mb-2">🎬</div>
                <p>等待游戏开始...</p>
                <p className="text-sm mt-1">点击「开始游戏」后，AI 角色将自动演绎剧情</p>
              </div>
            ) : (
              (() => {
                // 计算每条消息的轮次编号
                let roundCounter = 0;
                return messages.map((msg, index) => {
                  // 非系统消息增加轮次计数
                  if (msg.type !== 'system') {
                    roundCounter++;
                  }
                  return (
                    <div key={msg.id} className={`flex ${msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                      {msg.type === 'system' ? (
                        <div className="bg-[#f0ece6] px-4 py-2 rounded-full text-sm text-[#5c5650]">{msg.content}</div>
                      ) : (
                        <div className="flex space-x-3 max-w-[85%]">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${msg.user?.name?.includes('DEMO') || msg.user?.name?.includes('AI') ? 'bg-blue-100 text-blue-600' : 'bg-[#d4cfc7]'}`}>
                            {msg.user?.name?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-[#2c2824]">{msg.user?.name}</span>
                              {msg.roleName && <span className="text-xs text-[#8b8379]">饰演 {msg.roleName}</span>}
                              {/* 轮次编号 */}
                              <span className="text-xs px-2 py-0.5 bg-[#e8e4df] text-[#5c5650] rounded-full">
                                #{roundCounter}
                              </span>
                              {/* 时间戳 */}
                              <span className="text-xs text-[#8b8379]">
                                {new Date(msg.createdAt).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className={`p-3 rounded-lg ${msg.type === 'action' ? 'bg-[#fff8e1] italic' : msg.type === 'thought' ? 'bg-[#e3f2fd]' : 'bg-[#f0ece6]'}`}>
                              <p className="text-[#3d3833] leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 底部状态栏 */}
          <div className="p-3 border-t border-[#e8e4df] bg-[#faf8f5] text-center text-sm text-[#8b8379]">
            {room.status === 'playing' ? (
              <span>🤖 AI 正在自动演绎剧情，请观看对话</span>
            ) : room.status === 'ended' ? (
              <span>🎭 剧本演绎已结束</span>
            ) : (
              <span>等待游戏开始...</span>
            )}
          </div>
        </div>
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
