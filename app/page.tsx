'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import TrackCard from '@/components/TrackCard';

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

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchTracks();
    
    // Poll for updates every 5 seconds to refresh rankings
    const interval = setInterval(fetchTracks, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/tracks');
      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }
      const data = await response.json();
      setTracks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0620]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Info Banner */}
        <div className="bg-[#1a0b2e]/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-4 mb-6">
          <p className="text-purple-200/90 text-center text-sm">
            Vote for your favorite desi hip-hop tracks! Voting opens Monday and closes Sunday.
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-purple-300 mt-4 text-sm">Loading tracks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
            <button
              onClick={fetchTracks}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && tracks.length === 0 && (
          <div className="bg-[#1a0b2e]/40 backdrop-blur-sm border border-purple-800/30 rounded-xl p-12 text-center">
            <p className="text-purple-300 text-base">No tracks available this week yet.</p>
            <p className="text-purple-400/70 text-sm mt-2">Check back Monday for new releases!</p>
          </div>
        )}

        {!loading && !error && tracks.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tracks.map((track, index) => (
              <TrackCard 
                key={track.id} 
                track={track} 
                rank={index + 1}
                onVoteChange={() => setRefreshKey(prev => prev + 1)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-purple-900/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-purple-400/60 text-xs">
          <p>© 2025 Estier - Celebrating Desi Hip-Hop Culture</p>
        </div>
      </footer>
    </div>
  );
}
