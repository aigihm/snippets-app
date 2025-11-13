/**
 * Backend Podcast Ingestion Script
 *
 * This script fetches news podcasts, segments them, and processes with AI.
 * Run this on a backend server (Node.js) with a cron job for daily updates.
 *
 * Usage:
 * 1. Set up environment variables (same as .env)
 * 2. Run: npx tsx scripts/ingest-podcasts.ts
 *
 * Requirements:
 * - npm install tsx @supabase/supabase-js openai @anthropic-ai/sdk
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for backend
const LISTEN_NOTES_API_KEY = process.env.VITE_LISTEN_NOTES_API_KEY || '';
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audio: string;
  audio_length_sec: number;
  thumbnail: string;
  podcast: {
    title: string;
    publisher: string;
  };
}

/**
 * Fetch best news podcasts
 */
async function fetchBestPodcasts() {
  const response = await fetch(
    'https://listen-api.listennotes.com/api/v2/best_podcasts?genre_id=1489&region=us',
    {
      headers: {
        'X-ListenAPI-Key': LISTEN_NOTES_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch podcasts');
  }

  const data = await response.json();
  return data.podcasts || [];
}

/**
 * Fetch recent episodes from a podcast
 */
async function fetchPodcastEpisodes(podcastId: string): Promise<PodcastEpisode[]> {
  const response = await fetch(
    `https://listen-api.listennotes.com/api/v2/podcasts/${podcastId}`,
    {
      headers: {
        'X-ListenAPI-Key': LISTEN_NOTES_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch episodes');
  }

  const data = await response.json();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (data.episodes || []).filter(
    (ep: any) => ep.pub_date_ms >= sevenDaysAgo
  );
}

/**
 * Segment audio by time (fallback when transcription is not available)
 */
function segmentByTime(duration: number) {
  const segments = [];
  let currentTime = 0;
  const minDuration = 30;
  const maxDuration = 240;

  while (currentTime < duration) {
    const randomDuration = Math.random() * (maxDuration - minDuration) + minDuration;
    const segmentDuration = Math.min(randomDuration, duration - currentTime);

    segments.push({
      startTime: currentTime,
      endTime: currentTime + segmentDuration,
      duration: segmentDuration,
    });

    currentTime += segmentDuration;
  }

  return segments;
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // Download audio file first (you may need to implement this)
    // For now, we'll skip transcription and return empty string
    // In production, you would:
    // 1. Download the audio file
    // 2. Send to Whisper API
    // 3. Return the transcript

    console.log('Transcription skipped for', audioUrl);
    return '';
  } catch (error) {
    console.error('Transcription error:', error);
    return '';
  }
}

/**
 * Label transcript using Claude
 */
async function labelTranscript(transcript: string, description: string) {
  if (!transcript && !description) {
    return {
      topics: ['News'],
      keywords: [],
      sentiment: 'neutral' as const,
      namedEntities: { people: [], organizations: [], locations: [], other: [] },
      summary: description,
    };
  }

  const textToAnalyze = transcript || description;

  const prompt = `Analyze the following podcast content and extract:

1. Main topics (3-5 high-level categories like "Politics", "Technology", "Health", etc.)
2. Keywords (5-10 specific important terms or phrases)
3. Sentiment (overall emotional tone: positive, negative, or neutral)
4. Named entities:
   - People (names of individuals mentioned)
   - Organizations (companies, institutions, groups)
   - Locations (places, cities, countries)
   - Other notable entities
5. A brief 1-2 sentence summary

Content:
${textToAnalyze}

Respond in the following JSON format:
{
  "topics": ["topic1", "topic2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "sentiment": "positive|negative|neutral",
  "namedEntities": {
    "people": ["person1", "person2", ...],
    "organizations": ["org1", "org2", ...],
    "locations": ["location1", "location2", ...],
    "other": ["entity1", "entity2", ...]
  },
  "summary": "Brief summary here"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Labeling error:', error);
    return {
      topics: ['News'],
      keywords: [],
      sentiment: 'neutral' as const,
      namedEntities: { people: [], organizations: [], locations: [], other: [] },
      summary: description,
    };
  }
}

/**
 * Process a single episode
 */
async function processEpisode(episode: PodcastEpisode) {
  console.log(`Processing: ${episode.podcast.title} - ${episode.title}`);

  // Create segments
  const segments = segmentByTime(episode.audio_length_sec);
  console.log(`Created ${segments.length} segments`);

  for (const segment of segments) {
    try {
      // Transcribe (skipped for now - implement if needed)
      const transcript = await transcribeAudio(episode.audio);

      // Label with Claude
      const labeling = await labelTranscript(transcript, episode.description);

      // Store in database
      const { error } = await supabase.from('snippets').insert({
        podcast_title: episode.podcast.title,
        podcast_author: episode.podcast.publisher,
        episode_title: episode.title,
        audio_url: episode.audio,
        duration: Math.floor(segment.duration),
        start_time: Math.floor(segment.startTime),
        end_time: Math.floor(segment.endTime),
        topics: labeling.topics,
        keywords: labeling.keywords,
        sentiment: labeling.sentiment,
        named_entities: labeling.namedEntities,
        transcript: transcript,
        description: labeling.summary || episode.description.substring(0, 200),
        thumbnail_url: episode.thumbnail,
      });

      if (error) {
        console.error('Database insert error:', error);
      } else {
        console.log(`✓ Saved snippet: ${segment.startTime}s - ${segment.endTime}s`);
      }

      // Rate limiting: wait between API calls
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error processing segment:', error);
    }
  }
}

/**
 * Main ingestion function
 */
async function main() {
  console.log('Starting podcast ingestion...');

  try {
    // Fetch top podcasts
    const podcasts = await fetchBestPodcasts();
    console.log(`Found ${podcasts.length} podcasts`);

    // Process first 5 podcasts to avoid hitting API limits
    for (const podcast of podcasts.slice(0, 5)) {
      console.log(`\nFetching episodes for: ${podcast.title}`);

      const episodes = await fetchPodcastEpisodes(podcast.id);
      console.log(`Found ${episodes.length} recent episodes`);

      // Process first 2 episodes per podcast
      for (const episode of episodes.slice(0, 2)) {
        await processEpisode(episode);
      }

      // Rate limiting between podcasts
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('\n✓ Ingestion complete!');
  } catch (error) {
    console.error('Ingestion failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };
