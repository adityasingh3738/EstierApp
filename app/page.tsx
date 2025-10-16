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

  useEffect(() => {
    fetchTracks();
    
    // Poll for updates every 5 seconds to refresh rankings
    const interval = setInterval(fetchTracks, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 mb-8">
          <p className="text-purple-200 text-center text-sm sm:text-base">
            Vote for your favorite desi hip-hop tracks! Voting opens Monday and closes Sunday. 
            <span className="block mt-1 text-purple-300">Top tracks will be featured on our weekly playlist.</span>
          </p>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-purple-300 mt-4">Loading tracks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-300">⚠️ {error}</p>
            <button
              onClick={fetchTracks}
              className="mt-4 px-6 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && tracks.length === 0 && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-12 text-center">
            <p className="text-purple-300 text-lg">No tracks available this week yet.</p>
            <p className="text-purple-400 text-sm mt-2">Check back Monday for new releases!</p>
          </div>
        )}

        {!loading && !error && tracks.length > 0 && (
          <div className="space-y-4">
            {tracks.map((track, index) => (
              <TrackCard key={track.id} track={track} rank={index + 1} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-purple-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-purple-400 text-sm">
          <p>© 2025 Estier - Celebrating Desi Hip-Hop Culture</p>
        </div>
      </footer>
    </div>
  );
}
