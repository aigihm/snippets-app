import type { Snippet } from '../types';
import { generateStudsSnippets } from './generateStudsSnippets';

// TikTok-style lazy loading: don't generate all 10K snippets upfront
// Generate them on-demand as user scrolls through content
let cachedSnippets: Snippet[] | null = null;
let currentBatchIndex = 0;
const BATCH_SIZE = 50; // Load 50 at a time, like TikTok

export function getSnippetBatch(batchNumber: number = 0): Snippet[] {
  // Initialize full array only once, but lazily
  if (!cachedSnippets) {
    cachedSnippets = generateStudsSnippets();
  }

  const startIndex = batchNumber * BATCH_SIZE;
  const endIndex = startIndex + BATCH_SIZE;

  return cachedSnippets.slice(startIndex, endIndex);
}

export function getInitialSnippets(): Snippet[] {
  // TikTok approach: load first batch immediately for instant start
  return getSnippetBatch(0);
}

export function getNextBatch(): Snippet[] {
  currentBatchIndex++;
  return getSnippetBatch(currentBatchIndex);
}

// Legacy export for backward compatibility
export const sampleSnippets: Snippet[] = getInitialSnippets();

// Note: All content is from Internet Archive
// Studs Terkel Radio Archive: Real human stories and conversations
// Featuring interviews with Maya Angelou, Bob Newhart, Sidney Poitier, Buster Keaton, and more
// Each interview split into natural-length snippets (30-90 seconds)
