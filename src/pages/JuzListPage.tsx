import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import Header from '@/components/layout/Header';
import JuzCard from '@/components/quran/JuzCard';
import { JUZ_INFO } from '@/lib/quran-api';

export default function JuzListPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 text-accent mb-4">
            <Layers className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            All 30 Juz (Para)
          </h1>
          <p className="text-muted-foreground">
            Browse the Quran by its 30 parts for structured reading
          </p>
        </div>

        {/* Juz Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {JUZ_INFO.map((juz, index) => (
            <JuzCard key={juz.number} juz={juz} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
}
