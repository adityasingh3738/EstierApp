'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

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

interface WeekArchive {
  weekStart: string;
  tracks: Track[];
}

export default function ArchivePage() {
  const [archive, setArchive] = useState<WeekArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    try {
      const response = await fetch('/api/archive');
      if (!response.ok) {
        throw new Error('Failed to fetch archive');
      }
      const data = await response.json();
      setArchive(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatWeekDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      <Header />
      
      {/* Page Header */}
      <div className="border-b border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Archive
          </h1>
          <p className="text-purple-300 mt-2">Top 10 tracks from previous weeks</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-purple-300 mt-4">Loading archive...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-300">⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && archive.length === 0 && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-12 text-center">
            <p className="text-purple-300 text-lg">No archived weeks yet.</p>
            <p className="text-purple-400 text-sm mt-2">Check back after the first week!</p>
          </div>
        )}

        {!loading && !error && archive.length > 0 && (
          <div className="space-y-12">
            {archive.map((week) => (
              <div key={week.weekStart} className="space-y-4">
                <h2 className="text-2xl font-bold text-purple-200 border-b border-purple-800 pb-2">
                  Week of {formatWeekDate(week.weekStart)}
                </h2>
                
                <div className="space-y-3">
                  {week.tracks.map((track, index) => (
                    <div
                      key={track.id}
                      className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 rounded-lg p-4 border border-purple-800/50 hover:border-purple-600/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Album Art */}
                        {track.imageUrl && (
                          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16">
                            <img
                              src={track.imageUrl}
                              alt={`${track.title} cover`}
                              className="w-full h-full rounded-lg object-cover shadow-lg"
                            />
                          </div>
                        )}

                        {/* Rank */}
                        <div className="flex-shrink-0 w-10 sm:w-12">
                          <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                            {getRankEmoji(index + 1)} #{index + 1}
                          </div>
                        </div>

                        {/* Track Info */}
                        <div className="flex-grow min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-purple-100 truncate">
                            {track.title}
                          </h3>
                          <p className="text-purple-300 text-sm truncate">{track.artist}</p>
                        </div>

                        {/* Vote Count */}
                        <div className="flex-shrink-0">
                          <div className="text-lg sm:text-xl font-bold text-purple-200 text-center">
                            {track.voteCount}
                            <div className="text-xs text-purple-400">votes</div>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="flex-shrink-0 flex gap-2">
                          {track.spotifyUrl && (
                            <a
                              href={track.spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-green-600/20 hover:bg-green-600/40 rounded-lg flex items-center justify-center transition-colors"
                              title="Listen on Spotify"
                            >
                              🎵
                            </a>
                          )}
                          {track.youtubeUrl && (
                            <a
                              href={track.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-10 h-10 bg-red-600/20 hover:bg-red-600/40 rounded-lg flex items-center justify-center transition-colors"
                              title="Watch on YouTube"
                            >
                              ▶️
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
