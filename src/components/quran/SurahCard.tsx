import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Surah } from '@/types/quran';

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export default function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <Link to={`/surah/${surah.number}`}>
      <Card className="group h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
        <CardContent className="p-4 flex items-center gap-4">
          {/* Surah Number */}
          <div className="ayah-number shrink-0">
            {surah.number}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {surah.englishName}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {surah.englishNameTranslation}
            </p>
          </div>

          {/* Right Side */}
          <div className="text-right shrink-0">
            <p className="font-arabic text-xl text-primary group-hover:text-accent transition-colors">
              {surah.name}
            </p>
            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{surah.revelationType}</span>
              <span className="mx-1">•</span>
              <span>{surah.numberOfAyahs} Ayahs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
