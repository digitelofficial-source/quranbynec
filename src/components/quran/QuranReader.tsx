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
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Audio setup
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onplay = () => setIsPlaying(true);
    audioRef.current.onpause = () => setIsPlaying(false);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const currentAyah = ayahs[currentAyahIndex];

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

  const togglePlay = () => {
    if (!audioRef.current || !currentAyah) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const url = getAyahAudioUrl(selectedSurah, currentAyah.numberInSurah, settings.selectedReciter);
      audioRef.current.src = url;
      audioRef.current.play().catch(console.error);
    }
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