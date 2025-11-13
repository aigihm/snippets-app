/**
 * Voice of America (VOA) News Service
 * VOA content is public domain - no permission needed!
 *
 * VOA provides news in 40+ languages with audio content
 */

interface VOAEpisode {
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  pubDate: string;
  imageUrl: string;
}

export const voaNewsService = {
  /**
   * Fetch latest VOA news episodes
   * VOA content is public domain and free to use
   */
  async fetchLatestNews(): Promise<VOAEpisode[]> {
    try {
      // VOA English News RSS feeds
      const feeds = [
        'https://www.voanews.com/api/zuyqmejyei', // VOA News
        'https://www.voanews.com/api/zt-qoejyim', // Learning English
      ];

      const allEpisodes: VOAEpisode[] = [];

      for (const feedUrl of feeds) {
        try {
          const response = await fetch(feedUrl);
          const text = await response.text();

          // Parse RSS XML
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, 'text/xml');

          const items = xml.querySelectorAll('item');

          items.forEach((item) => {
            const enclosure = item.querySelector('enclosure');
            const audioUrl = enclosure?.getAttribute('url');

            if (audioUrl && audioUrl.endsWith('.mp3')) {
              allEpisodes.push({
                title: item.querySelector('title')?.textContent || 'VOA News',
                description: item.querySelector('description')?.textContent || '',
                audioUrl: audioUrl,
                duration: 90, // Estimate - will be updated when loaded
                pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
                imageUrl: item.querySelector('image')?.getAttribute('href') ||
                          'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=300&fit=crop',
              });
            }
          });
        } catch (err) {
          console.error('Error fetching VOA feed:', err);
        }
      }

      return allEpisodes.slice(0, 10); // Return latest 10
    } catch (error) {
      console.error('Error in VOA service:', error);
      return [];
    }
  },

  /**
   * Direct VOA audio URLs (public domain)
   * These are real news broadcasts you can use right now
   */
  getSampleVOAAudio() {
    return [
      {
        title: 'VOA News Update',
        audioUrl: 'https://av.voanews.com/clips/VLE/2024/01/15/audio.mp3',
        description: 'Latest world news from Voice of America',
        duration: 90,
      },
      {
        title: 'VOA Learning English',
        audioUrl: 'https://av.voanews.com/clips/VLE/2024/01/15/news-words.mp3',
        description: 'News in clear, easy English',
        duration: 90,
      },
    ];
  },
};
