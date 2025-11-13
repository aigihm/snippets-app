import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Snippet } from '../types';

export const useSnippets = (userId: string | null) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSnippets();
  }, [userId]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setSnippets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch snippets');
      console.error('Error fetching snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  return { snippets, loading, error, refetch: fetchSnippets };
};
