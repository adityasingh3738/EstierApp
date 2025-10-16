'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface CommentModalProps {
  trackId: string;
  trackTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentModal({ trackId, trackTitle, isOpen, onClose }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, trackId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${trackId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${trackId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-purple-900 to-purple-950 rounded-t-2xl sm:rounded-2xl border border-purple-700 w-full sm:max-w-2xl max-h-[80vh] sm:max-h-[600px] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-purple-800">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-100 truncate">
              Comments
            </h2>
            <p className="text-sm text-purple-300 truncate">{trackTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-purple-400 hover:text-purple-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Comment Form */}
        <div className="p-4 sm:p-6 border-b border-purple-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              maxLength={500}
              className="flex-1 px-4 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition"
            >
              {submitting ? '...' : 'Post'}
            </button>
          </form>
          <p className="text-xs text-purple-400 mt-2">{newComment.length}/500</p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <div className="text-center py-8 text-purple-400">
              No comments yet. Be the first to comment!
            </div>
          )}

          {!loading && comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-purple-900/30 rounded-lg p-4 border border-purple-800/50"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-semibold text-purple-200">{comment.userName}</span>
                <span className="text-xs text-purple-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-purple-100">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
