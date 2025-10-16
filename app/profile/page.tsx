'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';

export default function ProfilePage() {
  const { user } = useUser();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [spotifyActivity, setSpotifyActivity] = useState<any>(null);
  const [loadingSpotify, setLoadingSpotify] = useState(true);

  useEffect(() => {
    if (user?.id) {
      // Check URL params for Spotify OAuth status
      const params = new URLSearchParams(window.location.search);
      if (params.get('spotify_success')) {
        setMessage('✅ Spotify connected successfully!');
      } else if (params.get('spotify_error')) {
        setMessage(`❌ Spotify connection failed: ${params.get('spotify_error')}`);
      }

      // Fetch Spotify activity
      fetch(`/api/spotify/listening/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setSpotifyActivity(data);
        })
        .catch(console.error)
        .finally(() => setLoadingSpotify(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-purple-300 text-lg">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-purple-900/60 to-purple-950/60 rounded-lg p-8 border border-purple-700">
          <div className="flex items-center gap-6 mb-6">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-600"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-600">
                {(user.firstName || 'U')[0]}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-purple-100">{user.fullName || user.username}</h1>
              <p className="text-purple-400">@{user.username || user.firstName?.toLowerCase()}</p>
              <p className="text-sm text-purple-500 mt-1">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="border-t border-purple-800 pt-6">
            <h2 className="text-xl font-bold text-purple-200 mb-4">About</h2>
            <p className="text-purple-300 mb-4">
              Your profile information is managed through Clerk. To update your name, email, or profile photo,
              click on your profile icon in the header.
            </p>
            
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-800">
              <h3 className="font-semibold text-purple-200 mb-2">Profile Info:</h3>
              <ul className="space-y-1 text-sm text-purple-300">
                <li>• Your posts and comments will show your Clerk profile photo</li>
                <li>• Display name: {user.fullName || user.username}</li>
                <li>• Username: @{user.username || user.firstName?.toLowerCase()}</li>
              </ul>
            </div>
          </div>

          {/* Spotify Integration */}
          <div className="border-t border-purple-800 pt-6 mt-6">
            <h2 className="text-xl font-bold text-purple-200 mb-4">🎵 Spotify Integration</h2>
            
            {loadingSpotify ? (
              <p className="text-purple-400 text-sm">Loading Spotify status...</p>
            ) : spotifyActivity?.connected ? (
              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm font-semibold mb-2">✅ Spotify Connected</p>
                  <p className="text-purple-300 text-xs">Your listening activity will be visible to other users.</p>
                </div>

                {spotifyActivity.currentlyPlaying && (
                  <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                    <h3 className="text-purple-200 font-semibold mb-2">
                      {spotifyActivity.currentlyPlaying.isPlaying ? '🎵 Currently Listening' : '🎵 Last Played'}
                    </h3>
                    <div className="flex items-center gap-4">
                      {spotifyActivity.currentlyPlaying.imageUrl && (
                        <img
                          src={spotifyActivity.currentlyPlaying.imageUrl}
                          alt="Album cover"
                          className="w-16 h-16 rounded-lg"
                        />
                      )}
                      <div>
                        <p className="text-purple-100 font-medium">{spotifyActivity.currentlyPlaying.name}</p>
                        <p className="text-purple-400 text-sm">{spotifyActivity.currentlyPlaying.artist}</p>
                        <a
                          href={spotifyActivity.currentlyPlaying.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-xs mt-1 inline-block"
                        >
                          Open in Spotify →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {spotifyActivity.recentlyPlayed && !spotifyActivity.currentlyPlaying && (
                  <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                    <h3 className="text-purple-200 font-semibold mb-2">🎵 Recently Played</h3>
                    <div className="flex items-center gap-4">
                      {spotifyActivity.recentlyPlayed.imageUrl && (
                        <img
                          src={spotifyActivity.recentlyPlayed.imageUrl}
                          alt="Album cover"
                          className="w-16 h-16 rounded-lg"
                        />
                      )}
                      <div>
                        <p className="text-purple-100 font-medium">{spotifyActivity.recentlyPlayed.name}</p>
                        <p className="text-purple-400 text-sm">{spotifyActivity.recentlyPlayed.artist}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <p className="text-purple-300 text-sm mb-4">
                  Connect your Spotify account to display what you&apos;re listening to on your profile!
                </p>
                <a
                  href="/api/spotify/auth"
                  className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition"
                >
                  🎵 Connect Spotify
                </a>
              </div>
            )}
          </div>

          {message && (
            <div className="mt-4 p-4 bg-purple-800/30 rounded-lg border border-purple-700">
              <p className="text-purple-200">{message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
