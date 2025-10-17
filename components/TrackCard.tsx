import VoteButtons from './VoteButtons';
import TrackCommentButton from './TrackCommentButton';

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

interface TrackCardProps {
  track: Track;
  rank: number;
}

export default function TrackCard({ track, rank }: TrackCardProps) {

  const getRankColor = () => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-purple-400';
  };

  const getRankEmoji = () => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="bg-[#1a0b2e]/60 backdrop-blur-sm rounded-xl border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 overflow-hidden">
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4">
        {/* Left: Album Art + Rank */}
        <div className="flex flex-col items-center gap-2">
          {track.imageUrl && (
            <div className="w-20 h-20 rounded-lg overflow-hidden shadow-lg">
              <img
                src={track.imageUrl}
                alt={`${track.title} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-1">
            {getRankEmoji() && (
              <span className="text-2xl">{getRankEmoji()}</span>
            )}
            {!getRankEmoji() && (
              <span className={`text-lg font-bold ${getRankColor()}`}>#{rank}</span>
            )}
          </div>
        </div>

        {/* Center: Track Info */}
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="text-base font-semibold text-white truncate">
            {track.title}
          </h3>
          <p className="text-sm text-purple-300/80 truncate mb-3">{track.artist}</p>
          
          {/* Links and Comments */}
          <div className="flex flex-wrap gap-3 items-center">
            {track.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs rounded-full transition-colors"
              >
                <span>🎵</span>
                <span>Spotify</span>
              </a>
            )}
            {track.youtubeUrl && (
              <a
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-full transition-colors"
              >
                <span>▶️</span>
                <span>YouTube</span>
              </a>
            )}
            <TrackCommentButton trackId={track.id} />
          </div>
        </div>

        {/* Right: Voting */}
        <VoteButtons trackId={track.id} initialVoteCount={track.voteCount} />
      </div>
    </div>
  );
}
