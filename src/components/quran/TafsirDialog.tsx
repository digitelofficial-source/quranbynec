import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface TafsirDialogProps {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

// Available Tafsir editions from AlQuran.cloud API
const TAFSIR_EDITIONS = [
  { identifier: 'en.maududi', name: 'Maududi', language: 'English', type: 'tafsir' },
  { identifier: 'en.sahih', name: 'Saheeh International', language: 'English', type: 'translation' },
  { identifier: 'en.pickthall', name: 'Pickthall', language: 'English', type: 'translation' },
  { identifier: 'en.yusufali', name: 'Yusuf Ali', language: 'English', type: 'translation' },
  { identifier: 'en.asad', name: 'Muhammad Asad', language: 'English', type: 'translation' },
  { identifier: 'en.daryabadi', name: 'Daryabadi', language: 'English', type: 'translation' },
  { identifier: 'en.hilali', name: 'Hilali & Khan', language: 'English', type: 'translation' },
  { identifier: 'en.itani', name: 'Talal Itani', language: 'English', type: 'translation' },
  { identifier: 'en.sarwar', name: 'Muhammad Sarwar', language: 'English', type: 'translation' },
  { identifier: 'en.wahiduddin', name: 'Wahiduddin Khan', language: 'English', type: 'translation' },
  { identifier: 'ur.jalandhry', name: 'Jalandhry', language: 'Urdu', type: 'translation' },
  { identifier: 'ur.ahmedali', name: 'Ahmed Ali', language: 'Urdu', type: 'translation' },
  { identifier: 'ur.maududi', name: 'Abul Ala Maududi', language: 'Urdu', type: 'tafsir' },
  { identifier: 'ur.junagarhi', name: 'Junagarhi', language: 'Urdu', type: 'translation' },
  { identifier: 'bn.bengali', name: 'Muhiuddin Khan', language: 'Bengali', type: 'translation' },
  { identifier: 'tr.diyanet', name: 'Diyanet İşleri', language: 'Turkish', type: 'translation' },
  { identifier: 'id.indonesian', name: 'Indonesian Ministry', language: 'Indonesian', type: 'translation' },
  { identifier: 'fr.hamidullah', name: 'Hamidullah', language: 'French', type: 'translation' },
  { identifier: 'de.aburida', name: 'Abu Rida', language: 'German', type: 'translation' },
  { identifier: 'ru.kuliev', name: 'Kuliev', language: 'Russian', type: 'translation' },
  { identifier: 'ml.abdulhameed', name: 'Abdul Hameed', language: 'Malayalam', type: 'translation' },
  { identifier: 'hi.hindi', name: 'Hindi', language: 'Hindi', type: 'translation' },
  { identifier: 'ta.tamil', name: 'Tamil', language: 'Tamil', type: 'translation' },
];

const LANGUAGES = [...new Set(TAFSIR_EDITIONS.map(e => e.language))];

export default function TafsirDialog({ surahNumber, ayahNumber, surahName }: TafsirDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState('en.maududi');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [arabicText, setArabicText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredEditions = TAFSIR_EDITIONS.filter(e => e.language === selectedLanguage);

  // Fetch tafsir when dialog opens or edition changes
  useEffect(() => {
    if (!isOpen) return;

    async function fetchTafsir() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate global ayah number
        const globalAyahNum = getGlobalAyahNumber(surahNumber, ayahNumber);
        
        // Fetch both Arabic and selected translation/tafsir
        const [arabicRes, tafsirRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/ayah/${globalAyahNum}`),
          fetch(`https://api.alquran.cloud/v1/ayah/${globalAyahNum}/${selectedEdition}`)
        ]);

        const arabicData = await arabicRes.json();
        const tafsirData = await tafsirRes.json();

        if (arabicData.code === 200) {
          setArabicText(arabicData.data.text);
        }

        if (tafsirData.code === 200) {
          setTafsirText(tafsirData.data.text);
        } else {
          setError('Failed to load tafsir for this ayah');
        }
      } catch (err) {
        console.error('Tafsir fetch error:', err);
        setError('Failed to load tafsir. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTafsir();
  }, [isOpen, selectedEdition, surahNumber, ayahNumber]);

  // Update selected edition when language changes
  useEffect(() => {
    const firstEditionInLanguage = TAFSIR_EDITIONS.find(e => e.language === selectedLanguage);
    if (firstEditionInLanguage) {
      setSelectedEdition(firstEditionInLanguage.identifier);
    }
  }, [selectedLanguage]);

  const currentEdition = TAFSIR_EDITIONS.find(e => e.identifier === selectedEdition);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <BookOpen className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Tafsir & Translations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reference */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {surahName} • Ayah {ayahNumber}
            </p>
          </div>

          {/* Language & Edition Selection */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full">
                  <Languages className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">Mufassir / Translator</label>
              <Select value={selectedEdition} onValueChange={setSelectedEdition}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredEditions.map(edition => (
                    <SelectItem key={edition.identifier} value={edition.identifier}>
                      {edition.name} {edition.type === 'tafsir' && '(Tafsir)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          <Tabs defaultValue="tafsir" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tafsir">
                {currentEdition?.type === 'tafsir' ? 'Tafsir' : 'Translation'}
              </TabsTrigger>
              <TabsTrigger value="arabic">Arabic Text</TabsTrigger>
            </TabsList>

            <TabsContent value="tafsir" className="mt-4">
              <ScrollArea className="h-[300px] rounded-lg border p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {currentEdition?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {currentEdition?.type === 'tafsir' ? 'Tafsir' : 'Translation'}
                      </span>
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {tafsirText}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="arabic" className="mt-4">
              <ScrollArea className="h-[300px] rounded-lg border p-4">
                {isLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : arabicText ? (
                  <div className="text-center">
                    <p 
                      className="font-quran text-2xl leading-loose text-foreground"
                      dir="rtl"
                    >
                      {arabicText}
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Failed to load Arabic text</p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Quick Info */}
          <div className="text-xs text-muted-foreground text-center">
            {filteredEditions.length} {currentEdition?.type === 'tafsir' ? 'tafsirs' : 'translations'} available in {selectedLanguage}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper to calculate global ayah number
const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
  30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

function getGlobalAyahNumber(surahNumber: number, ayahInSurah: number): number {
  let total = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    total += SURAH_AYAH_COUNTS[i];
  }
  return total + ayahInSurah;
}
