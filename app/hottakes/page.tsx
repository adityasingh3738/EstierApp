'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HotTake {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  createdAt: string;
  commentCount: number;
}

interface HotTakeComment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

export default function HotTakesPage() {
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTake, setSelectedTake] = useState<HotTake | null>(null);
  const [comments, setComments] = useState<HotTakeComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchHotTakes();
  }, []);

  const fetchHotTakes = async () => {
    try {
      const response = await fetch('/api/hottakes');
      if (response.ok) {
        const data = await response.json();
        setHotTakes(data);
      }
    } catch (error) {
      console.error('Error fetching hot takes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/hottakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (response.ok) {
        const take = await response.json();
        setHotTakes([{ ...take, commentCount: 0, createdAt: take.createdAt }, ...hotTakes]);
        setNewTitle('');
        setNewContent('');
        setShowNewForm(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post hot take');
      }
    } catch (error) {
      alert('Failed to post hot take');
    } finally {
      setSubmitting(false);
    }
  };

  const openComments = async (take: HotTake) => {
    setSelectedTake(take);
    try {
      const response = await fetch(`/api/hottakes/${take.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTake || !newComment.trim() || commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      const response = await fetch(`/api/hottakes/${selectedTake.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
        // Update comment count
        setHotTakes(hotTakes.map(t => 
          t.id === selectedTake.id ? { ...t, commentCount: t.commentCount + 1 } : t
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post comment');
      }
    } catch (error) {
      alert('Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      {/* Header */}
      <div className="border-b border-purple-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-2 inline-block">
            ← Back to Voting
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                🔥 Hot Takes
              </h1>
              <p className="text-purple-300 mt-2">Share your spicy opinions on desi hip-hop</p>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg font-semibold text-white transition"
            >
              {showNewForm ? 'Cancel' : '+ New Take'}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Hot Take Form */}
        {showNewForm && (
          <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 rounded-lg p-6 border border-purple-700 mb-8">
            <h2 className="text-2xl font-bold text-purple-100 mb-4">Drop Your Hot Take</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (e.g., 'Raftaar is overrated')"
                maxLength={200}
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Elaborate your take... (max 1000 chars)"
                maxLength={1000}
                rows={4}
                className="w-full px-4 py-3 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-purple-400">{newContent.length}/1000</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 rounded-lg font-semibold text-white transition"
                >
                  {submitting ? 'Posting...' : 'Post Hot Take'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hot Takes List */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && hotTakes.length === 0 && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-12 text-center">
            <p className="text-purple-300 text-lg">No hot takes yet. Be the first!</p>
          </div>
        )}

        {!loading && hotTakes.length > 0 && (
          <div className="space-y-4">
            {hotTakes.map((take) => (
              <div
                key={take.id}
                className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 rounded-lg p-6 border border-purple-800/50 hover:border-red-600/50 transition-all cursor-pointer"
                onClick={() => openComments(take)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-purple-100 mb-1">{take.title}</h3>
                    <p className="text-sm text-purple-400">by {take.userName} • {formatDate(take.createdAt)}</p>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-red-900/30 rounded-full text-red-300 text-sm">
                    🔥
                  </span>
                </div>
                <p className="text-purple-200 mb-4 line-clamp-3">{take.content}</p>
                <div className="flex items-center gap-4 text-purple-400 text-sm">
                  <span>💬 {take.commentCount} {take.commentCount === 1 ? 'comment' : 'comments'}</span>
                  <span className="text-purple-600">Click to view discussion</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Comments Modal */}
      {selectedTake && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedTake(null)} />
          <div className="relative bg-gradient-to-br from-purple-900 to-purple-950 rounded-t-2xl sm:rounded-2xl border border-purple-700 w-full sm:max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-purple-800">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-purple-100 mb-2">{selectedTake.title}</h2>
                  <p className="text-sm text-purple-400 mb-3">by {selectedTake.userName} • {formatDate(selectedTake.createdAt)}</p>
                  <p className="text-purple-200">{selectedTake.content}</p>
                </div>
                <button onClick={() => setSelectedTake(null)} className="text-purple-400 hover:text-purple-200 text-2xl">×</button>
              </div>
            </div>

            {/* Comment Form */}
            <div className="p-6 border-b border-purple-800">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your thoughts..."
                  maxLength={1000}
                  className="flex-1 px-4 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !newComment.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-semibold text-white transition"
                >
                  {commentSubmitting ? '...' : 'Reply'}
                </button>
              </form>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.length === 0 && (
                <div className="text-center py-8 text-purple-400">
                  No comments yet. Start the discussion!
                </div>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="bg-purple-900/30 rounded-lg p-4 border border-purple-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-purple-200">{comment.userName}</span>
                    <span className="text-xs text-purple-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-purple-100">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
