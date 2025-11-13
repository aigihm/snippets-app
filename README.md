# Snippets - Audio Social Media App

An audio-based social media app inspired by TikTok, but for audio content. Think of it as TikTok meets Spotify for podcast snippets.

## 🚀 Quick Deploy (5 Minutes)

**Want to share this with friends right now?**

The app works in **demo mode** out of the box - no setup required!

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 2. Go to vercel.com
# 3. Click "Import" and select this repo
# 4. Click "Deploy"
# 5. Share your URL with friends!
```

See **[QUICKSTART.md](./QUICKSTART.md)** for step-by-step instructions.

**Demo mode includes:**
- ✅ 6 sample audio snippets ready to play
- ✅ All features working (play, skip, like, save)
- ✅ Lock screen controls
- ✅ Share button built-in
- ✅ No sign-up required for visitors
- ✅ Works on all devices

## 📱 iOS App

**Progressive Web App (PWA) ready!** Users can "Add to Home Screen" from Safari:
- Works like a native app
- App icon on home screen
- Full screen experience
- Offline support
- No App Store needed

See **[IOS_APP.md](./IOS_APP.md)** for:
- PWA installation (5 minutes)
- Capacitor native app (2-3 hours)
- Full App Store submission guide

## Features

- **Personalized Audio Feed**: TikTok-style recommendation algorithm that learns from your listening habits
- **Spotify-Inspired Player**: Beautiful, intuitive audio controls
- **Smart Controls**: Rewind to start, -10s, play/pause, +10s, skip
- **Lock Screen Integration**: Media controls available on your device's lock screen via Media Session API
- **Progress Bar**: Visual progress with time display
- **Engagement Features**: Like snippets (thumbs up) and save to playlists
- **Smart Algorithm**: Skip tracking informs the recommendation engine about your preferences
- **AI-Powered Content**: Podcast snippets are automatically labeled with topics, sentiment, and entities

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for blazing-fast development
- **TailwindCSS** for styling
- **Supabase** for authentication and database
- **Lucide React** for icons

### Backend Services
- **Supabase**: PostgreSQL database, authentication, row-level security
- **Listen Notes API**: Podcast discovery and episode fetching
- **OpenAI Whisper**: Audio transcription
- **Anthropic Claude**: AI labeling (topics, sentiment, entities, keywords)

### Key Features
- **Hybrid Recommendation Engine**: Combines collaborative filtering, content-based filtering, freshness, and popularity signals
- **Intelligent Audio Segmentation**: Breaks podcasts into 30s-4min snippets at natural breakpoints
- **Real-time Interaction Tracking**: Monitors play time, skips, likes, and saves

## Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** (free tier works)
3. **Listen Notes API Key** (free tier available)
4. **Anthropic API Key** (for Claude)
5. **OpenAI API Key** (for Whisper - backend only)

### Installation

1. Clone the repository:
```bash
cd audio-social-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_LISTEN_NOTES_API_KEY=your_listen_notes_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the SQL schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-schema.sql`
   - Execute the SQL to create all tables, indexes, and Row Level Security policies

3. Get your project credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → Project API keys → anon/public

### API Keys Setup

#### Listen Notes API
1. Sign up at [listennotes.com/api](https://www.listennotes.com/api/)
2. Get your API key from the dashboard
3. Free tier: 100 requests/month

#### Anthropic Claude API
1. Sign up at [console.anthropic.com](https://console.anthropic.com/)
2. Create an API key
3. Add credits to your account

#### OpenAI API (for backend transcription)
1. Sign up at [platform.openai.com](https://platform.openai.com/)
2. Create an API key
3. Note: Whisper API calls should be made from a backend service (not browser)

### Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:5173`

3. Create an account or sign in

## Content Ingestion (Backend Required)

The app is designed to work with pre-processed podcast snippets. To populate your database with content, you'll need to create a backend ingestion script that:

1. **Fetches podcasts** from Listen Notes API
2. **Downloads audio files** for recent episodes (last 7 days)
3. **Segments audio** into 30s-4min chunks using the segmentation service
4. **Transcribes** each segment using OpenAI Whisper
5. **Labels** transcripts using Claude (topics, sentiment, entities, keywords)
6. **Stores** snippets in Supabase database

### Example Ingestion Flow

