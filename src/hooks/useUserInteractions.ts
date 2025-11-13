import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserInteraction } from '../types';

export const useUserInteractions = (userId: string | null) => {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchInteractions();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchInteractions = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInteractions(data || []);
    } catch (err) {
      console.error('Error fetching interactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addInteraction = useCallback(
    async (
      snippetId: string,
      type: 'play' | 'skip' | 'like' | 'save' | 'complete',
      listenDuration: number = 0
    ) => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('user_interactions')
          .insert({
            user_id: userId,
            snippet_id: snippetId,
            interaction_type: type,
            listen_duration: listenDuration,
          } as any)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setInteractions((prev) => [data as UserInteraction, ...prev]);
        }
      } catch (err) {
        console.error('Error adding interaction:', err);
      }
    },
    [userId]
  );

  return { interactions, loading, addInteraction, refetch: fetchInteractions };
};
