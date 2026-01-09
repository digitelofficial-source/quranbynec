import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface JuzCardProps {
  juz: {
    number: number;
    startSurah: number;
    startAyah: number;
    name: string;
  };
  surahName?: string;
  index: number;
}

export default function JuzCard({ juz, surahName, index }: JuzCardProps) {
  return (
    <Link to={`/juz/${juz.number}`}>
      <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
        <CardContent className="p-4 flex items-center gap-4">
          {/* Juz Number */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent font-bold text-lg shrink-0 group-hover:from-accent/30 group-hover:to-accent/10 transition-colors">
            {juz.number}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
              Juz {juz.number}
            </h3>
            <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
              {juz.name}
            </p>
          </div>

          {/* Right Side */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Book className="h-4 w-4" />
              <span>Surah {juz.startSurah}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ayah {juz.startAyah}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
