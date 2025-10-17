'use client';

import { useState, useEffect } from 'react';
import { useUserVote, useVoteMutation } from '@/hooks/useVote';
import { isVotingLocked } from '@/lib/utils';

interface VoteButtonsProps {
  trackId: string;
  initialVoteCount: number;
}

export default function VoteButtons({ trackId, initialVoteCount }: VoteButtonsProps) {
  const [locked] = useState(isVotingLocked());
  const { data: voteData } = useUserVote(trackId);
  const voteMutation = useVoteMutation();
  
  const userVote = voteData?.value || 0;
  const [optimisticCount, setOptimisticCount] = useState(initialVoteCount);

  // Update optimistic count when initial data changes
  useEffect(() => {
    setOptimisticCount(initialVoteCount);
  }, [initialVoteCount]);

  const handleVote = async (value: number) => {
    if (locked || voteMutation.isPending) return;

    const targetValue = userVote === value ? 0 : value;
    const difference = targetValue - userVote;
    
    // Optimistic update
    setOptimisticCount(prev => prev + difference);

    try {
      await voteMutation.mutateAsync({ trackId, value });
    } catch (error) {
      // Revert on error
      setOptimisticCount(prev => prev - difference);
      alert(error instanceof Error ? error.message : 'Failed to vote');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={locked || voteMutation.isPending}
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
          userVote === 1
            ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
            : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60'
        } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        ⬆️
      </button>
      
      <div className="text-lg font-bold text-white py-1">
        {optimisticCount}
      </div>
      
      <button
        onClick={() => handleVote(-1)}
        disabled={locked || voteMutation.isPending}
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
          userVote === -1
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
            : 'bg-purple-900/40 text-purple-300 hover:bg-purple-800/60'
        } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        ⬇️
      </button>
    </div>
  );
}
