/**
 * Script to generate intelligent BBC snippet segmentation using Whisper API
 *
 * This script:
 * 1. Fetches BBC audio files from Internet Archive
 * 2. Transcribes them using OpenAI Whisper API (with word timestamps)
 * 3. Intelligently segments based on natural breakpoints
 * 4. Generates snippet data with proper start/end times
 *
 * Usage:
 *   npm install openai
 *   export OPENAI_API_KEY="your-key"
 *   npx tsx scripts/generateSnippetsFromBBC.ts
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  words: TranscriptWord[];
}

interface SnippetData {
  audio_url: string;
  start_time: number;
  end_time: number;
  duration: number;
  transcript: string;
  episode_title: string;
  description: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BBC_COLLECTIONS = {
  sciFi: 'https://archive.org/download/bbc-sci-fi-radio-plays-part-seven',
  sherlock: 'https://archive.org/download/SherlockHolmes-CliveMerrissonBBCAudiodramas',
};

// BBC Sci-Fi dramas we want to process
const sciFiDramas = [
  { filename: 'Nightfall%20-%20Isaac%20Asimov.mp3', title: 'Nightfall by Isaac Asimov' },
  { filename: 'The%20Last%20Question%20by%20Isaac%20Asimov.mp3', title: 'The Last Question by Isaac Asimov' },
  { filename: 'There%20Will%20Come%20Soft%20Rains%20by%20Ray%20Bradbury%20-%20BBC%20Radio%20Drama.mp3', title: 'There Will Come Soft Rains by Ray Bradbury' },
  { filename: 'Rescue%20Party%20by%20Arthur%20C.%20Clarke.mp3', title: 'Rescue Party by Arthur C. Clarke' },
  { filename: 'Dark%20They%20Were%20And%20Golden%20Eyed%20by%20Ray%20Bradbury.mp3', title: 'Dark They Were And Golden Eyed by Ray Bradbury' },
  { filename: 'William%20and%20Mary%20by%20Roald%20Dahl.mp3', title: 'William and Mary by Roald Dahl' },
  { filename: 'Corona%20by%20Samuel%20R%20Delaney.mp3', title: 'Corona by Samuel R. Delaney' },
  { filename: 'Courtesy%20by%20Clifford%20D.%20Simak.mp3', title: 'Courtesy by Clifford D. Simak' },
  { filename: 'I%20Have%20No%20Mouth%2C%20and%20I%20Must%20Scream%20by%20Harlan%20Ellison.mp3', title: 'I Have No Mouth and I Must Scream by Harlan Ellison' },
  { filename: 'Who%20Goes%20There%20(AKA%20The%20Thing)%20by%20John%20W%20Campbell.mp3', title: 'Who Goes There (The Thing) by John W. Campbell' },
  // Add more as needed - we'll process first 10 to start
];

async function downloadAudio(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading ${url}...`);
  await execAsync(`curl -L "${url}" -o "${outputPath}"`);
  console.log(`Downloaded to ${outputPath}`);
}

async function transcribeWithWhisper(audioPath: string): Promise<TranscriptSegment[]> {
  console.log(`Transcribing ${audioPath} with Whisper...`);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
  });

  // @ts-ignore - OpenAI types don't include word timestamps yet
  const segments: TranscriptSegment[] = transcription.segments?.map((seg: any) => ({
    text: seg.text,
    start: seg.start,
    end: seg.end,
    words: seg.words || [],
  })) || [];

  console.log(`Transcribed ${segments.length} segments`);
  return segments;
}

function findNaturalBreakpoints(
  segments: TranscriptSegment[],
  minDuration = 30,
  maxDuration = 90
): SnippetData[] {
  const snippets: SnippetData[] = [];
  let currentSnippetStart = 0;
  let currentSnippetText = '';
  let currentDuration = 0;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const segmentDuration = segment.end - segment.start;
    const potentialDuration = currentDuration + segmentDuration;

    currentSnippetText += ' ' + segment.text;

    // Check if this is a natural breakpoint
    const endsWithPunctuation = /[.!?]$/.test(segment.text.trim());
    const isLongEnough = potentialDuration >= minDuration;
    const isTooLong = potentialDuration >= maxDuration;
    const isLastSegment = i === segments.length - 1;

    // Next segment might start a new sentence
    const nextStartsWithCapital = i < segments.length - 1 &&
      /^[A-Z]/.test(segments[i + 1].text.trim());

    const shouldBreak = (
      (endsWithPunctuation && isLongEnough && nextStartsWithCapital) ||
      isTooLong ||
      isLastSegment
    );

    if (shouldBreak) {
      snippets.push({
        audio_url: '', // Will be filled in later
        start_time: currentSnippetStart,
        end_time: segment.end,
        duration: segment.end - currentSnippetStart,
        transcript: currentSnippetText.trim(),
        episode_title: '',
        description: '',
      });

      currentSnippetStart = segment.end;
      currentSnippetText = '';
      currentDuration = 0;
    } else {
      currentDuration = potentialDuration;
    }
  }

  return snippets;
}

async function processAudioFile(
  audioUrl: string,
  filename: string,
  title: string,
  collectionName: string
): Promise<SnippetData[]> {
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const audioPath = path.join(tempDir, filename.replace(/%20/g, '_'));

  try {
    // Download audio
    await downloadAudio(audioUrl, audioPath);

    // Transcribe with Whisper
    const segments = await transcribeWithWhisper(audioPath);

    // Find natural breakpoints
    const snippets = findNaturalBreakpoints(segments);

    // Fill in metadata
    snippets.forEach((snippet, idx) => {
      snippet.audio_url = audioUrl;
      snippet.episode_title = `${title} - Part ${idx + 1}`;
      snippet.description = `${title} - BBC Radio Drama (Part ${idx + 1} of ${snippets.length})`;
    });

    console.log(`Generated ${snippets.length} snippets from ${title}`);

    // Clean up
    fs.unlinkSync(audioPath);

    return snippets;
  } catch (error) {
    console.error(`Error processing ${title}:`, error);
    // Clean up on error
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
    return [];
  }
}

async function generateAllSnippets() {
  const allSnippets: SnippetData[] = [];

  console.log('Starting BBC snippet generation with Whisper API...\n');

  // Process sci-fi dramas (start with first 10)
  for (const drama of sciFiDramas.slice(0, 10)) {
    const audioUrl = `${BBC_COLLECTIONS.sciFi}/${drama.filename}`;
    const snippets = await processAudioFile(
      audioUrl,
      drama.filename,
      drama.title,
      'sci-fi'
    );
    allSnippets.push(...snippets);

    // Save progress after each file
    const outputPath = path.join(process.cwd(), 'src/data/generatedSnippets.json');
    fs.writeFileSync(outputPath, JSON.stringify(allSnippets, null, 2));
    console.log(`Progress saved: ${allSnippets.length} total snippets\n`);

    // Rate limit: wait 2 seconds between API calls
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Complete! Generated ${allSnippets.length} snippets`);
  console.log(`Output saved to: src/data/generatedSnippets.json`);

  return allSnippets;
}

// Run the script
generateAllSnippets().catch(console.error);
