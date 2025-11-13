import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { recommendationEngine } from '../services/recommendationEngine';
import type { Snippet, UserInteraction, UserPreferences } from '../types';

export const useRecommendations = (
  userId: string | null,
  snippets: Snippet[],
  userInteractions: UserInteraction[]
) => {
  const [recommendedSnippets, setRecommendedSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && snippets.length > 0) {
      generateRecommendations();
    } else if (snippets.length > 0) {
      // For non-authenticated users, just shuffle snippets
      setRecommendedSnippets([...snippets].sort(() => Math.random() - 0.5));
      setLoading(false);
    }
  }, [userId, snippets, userInteractions]);

  const generateRecommendations = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch user preferences
      const { data: preferencesData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const preferences: UserPreferences = preferencesData || {
        user_id: userId,
        preferred_topics: [],
        disliked_topics: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Fetch all interactions (for collaborative filtering)
      const { data: allInteractions } = await supabase
        .from('user_interactions')
        .select('*');

      const recommendations = await recommendationEngine.getRecommendations(
        userId,
        userInteractions,
        preferences,
        snippets,
        allInteractions || [],
        20 // Get 20 recommendations
      );

      setRecommendedSnippets(recommendations);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      // Fallback to random shuffle
      setRecommendedSnippets([...snippets].sort(() => Math.random() - 0.5));
    } finally {
      setLoading(false);
    }
  };

  return { recommendedSnippets, loading, regenerate: generateRecommendations };
};
