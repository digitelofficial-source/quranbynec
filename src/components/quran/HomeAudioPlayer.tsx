import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuran } from '@/context/QuranContext';
import { fetchSurah, getAyahAudioUrl } from '@/lib/quran-api';
import { RECITERS, Surah } from '@/types/quran';

export default function HomeAudioPlayer() {
  const { settings, updateSettings } = useQuran();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null); // For preloading next ayah
  
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [surahInfo, setSurahInfo] = useState<Surah | null>(null);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [totalAyahs, setTotalAyahs] = useState(7);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [continuousPlay, setContinuousPlay] = useState(true); // Auto-continue to next surah

  // Track if we were playing before a reciter/surah/ayah change
  const wasPlayingRef = useRef(false);

  // Keep latest values for stable event handlers (avoid re-creating Audio elements)
  const selectedSurahRef = useRef(selectedSurah);
  const currentAyahRef = useRef(currentAyah);
  const totalAyahsRef = useRef(totalAyahs);
  const isRepeatRef = useRef(isRepeat);
  const continuousPlayRef = useRef(continuousPlay);

  const selectedReciterRef = useRef(settings.selectedReciter);
  // Effective reciter may fall back to a reliable reciter after the first error
  const effectiveReciterRef = useRef(settings.selectedReciter);

  useEffect(() => {
    selectedSurahRef.current = selectedSurah;
  }, [selectedSurah]);
  useEffect(() => {
    currentAyahRef.current = currentAyah;
  }, [currentAyah]);
  useEffect(() => {
    totalAyahsRef.current = totalAyahs;
  }, [totalAyahs]);
  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);
  useEffect(() => {
    continuousPlayRef.current = continuousPlay;
  }, [continuousPlay]);
  useEffect(() => {
    selectedReciterRef.current = settings.selectedReciter;
    effectiveReciterRef.current = settings.selectedReciter;
  }, [settings.selectedReciter]);

  const loadAudio = useCallback((surahNum: number, ayahNum: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = getAyahAudioUrl(surahNum, ayahNum, effectiveReciterRef.current);

    // If we're already on this URL, don't reload (prevents a tiny gap).
    if (audio.src === url) {
      if (wasPlayingRef.current && audio.paused) {
        setIsLoading(true);
        audio
          .play()
          .then(() => setIsLoading(false))
          .catch(() => setIsLoading(false));
      }
      return;
    }

    setIsLoading(true);
    audio.src = url;
    audio.load();
  }, []);

  const preloadAyah = useCallback((surahNum: number, ayahNum: number) => {
    const preload = preloadRef.current;
    if (!preload) return;

    const url = getAyahAudioUrl(surahNum, ayahNum, effectiveReciterRef.current);
    if (preload.src === url) return;

    preload.src = url;
    preload.load();
  }, []);

  // Initialize audio element and preloader (ONCE)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const preload = new Audio();
    preload.preload = 'auto';
    preload.volume = 0; // Silent preload
    preloadRef.current = preload;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setAudioError(null);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setAudioError(null);
      if (wasPlayingRef.current) {
        audio.play().catch(() => {
          // Ignore: user-gesture restrictions should not apply once playback started.
        });
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);

      const surahNum = selectedSurahRef.current;
      const ayahNum = currentAyahRef.current;

      // One-time fallback to a highly available reciter so continuous playback keeps working.
      if (effectiveReciterRef.current !== 'ar.alafasy') {
        effectiveReciterRef.current = 'ar.alafasy';
        const fallbackUrl = getAyahAudioUrl(surahNum, ayahNum, 'ar.alafasy');
        setAudioError('Selected Qari audio unavailable — switched to Alafasy for playback.');

        audio.src = fallbackUrl;
        audio.load();

        if (wasPlayingRef.current) {
          audio.play().catch(() => {
            setAudioError('Audio failed to load. Please try again.');
          });
        }
        return;
      }

      setAudioError('Audio failed to load. Please try again.');
    };

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

  // Load surah info when selected surah changes
  useEffect(() => {
    async function loadSurahInfo() {
      try {
        const data = await fetchSurah(selectedSurah);
        setSurahInfo(data.surah);
        setTotalAyahs(data.surah.numberOfAyahs);
        setCurrentAyah(1);
      } catch (error) {
        console.error('Failed to load surah info:', error);
      }
    }
    loadSurahInfo();
  }, [selectedSurah]);

  // Load audio when ayah/surah/reciter changes
  useEffect(() => {
    if (!audioRef.current) return;

    // If we were already playing (or auto-advancing), keep playing after the source swap.
    wasPlayingRef.current = wasPlayingRef.current || isPlaying;
    setAudioError(null);

    loadAudio(selectedSurah, currentAyah);
  }, [selectedSurah, currentAyah, settings.selectedReciter, isPlaying, loadAudio]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  // Preload next ayah when current one is playing
  useEffect(() => {
    if (!isPlaying) return;

    if (currentAyah < totalAyahs) {
      preloadAyah(selectedSurah, currentAyah + 1);
    } else if (currentAyah === totalAyahs && continuousPlay && selectedSurah < 114) {
      preloadAyah(selectedSurah + 1, 1);
    }
  }, [isPlaying, currentAyah, totalAyahs, selectedSurah, continuousPlay, preloadAyah]);

  const handleAudioEnded = useCallback(() => {
    const audio = audioRef.current;
    const preload = preloadRef.current;
    if (!audio) return;

    if (isRepeatRef.current) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
      return;
    }

    const surahNum = selectedSurahRef.current;
    const ayahNum = currentAyahRef.current;
    const total = totalAyahsRef.current;
    const continuous = continuousPlayRef.current;

    let nextSurah = surahNum;
    let nextAyah = ayahNum + 1;

    if (ayahNum >= total) {
      if (continuous && surahNum < 114) {
        nextSurah = surahNum + 1;
        nextAyah = 1;
      } else {
        wasPlayingRef.current = false;
        setIsPlaying(false);
        return;
      }
    }

    wasPlayingRef.current = true;
    setAudioError(null);

    const nextUrl = getAyahAudioUrl(nextSurah, nextAyah, effectiveReciterRef.current);
    const canUsePreload = !!preload && preload.src === nextUrl && preload.readyState >= 3;

    if (canUsePreload) {
      audio.src = preload.src;
      audio.currentTime = 0;
      setIsLoading(false);
      audio.play().catch(() => {
        // If play fails, user can tap play again.
      });
    } else {
      audio.src = nextUrl;
      audio.load();
      setIsLoading(true);
      audio.play().catch(() => {
        // If play fails, user can tap play again.
      });
    }

    if (nextSurah !== surahNum) {
      setSelectedSurah(nextSurah);
    }
    setCurrentAyah(nextAyah);
  }, []);

  // Attach ended handler
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = handleAudioEnded;
    }
  }, [handleAudioEnded]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (isPlaying) {
      wasPlayingRef.current = false;
      audio.pause();
      return;
    }

    // Ensure we have a source before attempting playback
    if (!audio.src) {
      loadAudio(selectedSurah, currentAyah);
    }

    wasPlayingRef.current = true;
    setIsLoading(true);
    audio
      .play()
      .then(() => setIsLoading(false))
      .catch((err) => {
        console.error('Playback error:', err);
        setAudioError('Playback failed. Click play to try again.');
        setIsLoading(false);
        wasPlayingRef.current = false;
      });
  };

  const playPrevious = () => {
    if (currentAyah > 1) {
      wasPlayingRef.current = true;
      setCurrentAyah(currentAyah - 1);
    }
  };

  const playNext = () => {
    if (currentAyah < totalAyahs) {
      wasPlayingRef.current = true;
      setCurrentAyah(currentAyah + 1);
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

  const currentReciter = RECITERS.find(r => r.identifier === settings.selectedReciter);

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Headphones className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Listen to the Quran</h3>
          <p className="text-sm text-muted-foreground">World-famous reciters</p>
        </div>
      </div>

      {/* Surah & Reciter Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Select
          value={selectedSurah.toString()}
          onValueChange={(v) => setSelectedSurah(parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Surah" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}. {getSurahName(num)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={settings.selectedReciter}
          onValueChange={(v) => updateSettings({ selectedReciter: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Reciter" />
          </SelectTrigger>
          <SelectContent>
            {RECITERS.map((reciter) => (
              <SelectItem key={reciter.identifier} value={reciter.identifier}>
                {reciter.englishName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Now Playing Info */}
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-foreground">
          {surahInfo?.englishName || 'Al-Fatiha'} 
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-primary">Ayah {currentAyah}</span>
        </p>
        <p className="text-sm text-muted-foreground">{currentReciter?.englishName}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
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

      {/* Error Message */}
      {audioError && (
        <p className="text-center text-sm text-destructive mb-3">{audioError}</p>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsRepeat(!isRepeat)}
          className={isRepeat ? 'text-primary' : 'text-muted-foreground'}
        >
          <Repeat className="h-5 w-5" />
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
          className="h-14 w-14 rounded-full"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
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
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={([v]) => {
            setVolume(v);
            setIsMuted(false);
          }}
          className="w-32"
        />
      </div>

      {/* Ayah Progress */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Ayah {currentAyah} of {totalAyahs}
        </p>
      </div>
    </div>
  );
}

// Helper function for surah names
function getSurahName(num: number): string {
  const names = [
    'Al-Fatiha', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Ma\'idah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal',
    'At-Tawbah', 'Yunus', 'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf',
    'Maryam', 'Ta-Ha', 'Al-Anbya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara', 'An-Naml',
    'Al-Qasas', 'Al-\'Ankabut', 'Ar-Rum', 'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin',
    'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir', 'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
    'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf', 'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar',
    'Ar-Rahman', 'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah', 'As-Saff', 'Al-Jumu\'ah',
    'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
    'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba',
    'An-Nazi\'at', 'Abasa', 'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq',
    'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad', 'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh',
    'At-Tin', 'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-\'Adiyat', 'Al-Qari\'ah', 'At-Takathur',
    'Al-\'Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
    'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
  ];
  return names[num - 1] || `Surah ${num}`;
}