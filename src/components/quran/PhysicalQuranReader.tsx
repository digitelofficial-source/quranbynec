import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Book, Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuran } from '@/context/QuranContext';
import { fetchSurahWithTranslation, getAyahAudioUrl } from '@/lib/quran-api';
import { AyahWithTranslation, Surah, RECITERS } from '@/types/quran';
import { Link } from 'react-router-dom';

const AYAHS_PER_PAGE = 16;

export default function PhysicalQuranReader() {
  const { settings, updateSettings, recordAyahRead } = useQuran();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(ayahs.length / AYAHS_PER_PAGE);
  const startIndex = (currentPage - 1) * AYAHS_PER_PAGE;
  const pageAyahs = ayahs.slice(startIndex, startIndex + AYAHS_PER_PAGE);

  // Refs for stable event handlers
  const pageAyahsRef = useRef<AyahWithTranslation[]>(pageAyahs);
  const currentPlayingAyahRef = useRef<number | null>(currentPlayingAyah);
  const selectedSurahRef = useRef(selectedSurah);
  const effectiveReciterRef = useRef(settings.selectedReciter);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    pageAyahsRef.current = pageAyahs;
  }, [pageAyahs]);

  useEffect(() => {
    currentPlayingAyahRef.current = currentPlayingAyah;
  }, [currentPlayingAyah]);

  useEffect(() => {
    selectedSurahRef.current = selectedSurah;

    // Stop any ongoing playback when switching surah to avoid mismatched audio.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    wasPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentPlayingAyah(null);
    setAudioError(null);
  }, [selectedSurah]);

  // When reciter changes globally, reset effective reciter and reload audio immediately
  useEffect(() => {
    const prevReciter = effectiveReciterRef.current;
    effectiveReciterRef.current = settings.selectedReciter;
    setAudioError(null);

    // If reciter actually changed and we have a playing ayah, reload the audio
    if (prevReciter !== settings.selectedReciter && audioRef.current && currentPlayingAyahRef.current != null) {
      const url = getAyahAudioUrl(selectedSurahRef.current, currentPlayingAyahRef.current, settings.selectedReciter);
      audioRef.current.src = url;
      audioRef.current.load();

      // If was playing, continue playing with new reciter
      if (wasPlayingRef.current || isPlaying) {
        wasPlayingRef.current = true;
        audioRef.current.play().catch((err) => {
          console.error('Playback error:', err);
          setAudioError('Playback failed. Click play to try again.');
          wasPlayingRef.current = false;
          setIsPlaying(false);
        });
      }
    }
  }, [settings.selectedReciter, isPlaying]);

  useEffect(() => {
    async function loadSurah() {
      setIsLoading(true);
      try {
        const data = await fetchSurahWithTranslation(selectedSurah, settings.selectedTranslation);
        setSurah(data.surah);
        setAyahs(data.ayahs);
        setCurrentPage(1);
      } catch (error) {
        console.error('Failed to load surah:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurah();
  }, [selectedSurah, settings.selectedTranslation]);

  // Audio setup - create audio element + preloader once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const preload = new Audio();
    preload.preload = 'auto';
    preload.volume = 0; // silent preload
    preloadRef.current = preload;

    return () => {
      audio.pause();
      audio.src = '';
      preload.src = '';
    };
  }, []);

  // Apply playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  const preloadAyah = useCallback((ayahNum: number) => {
    const preload = preloadRef.current;
    if (!preload) return;

    const url = getAyahAudioUrl(selectedSurahRef.current, ayahNum, effectiveReciterRef.current);
    if (preload.src === url) return;

    preload.src = url;
    preload.load();
  }, []);

  const playAyah = useCallback(
    (ayahNum: number, opts?: { usePreloaded?: boolean }) => {
      const audio = audioRef.current;
      if (!audio) return;

      const url = getAyahAudioUrl(selectedSurahRef.current, ayahNum, effectiveReciterRef.current);
      const preload = preloadRef.current;

      const canUsePreload =
        !!opts?.usePreloaded &&
        !!preload &&
        preload.src === url &&
        preload.readyState >= 3;

      setAudioError(null);
      wasPlayingRef.current = true;

      if (canUsePreload) {
        audio.src = preload.src;
        audio.currentTime = 0;
      } else if (audio.src !== url) {
        audio.src = url;
        audio.load();
        audio.currentTime = 0;
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setCurrentPlayingAyah(ayahNum);
            recordAyahRead();
          })
          .catch((error) => {
            console.error('Playback failed:', error);
            setAudioError('Playback failed. Click play to try again.');
            setIsPlaying(false);
            wasPlayingRef.current = false;
          });
      }
    },
    [recordAyahRead]
  );

  // Audio event handlers (stable)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const current = currentPlayingAyahRef.current;
      const list = pageAyahsRef.current;

      if (current == null || list.length === 0) {
        wasPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentPlayingAyah(null);
        return;
      }

      const idx = list.findIndex((a) => a.numberInSurah === current);
      if (idx >= 0 && idx < list.length - 1) {
        const nextAyah = list[idx + 1].numberInSurah;
        playAyah(nextAyah, { usePreloaded: true });
        return;
      }

      // End of page
      wasPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleError = (e: Event) => {
      console.error('Audio error:', e);

      // One-time fallback to Alafasy so playback doesn't keep breaking.
      if (effectiveReciterRef.current !== 'ar.alafasy') {
        effectiveReciterRef.current = 'ar.alafasy';
        setAudioError('Selected Qari audio unavailable — switched to Alafasy for playback.');

        const ayahToReplay =
          currentPlayingAyahRef.current ?? pageAyahsRef.current[0]?.numberInSurah;

        if (ayahToReplay != null) {
          playAyah(ayahToReplay);
        }
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
    };
  }, [playAyah]);

  // Preload the next ayah on the current page while playing
  useEffect(() => {
    if (!isPlaying || currentPlayingAyah == null) return;

    const idx = pageAyahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);
    if (idx >= 0 && idx < pageAyahs.length - 1) {
      preloadAyah(pageAyahs[idx + 1].numberInSurah);
    }
  }, [isPlaying, currentPlayingAyah, pageAyahs, preloadAyah]);

  const togglePlayPage = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(null);

    if (isPlaying) {
      wasPlayingRef.current = false;
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Resume if we have an existing source + position
    if (currentPlayingAyah != null && audio.src) {
      wasPlayingRef.current = true;
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
        setAudioError('Playback failed. Click play to try again.');
        wasPlayingRef.current = false;
        setIsPlaying(false);
      });
      return;
    }

    if (pageAyahs.length > 0) {
      playAyah(pageAyahs[0].numberInSurah);
    }
  };

  const playPreviousAyah = () => {
    if (!currentPlayingAyah || pageAyahs.length === 0) return;
    const currentIndex = pageAyahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);
    if (currentIndex > 0) {
      playAyah(pageAyahs[currentIndex - 1].numberInSurah);
    }
  };

  const playNextAyah = () => {
    if (!currentPlayingAyah || pageAyahs.length === 0) return;
    const currentIndex = pageAyahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);
    if (currentIndex >= 0 && currentIndex < pageAyahs.length - 1) {
      playAyah(pageAyahs[currentIndex + 1].numberInSurah, { usePreloaded: true });
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);

      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
      }

      wasPlayingRef.current = false;
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
      setAudioError(null);

      // Scroll to top of scroll area
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = 0;
      }
    }
  };

  // Bismillah for all surahs except At-Tawbah (9) and Al-Fatiha (1)
  const showBismillah = selectedSurah !== 9 && selectedSurah !== 1 && currentPage === 1;

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-card to-amber-100/50 dark:from-amber-900/20 dark:via-card dark:to-amber-800/20 border border-amber-200/50 dark:border-amber-800/30 flex flex-col h-[700px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-amber-200/50 dark:border-amber-800/30 bg-amber-100/30 dark:bg-amber-900/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Book className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Physical Quran View</h3>
            <p className="text-sm text-muted-foreground">16 Ayahs per page</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedSurah.toString()} onValueChange={(v) => setSelectedSurah(parseInt(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {Array.from({ length: 114 }, (_, i) => i + 1).map(num => (
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
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RECITERS.map(reciter => (
                <SelectItem key={reciter.identifier} value={reciter.identifier}>
                  {reciter.englishName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="p-4 sm:p-6">
          {/* Surah Title */}
          {surah && currentPage === 1 && (
            <div className="text-center py-4 border-b border-amber-200/30 dark:border-amber-800/20 mb-4">
              <h2 className="font-arabic text-3xl text-primary">{surah.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{surah.englishName} - {surah.englishNameTranslation}</p>
            </div>
          )}

          {/* Bismillah */}
          {showBismillah && (
            <div className="text-center py-4 mb-4">
              <p className="bismillah text-2xl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            </div>
          )}

          {/* Page Content */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {pageAyahs.map((ayah) => (
                <div
                  key={ayah.numberInSurah}
                  className={`group relative p-3 rounded-lg transition-all cursor-pointer
                    ${currentPlayingAyah === ayah.numberInSurah 
                      ? 'bg-amber-200/50 dark:bg-amber-800/30' 
                      : 'hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
                    }
                  `}
                  onClick={() => playAyah(ayah.numberInSurah)}
                >
                  <div className="flex items-start gap-3" dir="rtl">
                    <p 
                      className="font-quran leading-[2] flex-1 text-foreground"
                      style={{ fontSize: `${settings.arabicFontSize}px` }}
                    >
                      {ayah.text}
                      <span className="inline-flex items-center justify-center mx-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                        ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
                      </span>
                    </p>
                  </div>
                  
                  {settings.showTranslation && ayah.translation && (
                    <p 
                      className="mt-2 text-muted-foreground leading-relaxed"
                      style={{ fontSize: `${settings.translationFontSize - 2}px` }}
                    >
                      {ayah.translation}
                    </p>
                  )}

                  {/* Play indicator */}
                  {currentPlayingAyah === ayah.numberInSurah && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <Volume2 className="h-4 w-4 text-amber-600 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Fixed Audio Controls */}
      <div className="p-4 border-t border-amber-200/50 dark:border-amber-800/30 bg-amber-100/30 dark:bg-amber-900/20 shrink-0">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={playPreviousAyah}
            disabled={!currentPlayingAyah || pageAyahs.findIndex(a => a.numberInSurah === currentPlayingAyah) <= 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full bg-amber-600 hover:bg-amber-700"
            onClick={togglePlayPage}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={playNextAyah}
            disabled={!currentPlayingAyah || pageAyahs.findIndex(a => a.numberInSurah === currentPlayingAyah) >= pageAyahs.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {currentPlayingAyah && (
          <p className="text-xs text-center text-muted-foreground mb-2">
            Now Playing: Ayah {currentPlayingAyah}
          </p>
        )}
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-between p-3 border-t border-amber-200/30 dark:border-amber-800/20 bg-amber-50/50 dark:bg-amber-950/30 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => goToPage(page)}
            >
              {page}
            </Button>
          ))}
          {totalPages > 8 && (
            <Link to={`/surah/${selectedSurah}`}>
              <Button variant="outline" size="sm" className="h-8">
                View All
              </Button>
            </Link>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

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
