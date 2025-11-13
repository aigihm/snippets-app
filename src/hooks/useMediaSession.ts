import { useEffect } from 'react';
import type { Snippet } from '../types';

interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
}

export const useMediaSession = (
  snippet: Snippet | null,
  isPlaying: boolean,
  handlers: MediaSessionHandlers
) => {
  useEffect(() => {
    if (!('mediaSession' in navigator) || !snippet) {
      return;
    }

    // Set metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: snippet.podcast_title,
      artist: snippet.podcast_author,
      album: snippet.episode_title,
      artwork: snippet.thumbnail_url
        ? [
            {
              src: snippet.thumbnail_url,
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ]
        : [],
    });

    // Set playback state
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    // Set action handlers
    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('seekbackward', handlers.onSeekBackward);
    navigator.mediaSession.setActionHandler('seekforward', handlers.onSeekForward);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPreviousTrack);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNextTrack);

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('seekbackward', null);
        navigator.mediaSession.setActionHandler('seekforward', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [snippet, isPlaying, handlers]);
};
