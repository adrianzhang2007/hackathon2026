'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

interface Note {
  id: string;
  content: string;
  scriptId?: string;
  roomId?: string;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/note');
      const data = await res.json();
      if (data.code === 0) {
        setNotes(data.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });
      const data = await res.json();
      if (data.code === 0) {
        setNewNote('');
        fetchNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-[#e8e4df] rounded w-1/4 mb-6" />
            <div className="h-32 bg-[#e8e4df] rounded mb-4" />
            <div className="h-32 bg-[#e8e4df] rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2c2824] mb-2">
              📝 我的笔记
            </h1>
            <p className="text-[#5c5650]">记录你的想法和感悟</p>
          </div>
          <Link
            href="/profile"
            className="text-[#5c5650] hover:text-[#2c2824] transition-colors"
          >
            ← 返回个人中心
          </Link>
        </div>

        {/* 添加笔记 */}
        <div className="bg-white rounded-xl p-6 border border-[#e8e4df] mb-6">
          <h2 className="font-serif text-lg font-semibold text-[#2c2824] mb-4">
            添加新笔记
          </h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="写下你的想法..."
              className="w-full px-4 py-3 border border-[#e8e4df] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c2824] bg-white resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !newNote.trim()}
                className="px-6 py-2 bg-[#2c2824] text-[#faf8f5] rounded-lg hover:bg-[#3d3833] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '保存中...' : '保存笔记'}
              </button>
            </div>
          </form>
        </div>

        {/* 笔记列表 */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#e8e4df]">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-serif text-xl text-[#2c2824] mb-2">暂无笔记</h3>
              <p className="text-[#5c5650]">开始记录你的第一个想法吧</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl p-6 border border-[#e8e4df] hover:shadow-md transition-shadow"
              >
                <p className="text-[#3d3833] whitespace-pre-wrap mb-4">
                  {note.content}
                </p>
                <div className="flex items-center justify-between text-sm text-[#8b8379]">
                  <span>
                    {new Date(note.createdAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {note.scriptId && (
                    <span className="px-2 py-1 bg-[#f0ece6] rounded text-xs">
                      剧本笔记
                    </span>
                  )}
                  {note.roomId && (
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                      房间笔记
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
