import { useState, useEffect } from 'react';
import { Book, Layers, ChevronRight, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import DailyAyah from '@/components/quran/DailyAyah';
import SurahCard from '@/components/quran/SurahCard';
import JuzCard from '@/components/quran/JuzCard';
import HomeAudioPlayer from '@/components/quran/HomeAudioPlayer';
import PhysicalQuranReader from '@/components/quran/PhysicalQuranReader';
import FeaturesSection from '@/components/quran/FeaturesSection';
import AboutSection from '@/components/quran/AboutSection';
import StatsSection from '@/components/quran/StatsSection';
import QuickLinksSection from '@/components/quran/QuickLinksSection';
import ReadingStreakCard from '@/components/quran/ReadingStreakCard';
import AchievementsCard from '@/components/quran/AchievementsCard';
import ReadingGoalsCard from '@/components/quran/ReadingGoalsCard';
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
        <section className="text-center mb-16 pt-8 animate-fade-in">
          <p className="bismillah text-2xl md:text-3xl mb-6">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Your Digital Quran Companion
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Read, Listen & Reflect<br />
            <span className="text-gradient-gold">The Holy Quran</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            A peaceful, distraction-free platform for reading, listening, and memorizing the Holy Quran.
            Featuring world-famous reciters, 14+ translations, and beautiful Arabic typography.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/surah/1">
              <Button size="lg" className="gap-2">
                <Book className="h-5 w-5" />
                Start Reading
              </Button>
            </Link>
            <Link to="/surah">
              <Button size="lg" variant="outline" className="gap-2">
                Browse Surahs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Continue Reading */}
        {readingProgress && (
          <section className="mb-12 animate-slide-up">
            <Link 
              to={`/surah/${readingProgress.surahNumber}?ayah=${readingProgress.ayahNumber}`}
              className="block"
            >
              <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 hover:from-primary/15 hover:to-accent/15 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Book className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Continue Reading</p>
                    <p className="text-lg font-semibold text-foreground">
                      {getSurahName(readingProgress.surahNumber)} - Ayah {readingProgress.ayahNumber}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Stats Section */}
        <StatsSection />

        {/* Quran Audio & Reading Section */}
        <section className="mb-16 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Listen & Read from Home
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Experience the Quran directly from this page. Listen to beautiful recitations or read ayahs with translations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audio Player */}
            <HomeAudioPlayer />
            
            {/* Physical Quran Reader - 16 Ayahs per page with independent scroll */}
            <PhysicalQuranReader />
          </div>
        </section>

        {/* Reading Progress Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Your Reading Journey
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Track your progress, maintain streaks, and unlock achievements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReadingStreakCard />
            <ReadingGoalsCard />
            <AchievementsCard />
          </div>
        </section>

        {/* Daily Ayah */}
        <section className="mb-16">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Ayah of the Day
            </h2>
            <p className="text-muted-foreground">Daily inspiration from the Holy Quran</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <DailyAyah />
          </div>
        </section>

        {/* Quick Links Section */}
        <QuickLinksSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* About Section */}
        <AboutSection />

        {/* Browse Section */}
        <section className="mb-16 mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Browse the Quran
              </h2>
              <p className="text-muted-foreground">Navigate by Surah or Juz</p>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'surah' | 'juz')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="surah" className="gap-2">
                  <Book className="h-4 w-4" />
                  Surah
                </TabsTrigger>
                <TabsTrigger value="juz" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Juz
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Grid */}
          {viewMode === 'surah' ? (
            <>
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {surahs.slice(0, 12).map((surah, index) => (
                      <SurahCard key={surah.number} surah={surah} index={index} />
                    ))}
                  </div>
                  <div className="text-center mt-8">
                    <Link to="/surah">
                      <Button variant="outline" size="lg" className="gap-2">
                        View All 114 Surahs
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {JUZ_INFO.slice(0, 12).map((juz, index) => (
                  <JuzCard 
                    key={juz.number} 
                    juz={juz} 
                    surahName={getSurahName(juz.startSurah)}
                    index={index}
                  />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/juz">
                  <Button variant="outline" size="lg" className="gap-2">
                    View All 30 Juz
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-12 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="bismillah text-2xl md:text-3xl mb-4">
              الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
            </p>
            <p className="text-muted-foreground mb-6">
              All praise is due to Allah, Lord of all the worlds
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
              <Link to="/surah" className="hover:text-primary transition-colors">All Surahs</Link>
              <Link to="/juz" className="hover:text-primary transition-colors">All Juz</Link>
              <Link to="/bookmarks" className="hover:text-primary transition-colors">Bookmarks</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Quran data provided by AlQuran.cloud API • Developed by{' '}
              <a
                href="https://www.thenanosoft.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                NAUMAN ELLAHI
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
