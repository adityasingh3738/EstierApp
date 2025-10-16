'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';

export default function ProfilePage() {
  const { user } = useUser();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

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
