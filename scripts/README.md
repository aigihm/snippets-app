# BBC Snippet Generation with Whisper API

## Current Status

Right now, the app uses **simulated intelligent cutting** with varied durations (45-90 seconds) to feel more natural than rigid 90-second cuts.

## To Generate REAL Intelligent Snippets

When you're ready to use proper transcript-based segmentation:

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy it

### 2. Set Environment Variable

```bash
export OPENAI_API_KEY="sk-your-key-here"
```

Or create a `.env` file:
```
OPENAI_API_KEY=sk-your-key-here
```

### 3. Run the Script

```bash
npx tsx scripts/generateSnippetsFromBBC.ts
```

### What It Does

1. **Downloads** BBC audio files from Internet Archive
2. **Transcribes** using Whisper API with word-level timestamps
3. **Analyzes** transcript for natural breakpoints:
   - Sentence endings (. ! ?)
   - Paragraph breaks
   - Scene changes
   - 30-90 second duration
4. **Creates** snippets that end at logical points
5. **Saves** to `src/data/generatedSnippets.json`

### Cost

- Whisper API: $0.006 per minute
- 60-minute drama: ~$0.36
- 10 dramas (~600 min): ~$3.60
- 49 dramas + 74 Sherlock (~7500 min): ~$45

### After Generation

Once you have `generatedSnippets.json`:

1. Update `src/data/sampleSnippets.ts` to import it:
```typescript
import generatedSnippets from './generatedSnippets.json';
export const sampleSnippets = generatedSnippets;
```

2. Rebuild: `npm run build`
3. Deploy!

## Current Implementation

For now, we're using varied durations to simulate natural cuts:
- Durations range from 45-90 seconds
- Pattern varies between episodes
- Feels more natural than rigid cuts
- No API costs

When you get an OpenAI key, run the Whisper script for truly intelligent segmentation based on actual dialogue.
