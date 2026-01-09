import { useState, useEffect } from 'react';
import { Book, Layers } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/Header';
import DailyAyah from '@/components/quran/DailyAyah';
import SurahCard from '@/components/quran/SurahCard';
import JuzCard from '@/components/quran/JuzCard';
import { fetchAllSurahs, JUZ_INFO } from '@/lib/quran-api';
import { Surah } from '@/types/quran';
import { useQuran } from '@/context/QuranContext';
import { Link } from 'react-router-dom';

export default function Index() {
  const { readingProgress } = useQuran();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');

  useEffect(() => {
    async function loadSurahs() {
      try {
        const data = await fetchAllSurahs();
        setSurahs(data);
      } catch (error) {
        console.error('Failed to load surahs:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurahs();
  }, []);

  const getSurahName = (surahNumber: number) => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah?.englishName || `Surah ${surahNumber}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Book className="h-4 w-4" />
            The Holy Quran
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Read, Listen & Reflect
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your peaceful companion for reading, listening, and memorizing the Holy Quran
            with multiple translations and world-famous reciters.
          </p>
        </section>

        {/* Continue Reading */}
        {readingProgress && (
          <section className="mb-8 animate-slide-up">
            <Link 
              to={`/surah/${readingProgress.surahNumber}?ayah=${readingProgress.ayahNumber}`}
              className="block"
            >
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Book className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Continue Reading</p>
                    <p className="font-medium">
                      {getSurahName(readingProgress.surahNumber)} - Ayah {readingProgress.ayahNumber}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Daily Ayah */}
        <section className="mb-12">
          <DailyAyah />
        </section>

        {/* Navigation Toggle */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground">
              Browse the Quran
            </h2>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'surah' | 'juz')}>
              <TabsList>
                <TabsTrigger value="surah" className="gap-2">
                  <Book className="h-4 w-4" />
                  By Surah
                </TabsTrigger>
                <TabsTrigger value="juz" className="gap-2">
                  <Layers className="h-4 w-4" />
                  By Juz
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </section>

        {/* Content Grid */}
        {viewMode === 'surah' ? (
          <section>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surahs.map((surah, index) => (
                  <SurahCard key={surah.number} surah={surah} index={index} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {JUZ_INFO.map((juz, index) => (
                <JuzCard 
                  key={juz.number} 
                  juz={juz} 
                  surahName={getSurahName(juz.startSurah)}
                  index={index}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Data provided by AlQuran.cloud API
          </p>
        </div>
      </footer>
    </div>
  );
}
