import type { Snippet } from '../types';
import { generateStudsSnippets } from './generateStudsSnippets';

// Sample audio snippets for demo mode
// Using Studs Terkel Radio Archive from Internet Archive - public domain content
// 5000 snippets generated from legendary WFMT interviews (1952-1997)
export const sampleSnippets: Snippet[] = generateStudsSnippets();

// Note: All content is from Internet Archive
// Studs Terkel Radio Archive: Real human stories and conversations
// Featuring interviews with Maya Angelou, Bob Newhart, Sidney Poitier, Buster Keaton, and more
// Each interview split into natural-length snippets (30-90 seconds)
