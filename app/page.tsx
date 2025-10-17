import Header from '@/components/Header';
import TrackList from '@/components/TrackList';
import SpotifySection from '@/components/SpotifySection';

export default function Home() {

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

        {/* Spotify Section */}
        <div className="mb-8">
          <SpotifySection />
        </div>

        <TrackList />
      </main>

      <footer className="border-t border-purple-900/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-purple-400/60 text-xs">
          <p>© 2025 Estier - Celebrating Desi Hip-Hop Culture</p>
        </div>
      </footer>
    </div>
  );
}
