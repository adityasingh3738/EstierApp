'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import CountdownTimer from './CountdownTimer';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#0a0a0f] border-b border-[rgba(139,92,246,0.2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ESTIER
            </h1>
          </div>
          
          {/* Timer and Auth */}
          <div className="flex items-center gap-4">
            <CountdownTimer />
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white text-sm font-semibold transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="w-10 h-10 rounded-full bg-purple-700 border-2 border-purple-500">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-full h-full rounded-full"
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-4 flex gap-2 border-b border-[rgba(139,92,246,0.2)] overflow-x-auto">
          <Link
            href="/"
            className={`px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
              pathname === '/'
                ? 'bg-purple-600/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
            }`}
          >
            Voting
          </Link>
          <Link
            href="/feed"
            className={`px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
              pathname === '/feed'
                ? 'bg-purple-600/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
            }`}
          >
            Feed
          </Link>
          <Link
            href="/users"
            className={`px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
              pathname === '/users'
                ? 'bg-purple-600/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
            }`}
          >
            Users
          </Link>
          <Link
            href="/hottakes"
            className={`px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
              pathname === '/hottakes'
                ? 'bg-purple-600/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
            }`}
          >
            Hot Takes
          </Link>
          <Link
            href="/archive"
            className={`px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg ${
              pathname === '/archive'
                ? 'bg-purple-600/20 text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white hover:bg-purple-600/10'
            }`}
          >
            Archive
          </Link>
        </nav>
      </div>
    </header>
  );
}
