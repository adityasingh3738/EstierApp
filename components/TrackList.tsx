'use client';

import { useTracks } from '@/hooks/useTracks';
import TrackCard from './TrackCard';

export default function TrackList() {
  const { data: tracks, isLoading, error } = useTracks();

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        <p className="text-purple-300 mt-4 text-sm">Loading tracks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
        <p className="text-red-300 text-sm">⚠️ {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="bg-[#1a0b2e]/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-12 text-center">
        <p className="text-purple-300 text-base">No tracks available this week yet.</p>
        <p className="text-purple-400/70 text-sm mt-2">Check back Monday for new releases!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {tracks.map((track, index) => (
        <TrackCard key={track.id} track={track} rank={index + 1} />
      ))}
    </div>
  );
}
