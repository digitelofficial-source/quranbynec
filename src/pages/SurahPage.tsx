import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Book, Layers, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import AyahDisplay from '@/components/quran/AyahDisplay';
import AudioPlayer from '@/components/quran/AudioPlayer';
import HifzModePanel from '@/components/quran/HifzModePanel';
import { fetchSurahWithTranslation, getAyahAudioUrl } from '@/lib/quran-api';
import { useQuran } from '@/context/QuranContext';
import { Surah, AyahWithTranslation } from '@/types/quran';

export default function SurahPage() {
  const { number } = useParams<{ number: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surahNumber = parseInt(number || '1', 10);
  const highlightAyah = parseInt(searchParams.get('ayah') || '0', 10);

  const { settings, updateReadingProgress } = useQuran();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<AyahWithTranslation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [memorizationMode, setMemorizationMode] = useState(false);
  const [showHifzPanel, setShowHifzPanel] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSurah() {
      setIsLoading(true);
      try {
        const data = await fetchSurahWithTranslation(surahNumber, settings.selectedTranslation);
        setSurah(data.surah);
        setAyahs(data.ayahs);
        
        // Scroll to highlighted ayah if specified
        if (highlightAyah > 0) {
          setTimeout(() => {
            const element = document.getElementById(`ayah-${highlightAyah}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setCurrentAyah(highlightAyah);
          }, 500);
        }
      } catch (error) {
        console.error('Failed to load surah:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurah();
  }, [surahNumber, settings.selectedTranslation, highlightAyah]);

  // Update reading progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!surah) return;
      
      const ayahElements = document.querySelectorAll('[id^="ayah-"]');
      let visibleAyah = 1;
      
      ayahElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          const ayahNum = parseInt(el.id.replace('ayah-', ''), 10);
          visibleAyah = ayahNum;
        }
      });

      updateReadingProgress(surahNumber, visibleAyah);
    };

    const throttledScroll = throttle(handleScroll, 500);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [surah, surahNumber, updateReadingProgress]);

  const handlePlayAyah = (ayahNumber: number) => {
    setCurrentAyah(ayahNumber);
    setShowAudioPlayer(true);
  };

  const handleAyahChange = (ayahNumber: number) => {
    setCurrentAyah(ayahNumber);
    const element = document.getElementById(`ayah-${ayahNumber}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Navigate to next surah for continuous playback
  const handleNextSurah = () => {
    if (surahNumber < 114) {
      navigate(`/surah/${surahNumber + 1}`);
      setCurrentAyah(1);
      setShowAudioPlayer(true);
    }
  };

  // Toggle Hifz panel with memorization mode
  const handleMemorizationToggle = (checked: boolean) => {
    setMemorizationMode(checked);
    setShowHifzPanel(checked);
  };

  // Bismillah for all surahs except At-Tawbah (9)
  const showBismillah = surahNumber !== 9 && surahNumber !== 1;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl px-4 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/surah" className="hover:text-foreground transition-colors">Surah</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{surah?.englishName || `Surah ${surahNumber}`}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-12 w-32 mx-auto mb-4" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-6 px-4 rounded-xl border border-border">
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : surah ? (
          <>
            {/* Surah Header */}
            <div className="text-center py-8 mb-8 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-arabic text-primary mb-2">
                {surah.name}
              </h1>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {surah.englishName}
              </h2>
              <p className="text-muted-foreground mb-4">
                {surah.englishNameTranslation}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  {surah.revelationType}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  {surah.numberOfAyahs} Ayahs
                </span>
              </div>

              {/* Play Full Surah Button */}
              <Button
                className="mt-6 gap-2"
                onClick={() => {
                  setCurrentAyah(1);
                  setShowAudioPlayer(true);
                }}
              >
                <Play className="h-4 w-4" />
                Play Full Surah
              </Button>
            </div>

            {/* Memorization Mode Toggle */}
            <div className="flex items-center justify-end gap-3 mb-6 p-4 rounded-xl bg-muted/50">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="memorization" className="text-sm">Memorization Mode</Label>
              <Switch
                id="memorization"
                checked={memorizationMode}
                onCheckedChange={handleMemorizationToggle}
              />
            </div>

            {/* Hifz Mode Panel */}
            {showHifzPanel && (
              <div className="mb-6 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8"
                  onClick={() => {
                    setShowHifzPanel(false);
                    setMemorizationMode(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <HifzModePanel
                  ayahs={ayahs}
                  surahNumber={surahNumber}
                  currentAyah={currentAyah}
                  onAyahChange={handleAyahChange}
                />
              </div>
            )}

            {/* Bismillah */}
            {showBismillah && (
              <div className="text-center py-8 mb-4">
                <p className="bismillah text-2xl md:text-3xl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}

            {/* Ayahs */}
            <div ref={contentRef} className="space-y-2">
              {ayahs.map((ayah) => (
                <AyahDisplay
                  key={ayah.numberInSurah}
                  ayah={ayah}
                  surahNumber={surahNumber}
                  surahName={surah.englishName}
                  isHighlighted={currentAyah === ayah.numberInSurah && showAudioPlayer}
                  onPlay={() => handlePlayAyah(ayah.numberInSurah)}
                  showWordByWord={memorizationMode}
                />
              ))}
            </div>

            {/* Surah Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
              {surahNumber > 1 ? (
                <Link to={`/surah/${surahNumber - 1}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Previous Surah
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {surahNumber < 114 && (
                <Link to={`/surah/${surahNumber + 1}`}>
                  <Button variant="outline" className="gap-2">
                    Next Surah
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Failed to load surah. Please try again.</p>
          </div>
        )}
      </main>

      {/* Audio Player */}
      {showAudioPlayer && surah && (
        <AudioPlayer
          surahNumber={surahNumber}
          totalAyahs={surah.numberOfAyahs}
          currentAyah={currentAyah}
          onAyahChange={handleAyahChange}
          surahName={surah.englishName}
          onClose={() => setShowAudioPlayer(false)}
          onNextSurah={handleNextSurah}
        />
      )}

      {/* Spacer for audio player */}
      {showAudioPlayer && <div className="h-32" />}
    </div>
  );
}

// Throttle utility
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
