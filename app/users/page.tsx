'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

interface SpotifyActivity {
  connected: boolean;
  currentlyPlaying?: {
    name: string;
    artist: string;
    imageUrl?: string;
    spotifyUrl: string;
    isPlaying: boolean;
  };
  recentlyPlayed?: {
    name: string;
    artist: string;
    imageUrl?: string;
    spotifyUrl: string;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [spotifyActivity, setSpotifyActivity] = useState<Record<string, SpotifyActivity>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Fetch Spotify activity for all users
    users.forEach(user => {
      fetch(`/api/spotify/listening/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setSpotifyActivity(prev => ({ ...prev, [user.id]: data }));
        })
        .catch(console.error);
    });
  }, [users]);

  const fetchUsers = async (query = '') => {
    setSearching(true);
    try {
      const url = query
        ? `/api/users/search?q=${encodeURIComponent(query)}`
        : '/api/users/search';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const toggleFollow = async (username: string, isFollowing: boolean) => {
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${username}/follow`, { method });

      if (response.ok) {
        setUsers(users.map(u =>
          u.username === username
            ? {
                ...u,
                isFollowing: !isFollowing,
                followersCount: u.followersCount + (isFollowing ? -1 : 1),
              }
            : u
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update follow');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-100 mb-4">Discover Users</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="flex-1 px-4 py-3 bg-purple-900/50 border border-purple-700 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg font-semibold text-white transition"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-12 text-center">
            <p className="text-purple-300 text-lg">No users found</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-gradient-to-br from-purple-900/40 to-purple-950/40 rounded-lg p-6 border border-purple-800/50 hover:border-purple-600/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center text-white text-xl font-bold">
                      {user.displayName[0]}
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-purple-100 truncate">
                      {user.displayName}
                    </h3>
                    <p className="text-sm text-purple-400">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-purple-300 mt-2 line-clamp-2">{user.bio}</p>
                    )}

                    {/* Spotify Activity */}
                    {spotifyActivity[user.id]?.currentlyPlaying && (
                      <div className="mt-3 p-2 bg-green-900/20 border border-green-700/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-400">
                            {spotifyActivity[user.id]?.currentlyPlaying?.isPlaying ? '🎵 Listening to' : '🎵 Last played'}
                          </span>
                        </div>
                        <p className="text-xs text-purple-200 mt-1 truncate">
                          {spotifyActivity[user.id]?.currentlyPlaying?.name}
                        </p>
                        <p className="text-xs text-purple-400 truncate">
                          {spotifyActivity[user.id]?.currentlyPlaying?.artist}
                        </p>
                      </div>
                    )}
                    {spotifyActivity[user.id]?.recentlyPlayed && !spotifyActivity[user.id]?.currentlyPlaying && (
                      <div className="mt-3 p-2 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                        <p className="text-xs text-purple-400">🎵 Recently played</p>
                        <p className="text-xs text-purple-200 mt-1 truncate">
                          {spotifyActivity[user.id]?.recentlyPlayed?.name}
                        </p>
                        <p className="text-xs text-purple-400 truncate">
                          {spotifyActivity[user.id]?.recentlyPlayed?.artist}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 mt-3 text-xs text-purple-400">
                      <span>{user.postsCount} posts</span>
                      <span>{user.followersCount} followers</span>
                      <span>{user.followingCount} following</span>
                    </div>

                    {/* Follow Button */}
                    <button
                      onClick={() => toggleFollow(user.username, user.isFollowing)}
                      className={`mt-3 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                        user.isFollowing
                          ? 'bg-purple-800 hover:bg-purple-700 text-purple-200'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
