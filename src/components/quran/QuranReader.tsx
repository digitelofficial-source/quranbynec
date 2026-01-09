import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Book, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuran } from '@/context/QuranContext';
import { fetchSurahWithTranslation, getAyahAudioUrl } from '@/lib/quran-api';
import { AyahWithTranslation, Surah } from '@/types/quran';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

export default function QuranReader() {
  const { settings } = useQuran();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);

  const wasPlayingRef = useRef(false);
  const effectiveReciterRef = useRef(settings.selectedReciter);

  const selectedSurahRef = useRef(selectedSurah);
  const currentAyahIndexRef = useRef(currentAyahIndex);
  const ayahsRef = useRef<AyahWithTranslation[]>(ayahs);

  useEffect(() => {
    selectedSurahRef.current = selectedSurah;
  }, [selectedSurah]);
  useEffect(() => {
    currentAyahIndexRef.current = currentAyahIndex;
  }, [currentAyahIndex]);
  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  useEffect(() => {
    effectiveReciterRef.current = settings.selectedReciter;
    setAudioError(null);
  }, [settings.selectedReciter]);

  useEffect(() => {
    async function loadSurah() {
      setIsLoading(true);
      try {
        const data = await fetchSurahWithTranslation(selectedSurah, settings.selectedTranslation);
        setSurah(data.surah);
        setAyahs(data.ayahs);
        setCurrentAyahIndex(0);
      } catch (error) {
        console.error('Failed to load surah:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurah();
  }, [selectedSurah, settings.selectedTranslation]);

  const getUrl = useCallback((surahNumber: number, ayahInSurah: number) => {
    return getAyahAudioUrl(surahNumber, ayahInSurah, effectiveReciterRef.current);
  }, []);

  const loadAndMaybePlay = useCallback((surahNumber: number, ayahInSurah: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = getUrl(surahNumber, ayahInSurah);

    // Avoid reloading the exact same audio (important when we start from preloaded src).
    if (audio.src !== url) {
      audio.src = url;
      audio.load();
    }

    if (wasPlayingRef.current) {
      audio.play().catch(() => {
        // User can press play again if needed.
      });
    }
  }, [getUrl]);

  // Audio setup
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const preload = new Audio();
    preload.preload = 'auto';
    preload.volume = 0;
    preloadRef.current = preload;

    const handleEnded = () => {
      if (!wasPlayingRef.current) {
        setIsPlaying(false);
        return;
      }

      const list = ayahsRef.current;
      const idx = currentAyahIndexRef.current;
      const surahNum = selectedSurahRef.current;

      // Determine next target (next ayah, or next surah)
      let nextSurah = surahNum;
      let nextIndex = idx + 1;

      if (nextIndex >= list.length) {
        if (surahNum < 114) {
          nextSurah = surahNum + 1;
          nextIndex = 0;
        } else {
          wasPlayingRef.current = false;
          setIsPlaying(false);
          return;
        }
      }

      const nextAyahInSurah = nextIndex === 0 && nextSurah !== surahNum ? 1 : list[nextIndex]?.numberInSurah;
      const nextUrl = getUrl(nextSurah, nextAyahInSurah || 1);

      const canUsePreload =
        !!preloadRef.current &&
        preloadRef.current.src === nextUrl &&
        preloadRef.current.readyState >= 3;

      if (canUsePreload) {
        audio.src = preloadRef.current!.src;
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignore.
        });
      }

      if (nextSurah !== surahNum) {
        setSelectedSurah(nextSurah);
      }
      setCurrentAyahIndex(nextIndex);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleError = () => {
      if (effectiveReciterRef.current !== 'ar.alafasy') {
        effectiveReciterRef.current = 'ar.alafasy';
        setAudioError('Selected Qari audio unavailable — switched to Alafasy for playback.');
        const list = ayahsRef.current;
        const idx = currentAyahIndexRef.current;
        const ayahInSurah = list[idx]?.numberInSurah || 1;
        loadAndMaybePlay(selectedSurahRef.current, ayahInSurah);
        return;
      }

      setAudioError('Audio failed to load. Please try again.');
      wasPlayingRef.current = false;
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      preload.src = '';
    };
  }, [getUrl, loadAndMaybePlay]);

  // Keep playback rate in sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  const currentAyah = ayahs[currentAyahIndex];

  // Preload next ayah while playing
  useEffect(() => {
    if (!isPlaying || !currentAyah) return;

    const preload = preloadRef.current;
    if (!preload) return;

    const list = ayahs;
    const idx = currentAyahIndex;

    let nextSurah = selectedSurah;
    let nextIndex = idx + 1;

    if (nextIndex >= list.length) {
      if (selectedSurah < 114) {
        nextSurah = selectedSurah + 1;
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextAyahInSurah = nextIndex === 0 && nextSurah !== selectedSurah ? 1 : list[nextIndex]?.numberInSurah;
    const nextUrl = getUrl(nextSurah, nextAyahInSurah || 1);

    if (preload.src !== nextUrl) {
      preload.src = nextUrl;
      preload.load();
    }
  }, [isPlaying, currentAyahIndex, currentAyah, ayahs, selectedSurah, getUrl]);

  const goToPrevious = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(currentAyahIndex - 1);
    } else if (selectedSurah > 1) {
      setSelectedSurah(selectedSurah - 1);
    }
  };

  const goToNext = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(currentAyahIndex + 1);
    } else if (selectedSurah < 114) {
      setSelectedSurah(selectedSurah + 1);
    }
  };

  useEffect(() => {
    if (!currentAyah) return;

    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }

    // When auto-advancing (or user navigates) while playing, keep playback continuous.
    if (wasPlayingRef.current) {
      loadAndMaybePlay(selectedSurah, currentAyah.numberInSurah);
    }
  }, [currentAyah, selectedSurah, settings.playbackSpeed, loadAndMaybePlay]);

  const togglePlay = () => {
    if (!audioRef.current || !currentAyah) return;

    setAudioError(null);

    if (isPlaying) {
      wasPlayingRef.current = false;
      audioRef.current.pause();
      return;
    }

    // Reset effective reciter to user-selected when starting playback
    effectiveReciterRef.current = settings.selectedReciter;

    wasPlayingRef.current = true;
    loadAndMaybePlay(selectedSurah, currentAyah.numberInSurah);
  };

  const arabicNumber = currentAyah?.numberInSurah?.toLocaleString('ar-EG') || '١';

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {isLoading ? 'Loading...' : surah?.englishName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {surah?.englishNameTranslation}
            </p>
          </div>
        </div>
        <Link to={`/surah/${selectedSurah}`}>
          <Button variant="outline" size="sm">
            Read Full Surah
          </Button>
        </Link>
      </div>

      {/* Ayah Display */}
      <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
          </div>
        ) : currentAyah ? (
          <>
            {/* Arabic Text */}
            <p
              className="font-quran text-foreground leading-[2.2] text-center mb-6"
              style={{ fontSize: `${settings.arabicFontSize + 2}px` }}
              dir="rtl"
            >
              {currentAyah.text}
              <span className="inline-flex items-center justify-center mx-2 text-base font-medium text-accent">
                ﴿{arabicNumber}﴾
              </span>
            </p>

            {/* Translation */}
            {settings.showTranslation && currentAyah.translation && (
              <p
                className="text-muted-foreground text-center leading-relaxed max-w-2xl mx-auto"
                style={{ fontSize: `${settings.translationFontSize}px` }}
              >
                "{currentAyah.translation}"
              </p>
            )}

            {/* Ayah Info */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <span>Surah {surah?.englishName} • Ayah {currentAyah.numberInSurah} of {surah?.numberOfAyahs}</span>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">No ayah to display</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={currentAyahIndex === 0 && selectedSurah === 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4">
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
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={currentAyahIndex === ayahs.length - 1 && selectedSurah === 114}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Surah Navigation */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 36, 55, 56, 67, 78, 112, 113, 114].map((num) => (
            <Button
              key={num}
              variant={selectedSurah === num ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap flex-shrink-0"
              onClick={() => setSelectedSurah(num)}
            >
              {getSurahName(num)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSurahName(num: number): string {
  const names: Record<number, string> = {
    1: 'Al-Fatiha',
    36: 'Ya-Sin',
    55: 'Ar-Rahman',
    56: 'Al-Waqi\'ah',
    67: 'Al-Mulk',
    78: 'An-Naba',
    112: 'Al-Ikhlas',
    113: 'Al-Falaq',
    114: 'An-Nas'
  };
  return names[num] || `Surah ${num}`;
}