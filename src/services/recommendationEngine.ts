import type { Snippet, UserInteraction, UserPreferences } from '../types';

/**
 * Hybrid recommendation engine inspired by TikTok's approach
 * Combines:
 * 1. Collaborative filtering (users with similar tastes)
 * 2. Content-based filtering (snippet features)
 * 3. Contextual signals (time of day, recent interactions)
 * 4. Exploration vs exploitation (balance popular vs new content)
 */
export class RecommendationEngine {
  // Weight parameters for different signals
  private readonly CONTENT_WEIGHT = 0.4;
  private readonly COLLABORATIVE_WEIGHT = 0.3;
  private readonly FRESHNESS_WEIGHT = 0.15;
  private readonly POPULARITY_WEIGHT = 0.15;

  // Exploration rate (percentage of random/exploratory recommendations)
  private readonly EXPLORATION_RATE = 0.1;

  // TikTok-style cold start: show random content for first N interactions
  private readonly COLD_START_THRESHOLD = 10;

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(
    userId: string,
    userInteractions: UserInteraction[],
    userPreferences: UserPreferences,
    allSnippets: Snippet[],
    allUserInteractions: UserInteraction[],
    count: number = 10
  ): Promise<Snippet[]> {
    // Get snippets the user hasn't seen yet
    const seenSnippetIds = new Set(userInteractions.map((i) => i.snippet_id));
    const unseenSnippets = allSnippets.filter((s) => !seenSnippetIds.has(s.id));

    if (unseenSnippets.length === 0) {
      // If user has seen everything, reshuffle all content
      return this.shuffleArray(allSnippets).slice(0, count);
    }

    // COLD START PHASE: TikTok-style random exploration for new users
    // Show completely random content for first 5-10 interactions to learn preferences
    if (userInteractions.length < this.COLD_START_THRESHOLD) {
      return this.shuffleArray(unseenSnippets).slice(0, count);
    }

    // WARM START PHASE: Start using the algorithm with high exploration
    // Gradually reduce randomness as we learn more about the user
    let explorationRate = this.EXPLORATION_RATE;
    if (userInteractions.length < this.COLD_START_THRESHOLD * 2) {
      // Between 10-20 interactions: use 30% exploration instead of 10%
      explorationRate = 0.3;
    }

    // Calculate scores for all unseen snippets
    const scoredSnippets = unseenSnippets.map((snippet) => ({
      snippetId: snippet.id,
      score: this.calculateSnippetScore(
        snippet,
        userId,
        userInteractions,
        userPreferences,
        allUserInteractions,
        allSnippets
      ),
    }));

    // Sort by score descending
    scoredSnippets.sort((a, b) => b.score - a.score);

    // Apply exploration: replace some top recommendations with random ones
    const explorationCount = Math.floor(count * explorationRate);
    const exploitationCount = count - explorationCount;

    const topRecommendations = scoredSnippets.slice(0, exploitationCount);
    const randomRecommendations = this.shuffleArray(
      scoredSnippets.slice(exploitationCount)
    ).slice(0, explorationCount);

    const finalRecommendations = [
      ...topRecommendations,
      ...randomRecommendations,
    ];

    // Convert back to Snippet objects
    return finalRecommendations
      .map((rec) => unseenSnippets.find((s) => s.id === rec.snippetId))
      .filter((s): s is Snippet => s !== undefined);
  }

  /**
   * Calculate recommendation score for a snippet
   */
  private calculateSnippetScore(
    snippet: Snippet,
    userId: string,
    userInteractions: UserInteraction[],
    userPreferences: UserPreferences,
    allInteractions: UserInteraction[],
    allSnippets: Snippet[]
  ): number {
    const contentScore = this.calculateContentScore(snippet, userInteractions, userPreferences, allSnippets);
    const collaborativeScore = this.calculateCollaborativeScore(snippet, userId, allInteractions);
    const freshnessScore = this.calculateFreshnessScore(snippet);
    const popularityScore = this.calculatePopularityScore(snippet, allInteractions);

    return (
      contentScore * this.CONTENT_WEIGHT +
      collaborativeScore * this.COLLABORATIVE_WEIGHT +
      freshnessScore * this.FRESHNESS_WEIGHT +
      popularityScore * this.POPULARITY_WEIGHT
    );
  }

