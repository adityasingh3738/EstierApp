'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface VoteData {
  value: number;
}

async function fetchUserVote(trackId: string): Promise<VoteData> {
  const response = await fetch(`/api/vote?trackId=${trackId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch vote');
  }
  return response.json();
}

async function submitVote({ trackId, value }: { trackId: string; value: number }) {
  const response = await fetch('/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId, value }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to vote');
  }

  return response.json();
}

export function useUserVote(trackId: string) {
  return useQuery({
    queryKey: ['vote', trackId],
    queryFn: () => fetchUserVote(trackId),
  });
}

export function useVoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVote,
    onSuccess: (_, variables) => {
      // Invalidate and refetch both the vote and tracks queries
      queryClient.invalidateQueries({ queryKey: ['vote', variables.trackId] });
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    },
  });
}
