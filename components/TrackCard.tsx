'use client';

import { useState, useEffect } from 'react';
import { isVotingLocked } from '@/lib/utils';

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
    <div className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 rounded-lg p-4 sm:p-6 border border-purple-800/50 hover:border-purple-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/50">
      <div className="flex items-start gap-4">
        {/* Album Art */}
        {track.imageUrl && (
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
            <img
              src={track.imageUrl}
              alt={`${track.title} cover`}
              className="w-full h-full rounded-lg object-cover shadow-lg"
            />
          </div>
        )}

        {/* Rank */}
        <div className="flex-shrink-0 w-12 sm:w-14">
          <div className={`text-2xl sm:text-3xl font-bold ${getRankColor()}`}>
            #{rank}
          </div>
        </div>

        {/* Track Info */}
        <div className="flex-grow min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-purple-100 truncate">
            {track.title}
          </h3>
          <p className="text-purple-300 text-sm sm:text-base truncate">{track.artist}</p>
          
          {/* Links */}
          <div className="flex gap-3 mt-3">
            {track.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm transition-colors"
              >
                🎵 Spotify
              </a>
            )}
            {track.youtubeUrl && (
              <a
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                ▶️ YouTube
              </a>
            )}
          </div>
        </div>

        {/* Voting */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <button
            onClick={() => handleVote(1)}
            disabled={locked || isVoting}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl transition-all duration-200 ${
              userVote === 1
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-purple-800/50 hover:bg-purple-700/50'
            } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            ⬆️
          </button>
          
          <div className="text-xl sm:text-2xl font-bold text-purple-200 min-w-[3rem] text-center">
            {currentVoteCount}
          </div>
          
          <button
            onClick={() => handleVote(-1)}
            disabled={locked || isVoting}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl transition-all duration-200 ${
              userVote === -1
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-purple-800/50 hover:bg-purple-700/50'
            } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            ⬇️
          </button>
        </div>
      </div>
    </div>
  );
}
