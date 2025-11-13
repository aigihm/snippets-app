import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Rewind,
  FastForward,
  ThumbsUp,
  Plus,
} from 'lucide-react';
import type { Snippet } from '../types';

interface AudioPlayerProps {
  snippet: Snippet | null;
  onSkip: () => void;
  onLike: (snippetId: string) => void;
  onSave: (snippetId: string) => void;
  onInteraction: (
    snippetId: string,
    type: 'play' | 'skip' | 'like' | 'save' | 'complete',
    listenDuration: number
  ) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  snippet,
  onSkip,
  onLike,
  onSave,
  onInteraction,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (snippet && audioRef.current) {
      audioRef.current.src = snippet.audio_url;
      audioRef.current.load();
      setIsPlaying(true);
      setIsLiked(false);
      startTimeRef.current = Date.now();
    }
  }, [snippet]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (snippet) {
        const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onInteraction(snippet.id, 'complete', listenDuration);
        onSkip(); // Auto-play next snippet
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [snippet, onInteraction, onSkip]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (snippet && !isPlaying) {
      const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onInteraction(snippet.id, 'play', listenDuration);
    }
  };

  const handleSkip = () => {
    if (snippet) {
      const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onInteraction(snippet.id, 'skip', listenDuration);
    }
    setIsPlaying(false);
    onSkip();
  };

  const handleRewindToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleRewind10 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const handleForward10 = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      );
    }
  };

  const handleLike = () => {
    if (snippet) {
      setIsLiked(!isLiked);
      const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onInteraction(snippet.id, 'like', listenDuration);
      onLike(snippet.id);
    }
  };

  const handleSave = () => {
    if (snippet) {
      const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onInteraction(snippet.id, 'save', listenDuration);
      onSave(snippet.id);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!snippet) {
    return (
      <div className="flex items-center justify-center h-screen bg-spotify-black">
        <div className="text-spotify-light-gray text-lg">Loading snippets...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-spotify-gray to-spotify-black p-6">
      <audio ref={audioRef} preload="auto" />

      {/* Album Art / Thumbnail */}
      <div className="mb-8">
        <div className="w-72 h-72 bg-spotify-gray rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
          {snippet.thumbnail_url ? (
            <img
              src={snippet.thumbnail_url}
              alt={snippet.podcast_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl text-spotify-light-gray">🎙️</div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-8 max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">{snippet.podcast_title}</h2>
        <p className="text-spotify-light-gray text-sm mb-1">{snippet.podcast_author}</p>
        <p className="text-spotify-light-gray text-xs line-clamp-2">
          {snippet.description}
        </p>
        {snippet.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {snippet.topics.slice(0, 3).map((topic, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-spotify-gray rounded-full text-xs text-spotify-light-gray"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-6">
        <div
          className="w-full h-1 bg-spotify-gray rounded-full cursor-pointer mb-2"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-spotify-green rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-spotify-light-gray">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-6 mb-8">
        <button
          onClick={handleRewindToStart}
          className="text-spotify-light-gray hover:text-white transition-colors"
          aria-label="Rewind to start"
        >
          <SkipBack size={32} />
        </button>

        <button
          onClick={handleRewind10}
          className="text-spotify-light-gray hover:text-white transition-colors"
          aria-label="Rewind 10 seconds"
        >
          <Rewind size={28} />
        </button>

        <button
          onClick={togglePlayPause}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={32} className="text-black" fill="black" />
          ) : (
            <Play size={32} className="text-black ml-1" fill="black" />
          )}
        </button>

        <button
          onClick={handleForward10}
          className="text-spotify-light-gray hover:text-white transition-colors"
          aria-label="Forward 10 seconds"
        >
          <FastForward size={28} />
        </button>

        <button
          onClick={handleSkip}
          className="text-spotify-light-gray hover:text-white transition-colors"
          aria-label="Skip to next"
        >
          <SkipForward size={32} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleLike}
          className={`p-3 rounded-full transition-all ${
            isLiked
              ? 'bg-spotify-green text-white'
              : 'bg-spotify-gray text-spotify-light-gray hover:text-white'
          }`}
          aria-label="Like snippet"
        >
          <ThumbsUp size={24} fill={isLiked ? 'white' : 'none'} />
        </button>

        <button
          onClick={handleSave}
          className="p-3 bg-spotify-gray text-spotify-light-gray hover:text-white rounded-full transition-colors"
          aria-label="Save to playlist"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};
