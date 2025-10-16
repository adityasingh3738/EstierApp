import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  // Sample desi hip-hop tracks
  const tracks = [
    { title: "Nanchaku", artist: "Raftaar", spotifyUrl: "https://open.spotify.com/track/example1", youtubeUrl: "https://youtube.com/watch?v=example1" },
    { title: "Seedhe Maut", artist: "MC Stan", spotifyUrl: "https://open.spotify.com/track/example2", youtubeUrl: "https://youtube.com/watch?v=example2" },
    { title: "Quarantine", artist: "Prabh Deep", spotifyUrl: "https://open.spotify.com/track/example3", youtubeUrl: "https://youtube.com/watch?v=example3" },
    { title: "Tribute", artist: "KR$NA", spotifyUrl: "https://open.spotify.com/track/example4", youtubeUrl: "https://youtube.com/watch?v=example4" },
    { title: "Machayenge", artist: "Emiway Bantai", spotifyUrl: "https://open.spotify.com/track/example5", youtubeUrl: "https://youtube.com/watch?v=example5" },
    { title: "Afsana", artist: "Seedhe Maut", spotifyUrl: "https://open.spotify.com/track/example6", youtubeUrl: "https://youtube.com/watch?v=example6" },
    { title: "Wahid", artist: "Talha Anjum", spotifyUrl: "https://open.spotify.com/track/example7", youtubeUrl: "https://youtube.com/watch?v=example7" },
    { title: "Gully Boy", artist: "DIVINE", spotifyUrl: "https://open.spotify.com/track/example8", youtubeUrl: "https://youtube.com/watch?v=example8" },
    { title: "Roots", artist: "Rawal x Bharg", spotifyUrl: "https://open.spotify.com/track/example9", youtubeUrl: "https://youtube.com/watch?v=example9" },
    { title: "Paisa", artist: "MC Stan", spotifyUrl: "https://open.spotify.com/track/example10", youtubeUrl: "https://youtube.com/watch?v=example10" },
    { title: "Don't Need", artist: "Karma", spotifyUrl: "https://open.spotify.com/track/example11", youtubeUrl: "https://youtube.com/watch?v=example11" },
    { title: "Muhfaad", artist: "Muhfaad", spotifyUrl: "https://open.spotify.com/track/example12", youtubeUrl: "https://youtube.com/watch?v=example12" },
    { title: "Malum", artist: "Fotty Seven", spotifyUrl: "https://open.spotify.com/track/example13", youtubeUrl: "https://youtube.com/watch?v=example13" },
    { title: "King", artist: "King", spotifyUrl: "https://open.spotify.com/track/example14", youtubeUrl: "https://youtube.com/watch?v=example14" },
    { title: "Drill", artist: "Sez on the Beat", spotifyUrl: "https://open.spotify.com/track/example15", youtubeUrl: "https://youtube.com/watch?v=example15" },
    { title: "Trap", artist: "Yungsta", spotifyUrl: "https://open.spotify.com/track/example16", youtubeUrl: "https://youtube.com/watch?v=example16" },
    { title: "Boom Bap", artist: "Encore ABJ", spotifyUrl: "https://open.spotify.com/track/example17", youtubeUrl: "https://youtube.com/watch?v=example17" },
    { title: "Flow", artist: "Rebel 7", spotifyUrl: "https://open.spotify.com/track/example18", youtubeUrl: "https://youtube.com/watch?v=example18" },
    { title: "Lifestyle", artist: "Ikka", spotifyUrl: "https://open.spotify.com/track/example19", youtubeUrl: "https://youtube.com/watch?v=example19" },
    { title: "Dope", artist: "Brodha V", spotifyUrl: "https://open.spotify.com/track/example20", youtubeUrl: "https://youtube.com/watch?v=example20" },
    { title: "Beast Mode", artist: "EPR", spotifyUrl: "https://open.spotify.com/track/example21", youtubeUrl: "https://youtube.com/watch?v=example21" },
    { title: "Savage", artist: "D'Evil", spotifyUrl: "https://open.spotify.com/track/example22", youtubeUrl: "https://youtube.com/watch?v=example22" },
    { title: "Culture", artist: "Kaam Bhaari", spotifyUrl: "https://open.spotify.com/track/example23", youtubeUrl: "https://youtube.com/watch?v=example23" },
    { title: "Street", artist: "Naezy", spotifyUrl: "https://open.spotify.com/track/example24", youtubeUrl: "https://youtube.com/watch?v=example24" },
    { title: "Dreams", artist: "Frappe Ash", spotifyUrl: "https://open.spotify.com/track/example25", youtubeUrl: "https://youtube.com/watch?v=example25" },
    { title: "Reality", artist: "Hanumankind", spotifyUrl: "https://open.spotify.com/track/example26", youtubeUrl: "https://youtube.com/watch?v=example26" },
    { title: "Vision", artist: "Calm", spotifyUrl: "https://open.spotify.com/track/example27", youtubeUrl: "https://youtube.com/watch?v=example27" },
    { title: "Hustle", artist: "Bella", spotifyUrl: "https://open.spotify.com/track/example28", youtubeUrl: "https://youtube.com/watch?v=example28" },
    { title: "Grind", artist: "Raga", spotifyUrl: "https://open.spotify.com/track/example29", youtubeUrl: "https://youtube.com/watch?v=example29" },
    { title: "Victory", artist: "Yashraj", spotifyUrl: "https://open.spotify.com/track/example30", youtubeUrl: "https://youtube.com/watch?v=example30" },
  ];

  console.log('Seeding database with tracks...');

  for (const track of tracks) {
    await prisma.track.create({
      data: {
        ...track,
        weekStart,
      },
    });
  }

  console.log(`Created ${tracks.length} tracks for the week starting ${weekStart.toISOString()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
