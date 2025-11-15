/**
 * Process Studs Terkel interviews with speaker diarization
 * Extracts only segments where the guest is speaking (not Studs)
 *
 * Requirements:
 * - npm install assemblyai dotenv
 * - Create .env with: ASSEMBLYAI_API_KEY=your_key_here
 *
 * Usage:
 * node scripts/processInterviews.js
 */

import { AssemblyAI } from 'assemblyai';
import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

// Studs Terkel interviews from Internet Archive
const interviews = [
  {
    url: 'https://archive.org/download/studs-terkel-studs-terkel-radio-archive-180-interviewing-louisiana-photographer-/1960/studs%20terkel%20-%20studs%20terkel%20radio%20archive%20-%20105%20-%20maya%20angelou%20discusses%20her%20early%20life%20and%20african%20american%20culture%20and%20people.mp3',
    guest: 'Maya Angelou',
    title: 'Maya Angelou on Early Life',
    topic: ['Literature', 'African American Culture', 'Biography'],
    description: 'Maya Angelou discusses her early life and African American culture',
  },
  {
    url: 'https://archive.org/download/studs-terkel-studs-terkel-radio-archive-180-interviewing-louisiana-photographer-/1960/studs%20terkel%20-%20studs%20terkel%20radio%20archive%20-%20106%20-%20bob%20newhart%20discusses%20his%20comedic%20craft.mp3',
    guest: 'Bob Newhart',
    title: 'Bob Newhart on Comedy',
    topic: ['Comedy', 'Entertainment', 'Craft'],
    description: 'Bob Newhart discusses his comedic craft and career',
  },
  // Add more as needed
];

/**
 * Process a single interview with speaker diarization
 */
async function processInterview(interview) {
  console.log(`\n🎙️  Processing: ${interview.title}`);
  console.log(`Guest: ${interview.guest}`);

  try {
    // Step 1: Transcribe with speaker labels
    console.log('📝 Transcribing audio with speaker diarization...');
    const transcript = await client.transcripts.transcribe({
      audio_url: interview.url,
      speaker_labels: true,
      speakers_expected: 2, // Studs + Guest
    });

    if (transcript.status === 'error') {
      console.error(`❌ Transcription failed: ${transcript.error}`);
      return null;
    }

    console.log(`✅ Transcription complete`);
    console.log(`   Detected ${transcript.utterances?.length || 0} utterances`);

    // Step 2: Identify which speaker is the guest (not Studs)
    // Strategy: Studs usually speaks first, so Speaker A is likely Studs
    // Guest is likely the speaker with more total speaking time
    const speakerStats = {};

    transcript.utterances?.forEach(utterance => {
      const speaker = utterance.speaker;
      if (!speakerStats[speaker]) {
        speakerStats[speaker] = {
          count: 0,
          totalDuration: 0,
          totalWords: 0
        };
      }
      speakerStats[speaker].count++;
      speakerStats[speaker].totalDuration += (utterance.end - utterance.start);
      speakerStats[speaker].totalWords += utterance.words?.length || 0;
    });

    console.log('\n👥 Speaker Statistics:');
    Object.entries(speakerStats).forEach(([speaker, stats]) => {
      console.log(`   ${speaker}: ${stats.count} utterances, ${(stats.totalDuration / 1000).toFixed(1)}s, ${stats.totalWords} words`);
    });

    // Guest is usually the speaker with more speaking time
    const guestSpeaker = Object.entries(speakerStats)
      .sort((a, b) => b[1].totalDuration - a[1].totalDuration)[0][0];

    console.log(`\n✨ Identified guest as: Speaker ${guestSpeaker}`);

    // Step 3: Extract guest-only segments
    const guestSegments = transcript.utterances
      ?.filter(utterance => utterance.speaker === guestSpeaker)
      .filter(utterance => {
        // Filter out very short segments (likely just "yes", "mm-hmm", etc.)
        const duration = (utterance.end - utterance.start) / 1000;
        return duration >= 30; // At least 30 seconds
      })
      .map(utterance => ({
        start: Math.floor(utterance.start / 1000), // Convert ms to seconds
        end: Math.floor(utterance.end / 1000),
        duration: Math.floor((utterance.end - utterance.start) / 1000),
        text: utterance.text,
      }));

    console.log(`\n📊 Found ${guestSegments?.length || 0} guest-only segments (30s+)`);

    // Step 4: Generate snippet data
    const snippets = guestSegments?.map((segment, index) => ({
      id: `${interview.guest.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      podcast_title: 'Studs Terkel Radio Archive',
      podcast_author: 'Studs Terkel / WFMT',
      episode_title: `${interview.title} - Part ${index + 1}`,
      audio_url: interview.url,
      duration: segment.duration,
      start_time: segment.start,
      end_time: segment.end,
      description: `${interview.description} (Guest-only segment ${index + 1})`,
      topics: interview.topic,
      keywords: [...interview.topic.map(t => t.toLowerCase()), interview.guest.toLowerCase(), 'interview'],
      sentiment: 'neutral',
      transcript: segment.text,
      named_entities: {
        people: [interview.guest, 'Studs Terkel'],
        organizations: ['WFMT', 'Chicago Public Radio'],
        locations: ['Chicago'],
        other: [interview.title],
      },
      created_at: new Date().toISOString(),
      thumbnail_url: null,
    }));

    return {
      interview: interview.title,
      guest: interview.guest,
      totalSegments: snippets?.length || 0,
      snippets,
    };

  } catch (error) {
    console.error(`❌ Error processing ${interview.title}:`, error.message);
    return null;
  }
}

/**
 * Process all interviews and generate snippets
 */
async function main() {
  console.log('🚀 Starting interview processing with speaker diarization\n');
  console.log('This will:');
  console.log('1. Transcribe each interview with speaker labels');
  console.log('2. Identify which speaker is the guest vs Studs');
  console.log('3. Extract only segments where guest is speaking');
  console.log('4. Generate snippet data for your app\n');

  if (!process.env.ASSEMBLYAI_API_KEY) {
    console.error('❌ Error: ASSEMBLYAI_API_KEY not found in .env file');
    console.log('\nTo fix this:');
    console.log('1. Sign up at https://www.assemblyai.com/');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Create .env file with: ASSEMBLYAI_API_KEY=your_key_here');
    process.exit(1);
  }

  const results = [];

  // Process interviews one at a time (to avoid rate limits)
  for (const interview of interviews) {
    const result = await processInterview(interview);
    if (result) {
      results.push(result);
    }

    // Wait between requests to respect rate limits
    if (interviews.indexOf(interview) < interviews.length - 1) {
      console.log('\n⏳ Waiting 5 seconds before next interview...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Step 5: Save results
  console.log('\n💾 Saving results...');

  const allSnippets = results.flatMap(r => r.snippets);

  const outputPath = path.join(process.cwd(), 'src/data/processedSnippets.json');
  await fs.writeFile(
    outputPath,
    JSON.stringify(allSnippets, null, 2)
  );

  console.log(`\n✅ Processing complete!`);
  console.log(`\nResults:`);
  results.forEach(r => {
    console.log(`   ${r.guest}: ${r.totalSegments} guest-only segments`);
  });
  console.log(`\nTotal snippets: ${allSnippets.length}`);
  console.log(`Saved to: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('1. Review the generated snippets in processedSnippets.json');
  console.log('2. Update your app to use these snippets instead of generated ones');
}

main().catch(console.error);
