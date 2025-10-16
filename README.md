# Estier 🎵

A weekly voting platform for desi hip-hop tracks. Vote for your favorite tracks from Monday to Saturday, with results locked on Sunday!

## ✨ Features

- 🗳️ Weekly voting cycle (Monday-Sunday)
- ⬆️⬇️ Upvote/downvote functionality with toggle support
- 🔒 Automatic voting lockout on Sundays
- 🏆 Real-time ranking system
- 🎨 Professional dark purple theme
- 📱 Fully responsive design
- 🎶 Spotify & YouTube integration links

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database with sample tracks
npm run db:setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Prisma** - Type-safe database ORM
- **SQLite** - Local database (easily swappable for production)

## 📚 Documentation

See [WARP.md](./WARP.md) for detailed documentation on:
- Project architecture
- Database schema
- API routes
- Development workflows
- Production deployment considerations

## 💻 Development

```bash
# View database with GUI
npx prisma studio

# Add new tracks
# Edit prisma/seed.ts, then:
npm run prisma:seed

# Reset database
rm prisma/dev.db && npm run db:setup
```

## 🎯 How It Works

1. **Monday:** New tracks are released (30 tracks per week)
2. **Monday-Saturday:** Users can upvote/downvote tracks
3. **Sunday:** Voting locks, results are finalized
4. **Monday:** Cycle repeats with new tracks

## 👥 Contributing

Contributions are welcome! Feel free to:
- Report bugs via issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and celebrates desi hip-hop culture.

---

Built with ♥️ for the desi hip-hop community
