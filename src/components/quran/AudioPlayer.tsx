import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useQuran } from '@/context/QuranContext';
import { getAyahAudioUrl } from '@/lib/quran-api';
import { RECITERS } from '@/types/quran';

interface AudioPlayerProps {
  surahNumber: number;
  totalAyahs: number;
  currentAyah: number;
  onAyahChange: (ayahNumber: number) => void;
  surahName: string;
  onClose: () => void;
  onNextSurah?: () => void; // Callback to navigate to next surah
}

export default function AudioPlayer({
  surahNumber,
  totalAyahs,
  currentAyah,
  onAyahChange,
  surahName,
  onClose,
  onNextSurah,
}: AudioPlayerProps) {
  const { settings } = useQuran();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null); // For preloading next ayah
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we were playing before a change (reciter/ayah)
  const wasPlayingRef = useRef(false);
  // Get current reciter name
  const currentReciter = RECITERS.find(r => r.identifier === settings.selectedReciter);
  const [continuousPlay, setContinuousPlay] = useState(true); // Auto-continue to next surah
  // Initialize audio element and preloader
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    // Create preload audio element for next ayah
    const preload = new Audio();
    preload.preload = 'auto';
    preload.volume = 0; // Silent preload
    preloadRef.current = preload;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsLoading(false);
      setError('Audio failed to load');
      setIsPlaying(false);
    };
    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setError(null);
      // Auto-resume if we were playing
      if (wasPlayingRef.current) {
        audio.play().catch(console.error);
      }
    };
    const handleWaiting = () => setIsLoading(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('waiting', handleWaiting);
      audio.pause();
      audio.src = '';
      preload.src = '';
    };
  }, []);

  // Load audio when ayah or reciter changes
  useEffect(() => {
    if (audioRef.current) {
      // Only update wasPlayingRef if we're not already in a "keep playing" state
      // (e.g., when user changes reciter or ayah manually while playing)
      if (!wasPlayingRef.current) {
        wasPlayingRef.current = isPlaying;
      }
      loadAudio(currentAyah);
    }
  }, [currentAyah, settings.selectedReciter, surahNumber]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const loadAudio = useCallback((ayahNum: number) => {
    if (!audioRef.current) return;
    setIsLoading(true);
    setError(null);
    const url = getAyahAudioUrl(surahNumber, ayahNum, settings.selectedReciter);
    audioRef.current.src = url;
    audioRef.current.load();
  }, [surahNumber, settings.selectedReciter]);

  // Preload the next ayah for instant transitions
  const preloadNextAyah = useCallback((nextAyahNum: number, nextSurahNum?: number) => {
    if (!preloadRef.current) return;
    const surah = nextSurahNum || surahNumber;
    const url = getAyahAudioUrl(surah, nextAyahNum, settings.selectedReciter);
    preloadRef.current.src = url;
    preloadRef.current.load();
  }, [surahNumber, settings.selectedReciter]);

  // Preload next ayah when current one is playing
  useEffect(() => {
    if (isPlaying && currentAyah < totalAyahs) {
      preloadNextAyah(currentAyah + 1);
    } else if (isPlaying && currentAyah === totalAyahs && continuousPlay && surahNumber < 114) {
      // Preload first ayah of next surah
      preloadNextAyah(1, surahNumber + 1);
    }
  }, [isPlaying, currentAyah, totalAyahs, surahNumber, continuousPlay, preloadNextAyah]);
  const handleEnded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isRepeat) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
      return;
    }

    if (currentAyah < totalAyahs) {
      wasPlayingRef.current = true; // Keep playing for next ayah
      onAyahChange(currentAyah + 1);
      return;
    }

    // End of surah - continue to next surah if enabled
    if (continuousPlay && surahNumber < 114 && onNextSurah) {
      wasPlayingRef.current = true;
      onNextSurah();
      return;
    }

    wasPlayingRef.current = false;
    setIsPlaying(false);
  }, [isRepeat, currentAyah, totalAyahs, onAyahChange, continuousPlay, surahNumber, onNextSurah]);

  // Attach ended handler
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = handleEnded;
    }
  }, [handleEnded]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setError(null);
    
    if (isPlaying) {
      wasPlayingRef.current = false;
      audioRef.current.pause();
    } else {
      wasPlayingRef.current = true;
      setIsLoading(true);
      audioRef.current.play()
        .then(() => setIsLoading(false))
        .catch((err) => {
          console.error('Playback error:', err);
          setError('Playback failed. Try again.');
          setIsLoading(false);
          wasPlayingRef.current = false;
        });
    }
  };

  const playPrevious = () => {
    if (currentAyah > 1) {
      wasPlayingRef.current = true;
      onAyahChange(currentAyah - 1);
    }
  };

  const playNext = () => {
    if (currentAyah < totalAyahs) {
      wasPlayingRef.current = true;
      onAyahChange(currentAyah + 1);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && isFinite(value[0])) {
      audioRef.current.currentTime = value[0];
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/98 backdrop-blur-xl shadow-2xl">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-center text-xs text-destructive mb-2">{error}</p>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{surahName}</p>
            <p className="text-xs text-muted-foreground">
              Ayah {currentAyah} of {totalAyahs} • {currentReciter?.englishName || 'Reciter'}
            </p>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`h-9 w-9 ${isRepeat ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              disabled={currentAyah <= 1}
              className="h-9 w-9"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              disabled={currentAyah >= totalAyahs}
              className="h-9 w-9"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-9 w-9 hidden sm:flex"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Volume & Close */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <div className="hidden md:flex items-center gap-2 w-24">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={([v]) => {
                  setVolume(v);
                  setIsMuted(false);
                }}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground h-9 w-9"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}