import { useState, useCallback, useRef } from 'react';
import { AudioPlayer } from './components/AudioPlayer';
import { Auth } from './components/Auth';
import { useAuth } from './hooks/useAuth';
import { useSnippets } from './hooks/useSnippets';
import { useUserInteractions } from './hooks/useUserInteractions';
import { useRecommendations } from './hooks/useRecommendations';
import { useMediaSession } from './hooks/useMediaSession';
import { sampleSnippets } from './data/sampleSnippets';

// Demo mode - enable to skip auth and use sample data
const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_DEMO_MODE === 'true';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { snippets, loading: snippetsLoading } = useSnippets(user?.id || null);
  const { interactions, addInteraction } = useUserInteractions(user?.id || null);
  const { recommendedSnippets, loading: recoLoading } = useRecommendations(
    user?.id || null,
    snippets,
    interactions
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoMode, setDemoMode] = useState(DEMO_MODE);
  const [shuffledDemoSnippets] = useState(() => {
    // Fisher-Yates shuffle - more efficient than sort()
    const shuffled = [...sampleSnippets];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  // Use shuffled demo snippets in demo mode, otherwise use recommended snippets
  const activeSnippets = demoMode ? shuffledDemoSnippets : recommendedSnippets;
  const currentSnippet = activeSnippets[currentIndex] || null;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Media Session handlers
  const mediaSessionHandlers = {
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onSeekBackward: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      }
    },
    onSeekForward: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration,
          audioRef.current.currentTime + 10
        );
      }
    },
    onPreviousTrack: () => handlePrevious(),
    onNextTrack: () => handleSkip(),
  };

  useMediaSession(currentSnippet, isPlaying, mediaSessionHandlers);

  const handleSkip = useCallback(() => {
    if (currentIndex < activeSnippets.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Loop back to start
      setCurrentIndex(0);
    }
  }, [currentIndex, activeSnippets.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleLike = useCallback(
    (snippetId: string) => {
      console.log('Liked snippet:', snippetId);
      // In demo mode, just log. In real mode, track interaction
    },
    []
  );

  const handleSave = useCallback(
    (snippetId: string) => {
      console.log('Save snippet to playlist:', snippetId);
      alert('Snippet saved! 🎉');
    },
    []
  );

  const handleInteraction = useCallback(
    (
      snippetId: string,
      type: 'play' | 'skip' | 'like' | 'save' | 'complete',
      listenDuration: number
    ) => {
      if (!demoMode) {
        addInteraction(snippetId, type, listenDuration);
      }
    },
    [addInteraction, demoMode]
  );

  const handleTryDemo = () => {
    setDemoMode(true);
  };

  // Show auth screen if not in demo mode and not logged in
  if (!demoMode && authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-spotify-black">
        <div className="text-spotify-light-gray text-lg">Loading...</div>
      </div>
    );
  }

  if (!demoMode && !user) {
    return (
      <div>
        <Auth onSignIn={signIn} onSignUp={signUp} />
        {/* Demo mode button on auth screen */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <button
            onClick={handleTryDemo}
            className="px-8 py-3 bg-spotify-green text-white rounded-full font-semibold hover:bg-opacity-90 transition-all shadow-lg"
          >
            Try Demo (No Sign Up Required)
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching snippets (skip in demo mode)
  if (!demoMode && (snippetsLoading || recoLoading)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-spotify-black">
        <div className="text-spotify-light-gray text-lg mb-4">
          Loading your personalized feed...
        </div>
        <div className="w-48 h-1 bg-spotify-gray rounded-full overflow-hidden">
          <div className="h-full bg-spotify-green animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  // Show empty state if no snippets (skip in demo mode)
  if (!demoMode && activeSnippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-spotify-black p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">No Snippets Available</h2>
          <p className="text-spotify-light-gray mb-6">
            We're still building your feed. Please check back later!
          </p>
          <button
            onClick={signOut}
            className="px-6 py-2 bg-spotify-gray text-white rounded-full hover:bg-opacity-80 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <AudioPlayer
        snippet={currentSnippet}
        onSkip={handleSkip}
        onPrevious={handlePrevious}
        onLike={handleLike}
        onSave={handleSave}
        onInteraction={handleInteraction}
      />

      {/* Top bar with demo badge or sign out */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4">
        {demoMode && (
          <div className="px-3 py-1 bg-spotify-green rounded-full text-xs font-semibold text-white">
            DEMO MODE
          </div>
        )}
        {!demoMode && user && (
          <button
            onClick={signOut}
            className="ml-auto px-4 py-2 bg-spotify-gray bg-opacity-50 text-spotify-light-gray hover:text-white rounded-full text-sm transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="text-spotify-light-gray text-xs">
          {currentIndex + 1} / {activeSnippets.length}
        </div>
      </div>

      {/* Share button in demo mode */}
      {demoMode && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied! Share with your friends 🎉');
            }}
            className="px-6 py-2 bg-spotify-green text-white rounded-full text-sm font-semibold hover:bg-opacity-90 transition-all shadow-lg"
          >
            Share with Friends
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
