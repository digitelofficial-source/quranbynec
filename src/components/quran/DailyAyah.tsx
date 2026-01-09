import { useState, useEffect } from 'react';
import { Play, Pause, BookOpen, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchRandomAyah, getAyahAudioUrl } from '@/lib/quran-api';
import { useQuran } from '@/context/QuranContext';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AyahWithTranslation } from '@/types/quran';
import { Link } from 'react-router-dom';

export default function DailyAyah() {
  const { settings } = useQuran();
  const [ayahData, setAyahData] = useState<{
    ayah: AyahWithTranslation;
    surah: { number: number; name: string; englishName: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isPlaying, play, pause, setSource, setPlaybackRate } = useAudioPlayer();

  useEffect(() => {
    async function loadDailyAyah() {
      try {
        setIsLoading(true);
        const data = await fetchRandomAyah(settings.selectedTranslation);
        setAyahData(data);
      } catch (err) {
        setError('Failed to load daily ayah');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDailyAyah();
  }, [settings.selectedTranslation]);

  useEffect(() => {
    setPlaybackRate(settings.playbackSpeed);
  }, [settings.playbackSpeed, setPlaybackRate]);

  const handlePlayAudio = () => {
    if (!ayahData) return;
    
    if (isPlaying) {
      pause();
    } else {
      const audioUrl = getAyahAudioUrl(
        ayahData.surah.number,
        ayahData.ayah.numberInSurah,
        settings.selectedReciter
      );
      setSource(audioUrl);
      play();
    }
  };

  if (isLoading) {
    return (
      <Card className="card-glow overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-16 w-full mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !ayahData) {
    return (
      <Card className="card-glow">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>{error || 'Unable to load daily ayah'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow overflow-hidden islamic-pattern">
      <CardContent className="p-6 md:p-8 relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Ayah of the Day
          </h3>
        </div>

        {/* Arabic Text */}
        <p
          className="font-quran text-foreground leading-loose mb-6 animate-fade-in"
          style={{ fontSize: `${settings.arabicFontSize + 4}px` }}
          dir="rtl"
        >
          {ayahData.ayah.text}
        </p>

        {/* Translation */}
        {settings.showTranslation && ayahData.ayah.translation && (
          <p
            className="text-muted-foreground leading-relaxed mb-6 animate-fade-in"
            style={{ fontSize: `${settings.translationFontSize}px`, animationDelay: '0.1s' }}
          >
            "{ayahData.ayah.translation}"
          </p>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <Link 
              to={`/surah/${ayahData.surah.number}?ayah=${ayahData.ayah.numberInSurah}`}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {ayahData.surah.englishName} ({ayahData.surah.name}) - Ayah {ayahData.ayah.numberInSurah}
            </Link>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayAudio}
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Listen
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
