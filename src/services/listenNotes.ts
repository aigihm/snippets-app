interface PodcastSearchResult {
  id: string;
  title: string;
  publisher: string;
  image: string;
  thumbnail: string;
  description: string;
  rss: string;
}

interface Episode {
  id: string;
  title: string;
  description: string;
  audio: string;
  audio_length_sec: number;
  pub_date_ms: number;
  thumbnail: string;
  podcast: {
    id: string;
    title: string;
    publisher: string;
  };
}

const API_KEY = import.meta.env.VITE_LISTEN_NOTES_API_KEY;
const BASE_URL = 'https://listen-api.listennotes.com/api/v2';

export const listenNotesService = {
  async searchPodcasts(query: string, _genre = 'News'): Promise<PodcastSearchResult[]> {
    const response = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&type=podcast&genre_ids=1489&sort_by_date=1&published_after=${Date.now() - 7 * 24 * 60 * 60 * 1000}`,
      {
        headers: {
          'X-ListenAPI-Key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search podcasts');
    }

    const data = await response.json();
    return data.results || [];
  },

  async getPodcastEpisodes(podcastId: string, since: number = Date.now() - 7 * 24 * 60 * 60 * 1000): Promise<Episode[]> {
    const response = await fetch(
      `${BASE_URL}/podcasts/${podcastId}?sort=recent_first`,
      {
        headers: {
          'X-ListenAPI-Key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get podcast episodes');
    }

    const data = await response.json();
    const episodes = data.episodes || [];

    // Filter to only include episodes from the last 7 days
    return episodes.filter((ep: Episode) => ep.pub_date_ms >= since);
  },

  async getBestPodcasts(_genre = 'News', region = 'us'): Promise<PodcastSearchResult[]> {
    const response = await fetch(
      `${BASE_URL}/best_podcasts?genre_id=1489&region=${region}&safe_mode=0`,
      {
        headers: {
          'X-ListenAPI-Key': API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get best podcasts');
    }

    const data = await response.json();
    return data.podcasts || [];
  },

  async getEpisodeById(episodeId: string): Promise<Episode> {
    const response = await fetch(`${BASE_URL}/episodes/${episodeId}`, {
      headers: {
        'X-ListenAPI-Key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get episode');
    }

    return response.json();
  },
};
