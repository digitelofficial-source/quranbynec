import { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchRandomAyah } from '@/lib/quran-api';
import { useQuran } from '@/context/QuranContext';
import { AyahWithTranslation } from '@/types/quran';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface VerseOfDayWidgetProps {
  variant?: 'compact' | 'full';
}

export default function VerseOfDayWidget({ variant = 'compact' }: VerseOfDayWidgetProps) {
  const { settings } = useQuran();
  const [ayahData, setAyahData] = useState<{
    ayah: AyahWithTranslation;
    surah: { number: number; name: string; englishName: string };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchRandomAyah(settings.selectedTranslation);
        setAyahData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [settings.selectedTranslation]);

  const handleCopy = async () => {
    if (!ayahData) return;
    const text = `${ayahData.ayah.text}\n\n"${ayahData.ayah.translation}"\n\n— ${ayahData.surah.englishName} ${ayahData.ayah.numberInSurah}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Verse copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="h-8 w-full bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    );
  }

  if (!ayahData) return null;

  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-xs font-medium text-accent uppercase tracking-wider">Verse of the Day</span>
        </div>
        
        <p className="font-quran text-lg leading-loose text-foreground mb-2" dir="rtl">
          {ayahData.ayah.text.slice(0, 100)}...
        </p>
        
        <div className="flex items-center justify-between">
          <Link 
            to={`/surah/${ayahData.surah.number}?ayah=${ayahData.ayah.numberInSurah}`}
            className="text-xs text-primary hover:underline"
          >
            {ayahData.surah.englishName} {ayahData.ayah.numberInSurah} →
          </Link>
          
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-primary/20 islamic-pattern">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <span className="text-sm font-semibold text-accent uppercase tracking-wider">Verse of the Day</span>
      </div>
      
      <p 
        className="font-quran leading-loose text-foreground mb-4"
        style={{ fontSize: `${settings.arabicFontSize}px` }}
        dir="rtl"
      >
        {ayahData.ayah.text}
      </p>
      
      {ayahData.ayah.translation && (
        <p className="text-muted-foreground leading-relaxed mb-4 italic">
          "{ayahData.ayah.translation}"
        </p>
      )}
      
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <Link 
          to={`/surah/${ayahData.surah.number}?ayah=${ayahData.ayah.numberInSurah}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {ayahData.surah.englishName} - Ayah {ayahData.ayah.numberInSurah}
          <ExternalLink className="h-3 w-3" />
        </Link>
        
        <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}