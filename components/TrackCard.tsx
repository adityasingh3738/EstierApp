'use client';

import { useState, useEffect } from 'react';
import { isVotingLocked } from '@/lib/utils';
import CommentModal from './CommentModal';

interface Track {
  id: string;
  title: string;
  artist: string;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  voteCount: number;
  totalVotes: number;
}

interface TrackCardProps {
  track: Track;
  rank: number;
  onVoteChange?: () => void;
}

export default function TrackCard({ track, rank, onVoteChange }: TrackCardProps) {
  const [userVote, setUserVote] = useState<number>(0);
  const [currentVoteCount, setCurrentVoteCount] = useState(track.voteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [locked] = useState(isVotingLocked());
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Update vote count when track data changes (from server refresh)
  useEffect(() => {
    setCurrentVoteCount(track.voteCount);
  }, [track.voteCount]);

  useEffect(() => {
    // Fetch user's current vote for this track
    fetch(`/api/vote?trackId=${track.id}`)
      .then(res => res.json())
      .then(data => setUserVote(data.value || 0))
      .catch(console.error);

    // Fetch comment count
    fetch(`/api/comments/${track.id}`)
      .then(res => res.json())
      .then(data => setCommentCount(data.length || 0))
      .catch(console.error);
  }, [track.id]);

  const handleVote = async (value: number) => {
    // Prevent multiple simultaneous votes
    if (locked || isVoting) return;
    
    // Prevent voting same value twice (should toggle off instead)
    const targetValue = userVote === value ? 0 : value;
    
    setIsVoting(true);
    
    // Optimistically update UI
    const oldVote = userVote;
    const oldCount = currentVoteCount;
    setUserVote(targetValue);
    setCurrentVoteCount(oldCount + (targetValue - oldVote));
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id, value }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Revert on error
        setUserVote(oldVote);
        setCurrentVoteCount(oldCount);
        alert(data.error || 'Failed to vote');
      } else {
        // Notify parent to refresh all tracks (vote might have moved)
        onVoteChange?.();
      }
    } catch (error) {
      // Revert on error
      setUserVote(oldVote);
      setCurrentVoteCount(oldCount);
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const getRankColor = () => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-purple-400';
  };

  const getRankEmoji = () => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="bg-[#1a0b2e]/60 backdrop-blur-sm rounded-xl border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4">
        {/* Left: Album Art + Rank */}
        <div className="flex flex-col items-center gap-2">
          {track.imageUrl && (
            <div className="w-20 h-20 rounded-lg overflow-hidden shadow-lg">
              <img
                src={track.imageUrl}
                alt={`${track.title} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            {getRankEmoji() && (
              <span className="text-2xl">{getRankEmoji()}</span>
            )}
            {!getRankEmoji() && (
              <span className={`text-lg font-bold ${getRankColor()}`}>#{rank}</span>
            )}
          </div>
        </div>

        {/* Center: Track Info */}
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="text-base font-semibold text-white truncate">
            {track.title}
          </h3>
          <p className="text-sm text-purple-300/80 truncate mb-3">{track.artist}</p>
          
          {/* Links and Comments */}
          <div className="flex flex-wrap gap-3 items-center">
            {track.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs rounded-full transition-colors"
              >
                <span>🎵</span>
                <span>Spotify</span>
              </a>
            )}
            {track.youtubeUrl && (
              <a
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-full transition-colors"
              >
                <span>▶️</span>
                <span>YouTube</span>
              </a>
            )}
            <button
              onClick={() => setShowComments(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs rounded-full transition-colors"
            >
              <span>💬</span>
              <span>{commentCount}</span>
            </button>
          </div>
        </div>

        {/* Right: Voting */}
        <div className="flex flex-col items-center justify-center gap-1">
          <button
            onClick={() => handleVote(1)}
            disabled={locked || isVoting}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
              userVote === 1
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60'
            } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            ⬆️
          </button>
          
          <div className="text-lg font-bold text-white py-1">
            {currentVoteCount}
          </div>
          
          <button
            onClick={() => handleVote(-1)}
            disabled={locked || isVoting}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
              userVote === -1
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60'
            } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            ⬇️
          </button>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal
        trackId={track.id}
        trackTitle={`${track.title} - ${track.artist}`}
        isOpen={showComments}
        onClose={() => {
          setShowComments(false);
          // Refresh comment count
          fetch(`/api/comments/${track.id}`)
            .then(res => res.json())
            .then(data => setCommentCount(data.length || 0))
            .catch(console.error);
        }}
      />
    </div>
  );
}