```typescript
// This would run on your backend (Node.js, Python, etc.)
import { listenNotesService } from './services/listenNotes';
import { audioSegmentationService } from './services/audioSegmentation';
import { aiLabelingService } from './services/aiLabeling';

async function ingestPodcasts() {
  // 1. Get news podcasts
  const podcasts = await listenNotesService.getBestPodcasts('News');

  for (const podcast of podcasts.slice(0, 10)) {
    // 2. Get recent episodes
    const episodes = await listenNotesService.getPodcastEpisodes(podcast.id);

    for (const episode of episodes) {
      // 3. Segment audio
      const segments = audioSegmentationService.segmentByTime(
        episode.audio_length_sec
      );

      for (const segment of segments) {
        // 4. Transcribe and label
        const { transcript, labeling } = await aiLabelingService.processSnippet(
          episode.audio
        );

        // 5. Store in database
        await supabase.from('snippets').insert({
          podcast_title: podcast.title,
          podcast_author: podcast.publisher,
          episode_title: episode.title,
          audio_url: episode.audio,
          duration: segment.duration,
          start_time: segment.startTime,
          end_time: segment.endTime,
          topics: labeling.topics,
          keywords: labeling.keywords,
          sentiment: labeling.sentiment,
          named_entities: labeling.namedEntities,
          transcript,
          description: labeling.summary,
          thumbnail_url: episode.thumbnail,
        });
      }
    }
  }
}
```

**Note**: Audio transcription and segmentation require significant processing power and API credits. Consider running this as a scheduled job (e.g., daily via cron) on a backend server.

## Architecture

### Database Schema

- **users**: User accounts (extends Supabase auth.users)
- **snippets**: Audio content segments with AI-generated metadata
- **user_interactions**: Tracks play, skip, like, save, complete events
- **playlists**: User-created collections
- **playlist_snippets**: Junction table for playlist contents
- **user_preferences**: Preferred and disliked topics for recommendations

### Recommendation Algorithm

The hybrid recommendation engine considers:

1. **Content-based (40%)**: Matches snippet topics/sentiment to user preferences
2. **Collaborative (30%)**: Finds patterns from similar users
3. **Freshness (15%)**: Boosts newer content
4. **Popularity (15%)**: Surfaces trending snippets
5. **Exploration (10%)**: Random recommendations to discover new content

### Key Files

```
src/
├── components/
│   ├── AudioPlayer.tsx       # Main player UI with all controls
│   └── Auth.tsx              # Authentication form
├── hooks/
│   ├── useAuth.ts            # Supabase authentication
│   ├── useSnippets.ts        # Fetch snippets from database
│   ├── useUserInteractions.ts # Track user engagement
│   ├── useRecommendations.ts # Generate personalized feed
│   └── useMediaSession.ts    # Lock screen controls
├── services/
│   ├── listenNotes.ts        # Podcast API integration
│   ├── audioSegmentation.ts  # Intelligent chunking
│   ├── aiLabeling.ts         # Claude & Whisper integration
│   └── recommendationEngine.ts # TikTok-inspired algorithm
├── types/
│   ├── database.ts           # Supabase types
│   └── index.ts              # App types
└── lib/
    └── supabase.ts           # Supabase client
```

## Features in Detail

### Audio Player Controls

- **Rewind to Start**: Jump back to the beginning
- **-10s**: Rewind 10 seconds
- **Play/Pause**: Toggle playback
- **+10s**: Fast forward 10 seconds
- **Skip**: Move to next snippet (auto-plays)
- **Like**: Thumbs up to boost similar content
- **Save**: Add to playlist (modal coming soon)

### Lock Screen Controls

When playing audio, controls appear on your device's lock screen:
- Play/Pause
- Previous Track (rewind to start)
- Next Track (skip)
- Seek backward (-10s)
- Seek forward (+10s)

### Auto-play

When a snippet finishes playing, the next recommended snippet automatically starts.

### Interaction Tracking

Every action is tracked to improve recommendations:
- **Play**: User started playing
- **Skip**: User skipped before completion
- **Complete**: User listened to entire snippet
- **Like**: User gave thumbs up
- **Save**: User added to playlist

## Progressive Web App (PWA)

To enable installation as a PWA:

1. Add a `manifest.json`:
```json
{
  "name": "Snippets",
  "short_name": "Snippets",
  "description": "Your personalized audio content feed",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#191414",
  "theme_color": "#1DB954",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. Add a service worker for offline support

## Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider.

### Environment Variables

Make sure to set all environment variables in your hosting provider's dashboard.

## Future Enhancements

- [ ] Playlist management modal
- [ ] User profiles
- [ ] Following other users
- [ ] Comments on snippets
- [ ] Sharing snippets
- [ ] Native mobile apps (React Native)
- [ ] Offline support via service workers
- [ ] Background audio playback
- [ ] Queue management
- [ ] Search functionality
- [ ] Custom topics and filters
- [ ] Creator dashboard for podcast publishers
- [ ] Analytics and insights

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For questions or issues, please open a GitHub issue.

---

Built with ❤️ using React, Supabase, and Claude AI
