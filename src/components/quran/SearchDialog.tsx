import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Book, Hash, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchQuran, fetchAllSurahs } from '@/lib/quran-api';
import { Surah } from '@/types/quran';
import { JUZ_INFO } from '@/lib/quran-api';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllSurahs().then(setSurahs).catch(console.error);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchQuran(query, 'en');
        setResults(data.matches.slice(0, 20));
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const filteredSurahs = surahs.filter(
    s =>
      s.englishName.toLowerCase().includes(query.toLowerCase()) ||
      s.name.includes(query) ||
      s.number.toString() === query
  );

  const filteredJuz = JUZ_INFO.filter(
    j =>
      j.name.toLowerCase().includes(query.toLowerCase()) ||
      j.number.toString() === query
  );

  const handleSelect = (type: 'surah' | 'juz' | 'ayah', value: number | { surah: number; ayah: number }) => {
    onOpenChange(false);
    setQuery('');
    
    if (type === 'surah') {
      navigate(`/surah/${value}`);
    } else if (type === 'juz') {
      navigate(`/juz/${value}`);
    } else if (type === 'ayah' && typeof value === 'object') {
      navigate(`/surah/${value.surah}?ayah=${value.ayah}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search the Quran
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Surah, Juz, or Ayah..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && query && (
            <div className="space-y-4">
              {/* Surah Results */}
              {filteredSurahs.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 px-1">Surahs</h4>
                  <div className="space-y-1">
                    {filteredSurahs.slice(0, 5).map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => handleSelect('surah', surah.number)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                          {surah.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{surah.englishName}</p>
                          <p className="text-xs text-muted-foreground">{surah.englishNameTranslation}</p>
                        </div>
                        <span className="text-lg font-arabic text-muted-foreground">{surah.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Juz Results */}
              {filteredJuz.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 px-1">Juz (Para)</h4>
                  <div className="space-y-1">
                    {filteredJuz.slice(0, 5).map((juz) => (
                      <button
                        key={juz.number}
                        onClick={() => handleSelect('juz', juz.number)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent text-sm font-medium">
                          {juz.number}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Juz {juz.number}</p>
                          <p className="text-xs text-muted-foreground">{juz.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ayah Results */}
              {results.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 px-1">Ayahs</h4>
                  <div className="space-y-1">
                    {results.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect('ayah', { surah: result.surah.number, ayah: result.numberInSurah })}
                        className="w-full flex flex-col gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {result.surah.englishName} {result.numberInSurah}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{result.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!filteredSurahs.length && !filteredJuz.length && !results.length && !isLoading && (
                <p className="text-center py-8 text-muted-foreground">No results found</p>
              )}
            </div>
          )}

          {!query && (
            <div className="py-8 text-center text-muted-foreground">
              <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Start typing to search</p>
              <p className="text-sm mt-1">Search by Surah name, Juz number, or keywords</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
