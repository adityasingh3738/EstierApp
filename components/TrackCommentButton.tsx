'use client';

import { useState, useEffect } from 'react';
import CommentModal from './CommentModal';

interface TrackCommentButtonProps {
  trackId: string;
}

export default function TrackCommentButton({ trackId }: TrackCommentButtonProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    // Fetch comment count
    fetch(`/api/comments/${trackId}`)
      .then(res => res.json())
      .then(data => setCommentCount(data.length || 0))
      .catch(console.error);
  }, [trackId]);

  return (
    <>
      <button
        onClick={() => setShowComments(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs rounded-full transition-colors"
      >
        <span>💬</span>
        <span>{commentCount}</span>
      </button>

      {/* Comment Modal */}
      <CommentModal
        trackId={trackId}
        trackTitle=""
        isOpen={showComments}
        onClose={() => {
          setShowComments(false);
          // Refresh comment count
          fetch(`/api/comments/${trackId}`)
            .then(res => res.json())
            .then(data => setCommentCount(data.length || 0))
            .catch(console.error);
        }}
      />
    </>
  );
}
