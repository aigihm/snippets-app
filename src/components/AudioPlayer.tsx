import React, { useEffect, useRef, useState } from 'react';
import {
  SkipForward,
  SkipBack,
  ThumbsUp,
  Plus,
} from 'lucide-react';
import type { Snippet } from '../types';

interface AudioPlayerProps {
  snippet: Snippet | null;
  onSkip: () => void;
  onPrevious: () => void;
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
  onPrevious,
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
      const audio = audioRef.current;

      // Set source with fragment identifier for start time only
      audio.src = `${snippet.audio_url}#t=${snippet.start_time}`;

      // Preload and prepare
      audio.load();

      // When metadata is loaded, seek to start time and play
      const handleCanPlay = () => {
        if (audio.currentTime < snippet.start_time) {
          audio.currentTime = snippet.start_time;
        }
        // Start playing immediately
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log('Autoplay prevented:', error);
            setIsPlaying(false);
          });
        }
      };

      audio.addEventListener('canplay', handleCanPlay, { once: true });

      setIsLiked(false);
      setCurrentTime(0);
      setDuration(snippet.end_time - snippet.start_time);
      startTimeRef.current = Date.now();

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [snippet]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !snippet) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      // Check if we've reached the end time for this snippet
      if (audio.currentTime >= snippet.end_time) {
        const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onInteraction(snippet.id, 'complete', listenDuration);
        onSkip(); // Auto-play next snippet
      } else {
        // Set relative time (time since snippet start)
        setCurrentTime(Math.max(0, audio.currentTime - snippet.start_time));
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(snippet.end_time - snippet.start_time);
    };
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

  const handlePrevious = () => {
    if (snippet) {
      const listenDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onInteraction(snippet.id, 'skip', listenDuration);
    }
    setIsPlaying(false);
    onPrevious();
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

  const [isDragging, setIsDragging] = useState(false);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && snippet) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const snippetDuration = snippet.end_time - snippet.start_time;
      const newTime = snippet.start_time + (percentage * snippetDuration);
      audioRef.current.currentTime = newTime;
    }
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && audioRef.current && snippet) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      const snippetDuration = snippet.end_time - snippet.start_time;
      const newTime = snippet.start_time + (percentage * snippetDuration);
      audioRef.current.currentTime = newTime;
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

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
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FFFFFF', colorScheme: 'light' }}>
      <audio ref={audioRef} preload="auto" />

      {/* Fixed Content - Condensed Layout */}
      <div className="flex flex-col h-full overflow-y-auto" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-md mx-auto px-4 py-3 w-full" style={{ backgroundColor: '#FFFFFF' }}>
          {/* Artwork - Square with shadow */}
          <div className="mb-2">
            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl bg-gray-200">
              {snippet.thumbnail_url ? (
                <img
                  src={snippet.thumbnail_url}
                  alt={snippet.podcast_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🎙️</div>
              )}
            </div>
          </div>

          {/* Episode Title and Show Info */}
          <div className="mb-2">
            <h1 className="text-base font-semibold mb-0.5 line-clamp-2" style={{ color: '#111827' }}>
              {snippet.episode_title}
            </h1>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#DC2626' }}>{snippet.podcast_title}</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>{snippet.podcast_author}</p>
          </div>

          {/* Progress Slider */}
          <div className="mb-0.5">
            <div
              className="relative w-full rounded-full cursor-pointer"
              style={{ height: '8px', backgroundColor: '#D1D5DB' }}
              onClick={handleProgressClick}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleProgressDrag}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="absolute top-0 left-0 rounded-full"
                style={{
                  width: `${(currentTime / duration) * 100 || 0}%`,
                  height: '8px',
                  backgroundColor: '#DC2626'
                }}
              />
              {/* Playhead */}
              <div
                className="absolute rounded-full shadow-lg"
                style={{
                  left: `calc(${(currentTime / duration) * 100 || 0}% - 10px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #DC2626'
                }}
              />
            </div>
          </div>

          {/* Time Labels */}
          <div className="flex justify-between mb-2">
            <span className="text-xs font-normal" style={{ color: '#6B7280' }}>{formatTime(currentTime)}</span>
            <span className="text-xs font-normal" style={{ color: '#6B7280' }}>{formatTime(duration)}</span>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center justify-center gap-8 mb-3">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              className="active:scale-90 transition-transform"
              aria-label="Previous snippet"
              style={{ color: '#4B5563' }}
            >
              <SkipBack size={40} strokeWidth={1.5} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 flex-shrink-0 active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="39" fill="#1C1C1E" stroke="#1C1C1E" strokeWidth="2" />
                  <rect x="28" y="26" width="6" height="28" rx="1.5" fill="#FFFFFF" />
                  <rect x="46" y="26" width="6" height="28" rx="1.5" fill="#FFFFFF" />
                </svg>
              ) : (
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="39" fill="#1C1C1E" stroke="#1C1C1E" strokeWidth="2" />
                  <path d="M32 26l26 14-26 14V26z" fill="#FFFFFF" />
                </svg>
              )}
            </button>

            {/* Next Button */}
            <button
              onClick={handleSkip}
              className="active:scale-90 transition-transform"
              aria-label="Next snippet"
              style={{ color: '#4B5563' }}
            >
              <SkipForward size={40} strokeWidth={1.5} />
            </button>
          </div>

          {/* Bottom Action Row */}
          <div className="flex items-center justify-center gap-16 mb-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="active:scale-90 transition-transform"
              aria-label="Like"
              style={{ color: isLiked ? '#DC2626' : '#9CA3AF' }}
            >
              <ThumbsUp
                size={28}
                fill={isLiked ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </button>

            {/* Add to Library */}
            <button
              onClick={handleSave}
              className="active:scale-90 transition-transform"
              aria-label="Add to Library"
              style={{ color: '#9CA3AF' }}
            >
              <Plus size={28} strokeWidth={1.5} />
            </button>
          </div>

          {/* Description */}
          <div className="mt-2 pb-3">
            <p className="text-sm leading-relaxed" style={{ color: '#4B5563' }}>
              {snippet.description}
            </p>
            {snippet.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {snippet.topics.slice(0, 3).map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
