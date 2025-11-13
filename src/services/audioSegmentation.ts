interface AudioSegment {
  startTime: number;
  endTime: number;
  duration: number;
}

// interface TranscriptWord {
//   word: string;
//   start: number;
//   end: number;
// }

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

export const audioSegmentationService = {
  /**
   * Intelligently segments audio into chunks of 30s-4min based on transcript
   * Uses natural breakpoints like sentence endings, pauses, and topic changes
   */
  segmentByTranscript(
    transcript: TranscriptSegment[],
    _audioDuration: number,
    minDuration = 30,
    maxDuration = 240
  ): AudioSegment[] {
    const segments: AudioSegment[] = [];
    let currentSegmentStart = 0;
    let currentSegmentText = '';
    let currentDuration = 0;

    for (let i = 0; i < transcript.length; i++) {
      const segment = transcript[i];
      const segmentDuration = segment.end - segment.start;
      currentDuration += segmentDuration;
      currentSegmentText += ' ' + segment.text;

      // Check if we should create a new segment
      const isNaturalBreak =
        segment.text.trim().endsWith('.') ||
        segment.text.trim().endsWith('?') ||
        segment.text.trim().endsWith('!');
      const hasMinDuration = currentDuration >= minDuration;
      const hasMaxDuration = currentDuration >= maxDuration;
      const isLastSegment = i === transcript.length - 1;

      if ((isNaturalBreak && hasMinDuration) || hasMaxDuration || isLastSegment) {
        segments.push({
          startTime: currentSegmentStart,
          endTime: segment.end,
          duration: currentDuration,
        });

        currentSegmentStart = segment.end;
        currentSegmentText = '';
        currentDuration = 0;
      }
    }

    return segments;
  },

  /**
   * Fallback method: segment by fixed time intervals with slight randomization
   * Used when transcript is not available
   */
  segmentByTime(
    audioDuration: number,
    minDuration = 30,
    maxDuration = 240
  ): AudioSegment[] {
    const segments: AudioSegment[] = [];
    let currentTime = 0;

    while (currentTime < audioDuration) {
      // Random duration between min and max
      const randomDuration =
        Math.random() * (maxDuration - minDuration) + minDuration;
      const segmentDuration = Math.min(randomDuration, audioDuration - currentTime);

      segments.push({
        startTime: currentTime,
        endTime: currentTime + segmentDuration,
        duration: segmentDuration,
      });

      currentTime += segmentDuration;
    }

    return segments;
  },

  /**
   * Hybrid approach: use silence detection combined with transcript if available
   * This would require actual audio analysis (could use Web Audio API or backend service)
   */
  async segmentBySilence(
    _audioUrl: string,
    _minDuration = 30,
    _maxDuration = 240
  ): Promise<AudioSegment[]> {
    // This is a placeholder for future implementation
    // In production, you would:
    // 1. Use Web Audio API to detect silence
    // 2. Or send to a backend service for audio analysis
    // 3. Combine silence detection with transcript boundaries

    // For now, return empty array to indicate not implemented
    return [];
  },
};

// Helper function to convert audio segment to format suitable for snippets table
export function createSnippetFromSegment(
  segment: AudioSegment,
  episodeData: {
    audioUrl: string;
    podcastTitle: string;
    podcastAuthor: string;
    episodeTitle: string;
    description: string;
    thumbnailUrl: string | null;
  }
) {
  return {
    audio_url: episodeData.audioUrl,
    podcast_title: episodeData.podcastTitle,
    podcast_author: episodeData.podcastAuthor,
    episode_title: episodeData.episodeTitle,
    description: episodeData.description,
    thumbnail_url: episodeData.thumbnailUrl,
    start_time: segment.startTime,
    end_time: segment.endTime,
    duration: segment.duration,
    topics: [] as string[],
    keywords: [] as string[],
    sentiment: 'neutral' as const,
    named_entities: {},
    transcript: '',
  };
}
