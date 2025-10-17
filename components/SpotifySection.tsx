'use client';

import SpotifyConnect from '@/components/SpotifyConnect';
import ListeningNow from '@/components/ListeningNow';

export default function SpotifySection() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-purple-200">Spotify</h2>
        <SpotifyConnect />
      </div>
      <ListeningNow />
    </section>
  );
}
