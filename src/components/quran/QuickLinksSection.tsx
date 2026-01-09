import { Link } from 'react-router-dom';
import { Book, Layers, Bookmark, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const popularSurahs = [
  { number: 1, name: 'Al-Fatiha', translation: 'The Opening' },
  { number: 2, name: 'Al-Baqarah', translation: 'The Cow' },
  { number: 18, name: 'Al-Kahf', translation: 'The Cave' },
  { number: 36, name: 'Ya-Sin', translation: 'Ya Sin' },
  { number: 55, name: 'Ar-Rahman', translation: 'The Beneficent' },
  { number: 56, name: 'Al-Waqi\'ah', translation: 'The Inevitable' },
  { number: 67, name: 'Al-Mulk', translation: 'The Sovereignty' },
  { number: 112, name: 'Al-Ikhlas', translation: 'The Sincerity' },
];

export default function QuickLinksSection() {
  return (
    <section className="py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Browse Options */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-foreground mb-6">Browse the Quran</h3>
          <div className="space-y-3">
            <Link to="/surah" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">All 114 Surahs</p>
                  <p className="text-sm text-muted-foreground">Browse complete Surah list</p>
                </div>
              </div>
            </Link>

            <Link to="/juz" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">30 Juz (Para)</p>
                  <p className="text-sm text-muted-foreground">Browse by Juz divisions</p>
                </div>
              </div>
            </Link>

            <Link to="/bookmarks" className="block">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bookmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Your Bookmarks</p>
                  <p className="text-sm text-muted-foreground">Saved ayahs & progress</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Popular Surahs */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Popular Surahs</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularSurahs.map((surah) => (
              <Link
                key={surah.number}
                to={`/surah/${surah.number}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold text-primary">
                  {surah.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {surah.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{surah.translation}</p>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/surah">
              <Button variant="outline" className="gap-2">
                <Book className="h-4 w-4" />
                View All Surahs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}