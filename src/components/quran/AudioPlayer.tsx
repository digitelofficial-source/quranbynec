import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useQuran } from '@/context/QuranContext';
import { getAyahAudioUrl } from '@/lib/quran-api';

interface AudioPlayerProps {
  surahNumber: number;
  totalAyahs: number;
  currentAyah: number;
  onAyahChange: (ayahNumber: number) => void;
  surahName: string;
  onClose: () => void;
}

export default function AudioPlayer({
  surahNumber,
  totalAyahs,
  currentAyah,
  onAyahChange,
  surahName,
  onClose,
}: AudioPlayerProps) {
  const { settings } = useQuran();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    loadAudio(currentAyah);
  }, [currentAyah, settings.selectedReciter]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const loadAudio = useCallback((ayahNum: number) => {
    if (!audioRef.current) return;
    const url = getAyahAudioUrl(surahNumber, ayahNum, settings.selectedReciter);
    audioRef.current.src = url;
    audioRef.current.load();
  }, [surahNumber, settings.selectedReciter]);

  const handleEnded = useCallback(() => {
    if (isRepeat) {
      audioRef.current?.play();
    } else if (currentAyah < totalAyahs) {
      onAyahChange(currentAyah + 1);
      setTimeout(() => audioRef.current?.play(), 100);
    } else {
      setIsPlaying(false);
    }
  }, [isRepeat, currentAyah, totalAyahs, onAyahChange]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = handleEnded;
    }
  }, [handleEnded]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const playPrevious = () => {
    if (currentAyah > 1) {
      onAyahChange(currentAyah - 1);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const playNext = () => {
    if (currentAyah < totalAyahs) {
      onAyahChange(currentAyah + 1);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg shadow-lg">
      <div className="container max-w-4xl mx-auto px-4 py-3">
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

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{surahName}</p>
            <p className="text-xs text-muted-foreground">Ayah {currentAyah} of {totalAyahs}</p>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRepeat(!isRepeat)}
              className={isRepeat ? 'text-primary' : 'text-muted-foreground'}
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              disabled={currentAyah <= 1}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={togglePlay}
            >
              {isPlaying ? (
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
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="hidden sm:flex"
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
              className="text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
