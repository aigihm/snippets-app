# Snippets - Setup Guide

Step-by-step instructions to get your Snippets app up and running.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. **Create a Supabase account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in

2. **Create a new project**
   - Click "New Project"
   - Choose an organization
   - Enter project name: "Snippets"
   - Enter a database password (save this!)
   - Select a region close to you
   - Click "Create new project"
   - Wait for project to be provisioned (~2 minutes)

3. **Run the database schema**
   - In your Supabase dashboard, go to the SQL Editor (left sidebar)
   - Click "New query"
   - Copy the entire contents of `supabase-schema.sql` from this project
   - Paste into the SQL editor
   - Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows)
   - You should see success messages

4. **Get your API credentials**
   - Go to Settings (gear icon) → API
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **anon/public key** (under "Project API keys")

## Step 3: Get API Keys

### Listen Notes API

1. Go to [listennotes.com/api](https://www.listennotes.com/api/)
2. Click "Get Started Free"
3. Create an account
4. Go to your dashboard
5. Copy your API key
6. Free tier: 100 requests/month (good for testing)

### Anthropic Claude API

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Go to "API Keys"
4. Click "Create Key"
5. Copy the API key (you won't be able to see it again!)
6. Add credits to your account (Settings → Billing)

### OpenAI API (Optional - for backend transcription)

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys
4. Create new secret key
5. Copy the key (save it!)

## Step 4: Configure Environment Variables

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Open `.env` in your text editor

3. Fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_LISTEN_NOTES_API_KEY=your_listen_notes_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
VITE_OPENAI_API_KEY=your_openai_key
```

## Step 5: Run the Development Server

```bash
npm run dev
```

The app should open at `http://localhost:5173`

## Step 6: Create an Account

1. Click "Sign Up" on the auth screen
2. Enter an email and password (min 6 characters)
3. You'll be automatically logged in

## Step 7: Add Some Content (Important!)

The app won't have any snippets initially. You have two options:

### Option A: Add Sample Data Manually (Quick Test)

Run this in your Supabase SQL Editor to add a few test snippets:

```sql
INSERT INTO snippets (
  podcast_title,
  podcast_author,
  episode_title,
  audio_url,
  duration,
  start_time,
  end_time,
  description,
  topics,
  keywords,
  sentiment,
  thumbnail_url
) VALUES
(
  'Sample News Podcast',
  'News Network',
  'Daily Brief - November 12, 2024',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  180,
  0,
  180,
  'A brief overview of today''s top news stories',
  ARRAY['News', 'Politics'],
  ARRAY['breaking news', 'updates', 'headlines'],
  'neutral',
  'https://via.placeholder.com/300'
),
(
  'Tech Talk Daily',
  'Tech Insights',
  'AI Breakthroughs',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  120,
  0,
  120,
  'Latest developments in artificial intelligence',
  ARRAY['Technology', 'AI'],
  ARRAY['artificial intelligence', 'machine learning', 'innovation'],
  'positive',
  'https://via.placeholder.com/300'
);
```

### Option B: Run the Ingestion Script (Production)

See the "Backend Ingestion" section in the main README.md for details on setting up automated podcast fetching and processing.

## Step 8: Test the App

1. **Sign up/Login**: Create an account
2. **Listen**: Snippets should auto-play
3. **Controls**: Test rewind, play/pause, forward, skip
4. **Interactions**: Try liking and saving snippets
5. **Lock Screen**: Play audio and lock your device - controls should appear on lock screen

## Troubleshooting

### "No Snippets Available"

- Make sure you added sample data (Step 7)
- Check Supabase: Table Editor → snippets table should have rows
- Check browser console for errors

### "Failed to fetch snippets"

- Verify your `.env` file has correct Supabase credentials
- Check Supabase project is running (green status in dashboard)
- Verify database schema was applied correctly

### Audio won't play

- Check that audio URLs are valid
- Open browser DevTools → Network tab to see if audio is loading
- Try using the sample URLs from Option A above

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### "Module not found" errors

Make sure all dependencies are installed:

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk lucide-react
```

## Next Steps

1. **Populate Content**: Set up the backend ingestion script to fetch real podcasts
2. **Customize**: Adjust recommendation weights in `src/services/recommendationEngine.ts`
3. **Deploy**: See README.md for deployment instructions
4. **Add Features**: Implement playlist management, search, user profiles, etc.

## Support

- Check the main [README.md](./README.md) for detailed documentation
- Review the code in `src/` for implementation details
- Open an issue on GitHub if you encounter problems

## Quick Reference

**Start dev server**: `npm run dev`
**Build for production**: `npm run build`
**Preview production build**: `npm run preview`
**Supabase Dashboard**: Settings → Project Settings
**Environment variables**: `.env` file in project root

---

Happy coding! 🎧
