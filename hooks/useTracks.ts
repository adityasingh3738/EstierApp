'use client';

import { useQuery } from '@tanstack/react-query';

export interface Track {
  id: string;
  title: string;
  artist: string;
  spotifyUrl?: string | null;
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  voteCount: number;
  totalVotes: number;
}

async function fetchTracks(): Promise<Track[]> {
  const response = await fetch('/api/tracks');
  if (!response.ok) {
    throw new Error('Failed to fetch tracks');
  }
  return response.json();
}

export function useTracks() {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
  });
}
