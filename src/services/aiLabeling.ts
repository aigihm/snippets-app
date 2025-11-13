import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, call this from backend
});

interface TranscriptionResult {
  text: string;
  segments: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

interface LabelingResult {
  topics: string[];
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  namedEntities: {
    people: string[];
    organizations: string[];
    locations: string[];
    other: string[];
  };
  summary: string;
}

export const aiLabelingService = {
  /**
   * Transcribe audio using OpenAI Whisper
   * Note: This requires a backend service as Whisper API doesn't work directly in browser
   */
  async transcribeAudio(_audioUrl: string): Promise<TranscriptionResult> {
    // In production, this would call your backend endpoint that uses Whisper
    // For now, we'll return a placeholder

    // Example backend call:
    // const response = await fetch('/api/transcribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ audioUrl }),
    // });
    // return response.json();

    return {
      text: '',
      segments: [],
    };
  },

  /**
   * Label transcript using Claude to extract topics, keywords, sentiment, and entities
   */
  async labelTranscript(transcript: string): Promise<LabelingResult> {
    const prompt = `Analyze the following podcast transcript and extract:

1. Main topics (3-5 high-level categories like "Politics", "Technology", "Health", etc.)
2. Keywords (5-10 specific important terms or phrases)
3. Sentiment (overall emotional tone: positive, negative, or neutral)
4. Named entities:
   - People (names of individuals mentioned)
   - Organizations (companies, institutions, groups)
   - Locations (places, cities, countries)
   - Other notable entities
5. A brief 1-2 sentence summary

Transcript:
${transcript}

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
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Claude response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return result;
    } catch (error) {
      console.error('Error labeling transcript:', error);
      // Return default values on error
      return {
        topics: [],
        keywords: [],
        sentiment: 'neutral',
        namedEntities: {
          people: [],
          organizations: [],
          locations: [],
          other: [],
        },
        summary: '',
      };
    }
  },

  /**
   * Process a snippet: transcribe and label
   */
  async processSnippet(audioUrl: string, existingTranscript?: string): Promise<{
    transcript: string;
    labeling: LabelingResult;
  }> {
    // Use existing transcript if provided, otherwise transcribe
    let transcript = existingTranscript || '';

    if (!transcript) {
      const transcription = await this.transcribeAudio(audioUrl);
      transcript = transcription.text;
    }

    // Label the transcript
    const labeling = await this.labelTranscript(transcript);

    return {
      transcript,
      labeling,
    };
  },
};

// Helper function to convert labeling result to snippet fields
export function applyLabelingToSnippet(
  snippet: any,
  labeling: LabelingResult,
  transcript: string
) {
  return {
    ...snippet,
    topics: labeling.topics,
    keywords: labeling.keywords,
    sentiment: labeling.sentiment,
    named_entities: labeling.namedEntities,
    transcript,
    description: labeling.summary || snippet.description,
  };
}
