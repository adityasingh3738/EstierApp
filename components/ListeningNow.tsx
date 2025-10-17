'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Track {
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  url: string;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

interface Listener {
  user: User;
  track: Track;
}

export default function ListeningNow() {
  const [listeners, setListeners] = useState<Listener[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchListeners = async () => {
      try {
        const res = await fetch('/api/spotify/listening-now');
        const data = await res.json();
        setListeners(data.listeners || []);
      } catch (error) {
        console.error('Error fetching listeners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListeners();
    // Refresh every 30 seconds
    const interval = setInterval(fetchListeners, 30000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-6 border border-purple-700/30">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">🎧 Listening Now</h2>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (listeners.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-6 border border-purple-700/30">
        <h2 className="text-2xl font-bold text-purple-300 mb-4">🎧 Listening Now</h2>
        <p className="text-gray-400">No one is listening right now. Connect your Spotify to be the first!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 rounded-xl p-6 border border-purple-700/30">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">🎧 Listening Now</h2>
      <div className="space-y-4">
        {listeners.map((listener) => (
          <div key={listener.user.id} className="flex items-center gap-4 p-4 bg-purple-900/30 rounded-lg hover:bg-purple-900/40 transition-colors">
            <div className="flex-shrink-0">
              {listener.user.avatarUrl ? (
                <Image
                  src={listener.user.avatarUrl}
                  alt={listener.user.displayName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold">
                  {listener.user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-purple-200">{listener.user.displayName}</p>
              <a
                href={listener.track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-purple-300 transition-colors block truncate"
              >
                {listener.track.name}
              </a>
              <p className="text-sm text-gray-400 truncate">{listener.track.artist}</p>
            </div>

            {listener.track.albumArt && (
              <div className="flex-shrink-0">
                <Image
                  src={listener.track.albumArt}
                  alt={listener.track.album}
                  width={60}
                  height={60}
                  className="rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