  /**
   * Content-based filtering: match snippet features to user preferences
   */
  private calculateContentScore(
    snippet: Snippet,
    userInteractions: UserInteraction[],
    userPreferences: UserPreferences,
    allSnippets?: Snippet[]
  ): number {
    let score = 0;

    // Topic matching
    const topicMatches = snippet.topics.filter((topic) =>
      userPreferences.preferred_topics.includes(topic)
    ).length;
    const topicPenalties = snippet.topics.filter((topic) =>
      userPreferences.disliked_topics.includes(topic)
    ).length;

    score += topicMatches * 0.3 - topicPenalties * 0.5;

    // Analyze user's past interactions to infer preferences
    const likedInteractions = userInteractions.filter((i) => i.interaction_type === 'like');
    // const completedSnippets = userInteractions.filter((i) => i.interaction_type === 'complete');
    const skippedInteractions = userInteractions.filter((i) => i.interaction_type === 'skip');

    // Sentiment matching (if user tends to like certain sentiments)
    const userSentimentPreference = this.inferSentimentPreference(likedInteractions, allSnippets);
    if (snippet.sentiment === userSentimentPreference) {
      score += 0.2;
    }

    // Penalize if similar to skipped content
    const skipPenalty = this.calculateSimilarityToSkipped(snippet, skippedInteractions, allSnippets);
    score -= skipPenalty * 0.3;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Collaborative filtering: find similar users and recommend what they liked
   */
  private calculateCollaborativeScore(
    snippet: Snippet,
    _userId: string,
    allInteractions: UserInteraction[]
  ): number {
    // Find users who interacted with this snippet
    const snippetInteractions = allInteractions.filter(
      (i) => i.snippet_id === snippet.id
    );

    if (snippetInteractions.length === 0) {
      return 0.5; // Neutral score for new content
    }

    // Calculate positive vs negative interactions
    const likes = snippetInteractions.filter((i) => i.interaction_type === 'like').length;
    const completes = snippetInteractions.filter((i) => i.interaction_type === 'complete').length;
    const skips = snippetInteractions.filter((i) => i.interaction_type === 'skip').length;

    const positiveSignals = likes * 2 + completes;
    const negativeSignals = skips;
    const total = positiveSignals + negativeSignals;

    if (total === 0) return 0.5;

    return positiveSignals / total;
  }

  /**
   * Freshness score: boost newer content
   */
  private calculateFreshnessScore(snippet: Snippet): number {
    const now = Date.now();
    const createdAt = new Date(snippet.created_at).getTime();
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

    // Exponential decay: newer content gets higher score
    return Math.exp(-ageInDays / 7); // Decay over 7 days
  }

  /**
   * Popularity score: boost content others are engaging with
   */
  private calculatePopularityScore(
    snippet: Snippet,
    allInteractions: UserInteraction[]
  ): number {
    const snippetInteractions = allInteractions.filter(
      (i) => i.snippet_id === snippet.id
    );

    if (snippetInteractions.length === 0) return 0.3; // Boost new content slightly

    // Recent interactions matter more
    const recentInteractions = snippetInteractions.filter((i) => {
      const age = Date.now() - new Date(i.created_at).getTime();
      return age < 24 * 60 * 60 * 1000; // Last 24 hours
    });

    const likes = recentInteractions.filter((i) => i.interaction_type === 'like').length;
    const completes = recentInteractions.filter((i) => i.interaction_type === 'complete').length;

    // Normalize by total recent activity
    const totalRecentActivity = Math.max(1, recentInteractions.length);
    return Math.min(1, (likes + completes) / totalRecentActivity);
  }

  /**
   * Helper: infer user's sentiment preference from liked content
   */
  private inferSentimentPreference(
    likedInteractions: UserInteraction[],
    allSnippets?: Snippet[]
  ): 'positive' | 'negative' | 'neutral' {
    if (!allSnippets || likedInteractions.length === 0) {
      return 'neutral';
    }

    // Get snippets that the user liked
    const likedSnippetIds = new Set(likedInteractions.map((i) => i.snippet_id));
    const likedSnippets = allSnippets.filter((s) => likedSnippetIds.has(s.id));

    if (likedSnippets.length === 0) {
      return 'neutral';
    }

    // Count sentiment occurrences
    const sentimentCounts = {
      positive: likedSnippets.filter((s) => s.sentiment === 'positive').length,
      negative: likedSnippets.filter((s) => s.sentiment === 'negative').length,
      neutral: likedSnippets.filter((s) => s.sentiment === 'neutral').length,
    };

    // Return the sentiment with highest count
    if (sentimentCounts.positive > sentimentCounts.negative && sentimentCounts.positive > sentimentCounts.neutral) {
      return 'positive';
    } else if (sentimentCounts.negative > sentimentCounts.positive && sentimentCounts.negative > sentimentCounts.neutral) {
      return 'negative';
    }
    return 'neutral';
  }

  /**
   * Helper: calculate how similar a snippet is to skipped content
   * Uses Jaccard similarity for topics and keywords
   */
  private calculateSimilarityToSkipped(
    snippet: Snippet,
    skippedInteractions: UserInteraction[],
    allSnippets?: Snippet[]
  ): number {
    if (!allSnippets || skippedInteractions.length === 0) {
      return 0;
    }

    // Get snippets that were skipped
    const skippedSnippetIds = new Set(skippedInteractions.map((i) => i.snippet_id));
    const skippedSnippets = allSnippets.filter((s) => skippedSnippetIds.has(s.id));

    if (skippedSnippets.length === 0) {
      return 0;
    }

    // Calculate average similarity to all skipped content
    let totalSimilarity = 0;

    for (const skippedSnippet of skippedSnippets) {
      // Topic similarity (Jaccard index)
      const topicSimilarity = this.calculateJaccardSimilarity(
        snippet.topics,
        skippedSnippet.topics
      );

      // Keyword similarity (Jaccard index)
      const keywordSimilarity = this.calculateJaccardSimilarity(
        snippet.keywords,
        skippedSnippet.keywords
      );

      // Sentiment match (binary)
      const sentimentMatch = snippet.sentiment === skippedSnippet.sentiment ? 1 : 0;

      // Weighted average: topics matter most, then keywords, then sentiment
      const similarity = (
        topicSimilarity * 0.5 +
        keywordSimilarity * 0.3 +
        sentimentMatch * 0.2
      );

      totalSimilarity += similarity;
    }

    // Return average similarity score (0-1)
    return totalSimilarity / skippedSnippets.length;
  }

  /**
   * Calculate Jaccard similarity between two arrays
   * Jaccard = intersection / union
   */
  private calculateJaccardSimilarity(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 && arr2.length === 0) {
      return 0;
    }

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    // Intersection
    const intersection = [...set1].filter((x) => set2.has(x)).length;

    // Union
    const union = new Set([...set1, ...set2]).size;

    if (union === 0) {
      return 0;
    }

    return intersection / union;
  }

  /**
   * Fisher-Yates shuffle
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const recommendationEngine = new RecommendationEngine();
