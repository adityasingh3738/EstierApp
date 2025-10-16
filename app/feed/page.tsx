'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface PostComment {
  id: string;
  text: string;
  createdAt: string;
  user: User;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  comments: PostComment[];
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await fetch('/api/feed');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || posting) return;

    setPosting(true);
    try {
      const response = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      });

      if (response.ok) {
        const post = await response.json();
        setPosts([post, ...posts]);
        setNewPost('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to post');
      }
    } catch (error) {
      alert('Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/feed/${postId}/like`, { method });

      if (response.ok) {
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, isLiked: !isLiked, likeCount: p.likeCount + (isLiked ? -1 : 1) }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/feed/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setPosts(posts.map(p =>
          p.id === postId
            ? { ...p, comments: [...p.comments, comment], commentCount: p.commentCount + 1 }
            : p
        ));
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* New Post Form */}
        <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 rounded-lg p-6 border border-purple-700 mb-8">
          <h2 className="text-xl font-bold text-purple-100 mb-4">What's on your mind?</h2>
          <form onSubmit={handlePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts about desi hip-hop..."
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-purple-400">{newPost.length}/1000</span>
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-semibold text-white transition"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-12 text-center">
            <p className="text-purple-300 text-lg">No posts yet. Be the first to post!</p>
          </div>
        )}

        {!loading && posts.map(post => (
          <div key={post.id} className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 rounded-lg p-6 border border-purple-800/50 mb-4">
            {/* Post Header */}
            <div className="flex items-start gap-3 mb-4">
              {post.user.avatarUrl ? (
                <img
                  src={post.user.avatarUrl}
                  alt={post.user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold">
                  {post.user.displayName[0]}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-purple-100">{post.user.displayName}</h3>
                <p className="text-sm text-purple-400">@{post.user.username} · {formatDate(post.createdAt)}</p>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-purple-200 mb-4">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-6 border-t border-purple-800 pt-3">
              <button
                onClick={() => toggleLike(post.id, post.isLiked)}
                className={`flex items-center gap-2 transition-colors ${
                  post.isLiked ? 'text-red-400' : 'text-purple-400 hover:text-red-400'
                }`}
              >
                {post.isLiked ? '❤️' : '🤍'} {post.likeCount}
              </button>
              <button
                onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                💬 {post.commentCount}
              </button>
            </div>

            {/* Comments */}
            {showComments === post.id && (
              <div className="mt-4 border-t border-purple-800 pt-4">
                {post.comments.map(comment => (
                  <div key={comment.id} className="bg-purple-900/30 rounded-lg p-3 mb-2">
                    <div className="flex items-start gap-2">
                      {comment.user.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.displayName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">
                          {comment.user.displayName[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-200">{comment.user.displayName}</p>
                        <p className="text-sm text-purple-300">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <form onSubmit={(e) => handleComment(e, post.id)} className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={500}
                    className="flex-1 px-3 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg text-white text-sm font-semibold transition"
                  >
                    Post
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
