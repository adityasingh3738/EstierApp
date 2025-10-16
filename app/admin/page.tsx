'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [spotifyUrls, setSpotifyUrls] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete all tracks for the current week? This cannot be undone!')) {
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/tracks', {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully deleted ${data.deleted} tracks!`);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to delete tracks'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const urls = spotifyUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    try {
      const response = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ spotifyUrls: urls }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully added ${data.count} tracks!`);
        setSpotifyUrls('');
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to add tracks'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0620] via-[#1a0b2e] to-[#0f0620] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400 mb-8">Add tracks for this week</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="adminKey" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                id="adminKey"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin key"
                required
              />
            </div>

            <div>
              <label htmlFor="spotifyUrls" className="block text-sm font-medium text-gray-300 mb-2">
                Spotify URLs (one per line)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Supports tracks, albums, or playlists. For albums/playlists, all tracks will be added.
              </p>
              <textarea
                id="spotifyUrls"
                value={spotifyUrls}
                onChange={(e) => setSpotifyUrls(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="https://open.spotify.com/track/...
https://open.spotify.com/album/...
https://open.spotify.com/playlist/..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || deleting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Tracks...' : 'Add Tracks'}
            </button>
          </form>

          {/* Delete Section */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">Danger Zone</h2>
            <p className="text-gray-400 mb-4">Delete tracks for the current week</p>
            <button
              onClick={handleDelete}
              disabled={loading || deleting || !adminKey}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : '🗑️ Delete Current Week\'s Tracks'}
            </button>
          </div>

          {message && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-white">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
