import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Layers } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/Header';
import SurahCard from '@/components/quran/SurahCard';
import { fetchAllSurahs } from '@/lib/quran-api';
import { Surah } from '@/types/quran';

export default function SurahListPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <Book className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All 114 Surahs
          </h1>
          <p className="text-muted-foreground">
            Browse and read all chapters of the Holy Quran
          </p>
        </div>

        {/* Surah Grid */}
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
      </main>
    </div>
  );
}
