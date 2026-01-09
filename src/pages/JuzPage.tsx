import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/Header';
import AyahDisplay from '@/components/quran/AyahDisplay';
import { fetchJuzWithTranslation, JUZ_INFO } from '@/lib/quran-api';
import { useQuran } from '@/context/QuranContext';
import { Juz, AyahWithTranslation } from '@/types/quran';

export default function JuzPage() {
  const { number } = useParams<{ number: string }>();
  const juzNumber = parseInt(number || '1', 10);
  const { settings } = useQuran();
  
  const [juz, setJuz] = useState<Juz | null>(null);
  const [translations, setTranslations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const juzInfo = JUZ_INFO.find(j => j.number === juzNumber);

  useEffect(() => {
    async function loadJuz() {
      setIsLoading(true);
      try {
        const data = await fetchJuzWithTranslation(juzNumber, settings.selectedTranslation);
        setJuz(data.juz);
        setTranslations(data.translations);
      } catch (error) {
        console.error('Failed to load juz:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadJuz();
  }, [juzNumber, settings.selectedTranslation]);

  // Group ayahs by surah
  const groupedAyahs = juz?.ayahs.reduce((acc, ayah, index) => {
    const surahNum = Object.keys(juz.surahs).find(key => 
      juz.surahs[key].number === (ayah as any).surah?.number
    ) || '';
    const surahInfo = juz.surahs[surahNum];
    
    if (surahInfo) {
      if (!acc[surahInfo.number]) {
        acc[surahInfo.number] = {
          surah: surahInfo,
          ayahs: [],
        };
      }
      acc[surahInfo.number].ayahs.push({
        ...ayah,
        translation: translations[index] || '',
      } as AyahWithTranslation);
    }
    return acc;
  }, {} as Record<number, { surah: { number: number; name: string; englishName: string }; ayahs: AyahWithTranslation[] }>) || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-4xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/juz" className="hover:text-foreground transition-colors">Juz</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Juz {juzNumber}</span>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Skeleton className="h-12 w-24 mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-6 px-4 rounded-xl border border-border">
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : juz ? (
          <>
            {/* Juz Header */}
            <div className="text-center py-8 mb-8 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/5 border border-border animate-fade-in">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-accent/20 text-accent text-2xl font-bold mb-4">
                {juzNumber}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Juz {juzNumber}
              </h1>
              <p className="text-lg font-arabic text-muted-foreground" dir="rtl">
                {juzInfo?.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Layers className="h-4 w-4" />
                <span>{juz.ayahs.length} Ayahs</span>
              </div>
            </div>

            {/* Grouped Ayahs by Surah */}
            <div className="space-y-8">
              {Object.values(groupedAyahs).map(({ surah, ayahs }) => (
                <div key={surah.number}>
                  {/* Surah Divider */}
                  <div className="flex items-center gap-4 py-4 mb-4 border-b border-border">
                    <Link 
                      to={`/surah/${surah.number}`}
                      className="flex items-center gap-3 hover:text-primary transition-colors"
                    >
                      <div className="ayah-number">
                        {surah.number}
                      </div>
                      <div>
                        <h3 className="font-semibold">{surah.englishName}</h3>
                        <p className="text-sm font-arabic text-muted-foreground">{surah.name}</p>
                      </div>
                    </Link>
                  </div>

                  {/* Ayahs */}
                  <div className="space-y-2">
                    {ayahs.map((ayah) => (
                      <AyahDisplay
                        key={`${surah.number}-${ayah.numberInSurah}`}
                        ayah={ayah}
                        surahNumber={surah.number}
                        surahName={surah.englishName}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Juz Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
              {juzNumber > 1 ? (
                <Link to={`/juz/${juzNumber - 1}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Previous Juz
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {juzNumber < 30 && (
                <Link to={`/juz/${juzNumber + 1}`}>
                  <Button variant="outline" className="gap-2">
                    Next Juz
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>Failed to load juz. Please try again.</p>
          </div>
        )}
      </main>
    </div>
  );
}
