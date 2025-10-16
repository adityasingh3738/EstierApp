'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { getTimeUntilSunday, isVotingLocked } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [timeLeft, setTimeLeft] = useState(getTimeUntilSunday());
  const [locked, setLocked] = useState(isVotingLocked());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilSunday());
      setLocked(isVotingLocked());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 border-b border-purple-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ESTIER
            </h1>
            <p className="text-purple-300 mt-1 text-sm md:text-base">
              Desi Hip-Hop Weekly Rankings
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-purple-900/50 rounded-lg px-6 py-3 border border-purple-700">
              {locked ? (
                <div className="text-center">
                  <p className="text-yellow-400 font-semibold">🔒 VOTING LOCKED</p>
                  <p className="text-purple-300 text-sm mt-1">Results finalized for this week</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-purple-300 text-sm">Voting closes in</p>
                  <p className="text-2xl font-bold text-purple-200">
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-6 flex gap-2 border-b border-purple-800 overflow-x-auto">
          <Link
            href="/"
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              pathname === '/'
                ? 'text-purple-200 border-b-2 border-purple-400'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            🎵 Voting
          </Link>
          <Link
            href="/hottakes"
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              pathname === '/hottakes'
                ? 'text-red-300 border-b-2 border-red-400'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            🔥 Hot Takes
          </Link>
          <Link
            href="/archive"
            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${
              pathname === '/archive'
                ? 'text-purple-200 border-b-2 border-purple-400'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            📜 Archive
          </Link>
        </nav>
      </div>
    </header>
  );
}
