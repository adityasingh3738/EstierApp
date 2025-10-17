# Spotify Integration Setup

## Overview
This feature allows users to link their Spotify accounts and share what they're currently listening to with the Estier community.

## Setup Instructions

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in the app details:
   - **App name:** Estier
   - **App description:** Desi hip-hop voting platform with Spotify integration
   - **Redirect URI:** `http://localhost:3000/api/auth/spotify/callback`
   - For production: add your production URL (e.g., `https://yourdomain.com/api/auth/spotify/callback`)
   - **APIs used:** Web API
5. Accept the terms and click "Save"
6. You'll be taken to your app's dashboard

### 2. Get Your Credentials

1. On your app's dashboard, click "Settings"
2. Copy your **Client ID**
3. Copy your **Client Secret** (click "View client secret")

### 3. Update Environment Variables

Open your `.env` file and replace the placeholders:

```env
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/spotify/callback
```

For production, update the redirect URI to match your production domain.

### 4. Update Redirect URIs (if needed)

If you're deploying to production:

1. Go back to your Spotify app settings
2. Add your production redirect URI (e.g., `https://yourdomain.com/api/auth/spotify/callback`)
3. Update the `.env` file with the production URI

## Features

### User Features
- **Connect Spotify:** Users can link their Spotify account via OAuth
- **Auto-refresh tokens:** Access tokens are automatically refreshed when expired
- **Privacy:** Only shows currently playing tracks when music is actively playing

### Display Features
- **Listening Now Section:** Shows all users currently listening to music
- **Real-time Updates:** Refreshes every 30 seconds to show latest activity
- **Rich Display:** Shows user avatar, track name, artist, and album art
- **Direct Links:** Click on tracks to open them in Spotify

## API Routes

### Authentication
- `GET /api/auth/spotify/login` - Initiates Spotify OAuth flow
- `GET /api/auth/spotify/callback` - Handles OAuth callback and stores tokens

### Data
- `GET /api/spotify/now-playing` - Get current user's now playing track
- `GET /api/spotify/listening-now` - Get all users' currently playing tracks

## Database Schema

The `User` model includes Spotify fields:
```prisma
model User {
  spotifyAccessToken   String?
  spotifyRefreshToken  String?
  spotifyExpiresAt     DateTime?
}
```

## Security Notes

- Tokens are stored securely in the database
- Refresh tokens are used to automatically renew access tokens
- Only the currently playing track is fetched (no access to library or playlists)
- Users can disconnect by removing their tokens from the database

## Troubleshooting

### "Spotify not connected" error
- Make sure you've clicked "Connect Spotify" and authorized the app
- Check that your tokens haven't expired (they auto-refresh, but initial connection must be valid)

### Images not loading
- Make sure `i.scdn.co` is in your Next.js image domains configuration
- Check that your Spotify app has permission to fetch album artwork

### Callback errors
- Verify your redirect URI in Spotify dashboard matches exactly with your `.env` file
- For production, ensure HTTPS is used for the redirect URI

## Rate Limits

Spotify API has rate limits. The integration:
- Fetches "now playing" for each user when the listening-now endpoint is called
- Refreshes the display every 30 seconds
- For many users, consider implementing caching or rate limiting

## Future Enhancements

- Add user preferences to opt-out of public listening display
- Cache Spotify API responses to reduce API calls
- Add recently played tracks
- Show listening statistics and trends
