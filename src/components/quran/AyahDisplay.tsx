import { memo } from 'react';
import { Bookmark, BookmarkCheck, Copy, Share2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuran } from '@/context/QuranContext';
import { AyahWithTranslation } from '@/types/quran';
import { toast } from 'sonner';
import NoteDialog from './NoteDialog';
import ShareAyahCard from './ShareAyahCard';
import TafsirDialog from './TafsirDialog';

interface AyahDisplayProps {
  ayah: AyahWithTranslation;
  surahNumber: number;
  surahName: string;
  isHighlighted?: boolean;
  onPlay?: () => void;
  showWordByWord?: boolean;
}

function AyahDisplay({
  ayah,
  surahNumber,
  surahName,
  isHighlighted,
  onPlay,
  showWordByWord,
}: AyahDisplayProps) {
  const { settings, addBookmark, removeBookmark, isBookmarked } = useQuran();
  const bookmarked = isBookmarked(surahNumber, ayah.numberInSurah);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(surahNumber, ayah.numberInSurah);
      toast.success('Bookmark removed');
    } else {
      addBookmark({
        surahNumber,
        ayahNumber: ayah.numberInSurah,
        surahName,
      });
      toast.success('Bookmark added');
    }
  };

  const handleCopy = async () => {
    const text = `${ayah.text}\n\n${ayah.translation ? `"${ayah.translation}"` : ''}\n\n— ${surahName} ${ayah.numberInSurah}`;
    await navigator.clipboard.writeText(text);
    toast.success('Ayah copied to clipboard');
  };

  const handleShare = async () => {
    const text = `${ayah.text}\n\n${ayah.translation ? `"${ayah.translation}"` : ''}\n\n— ${surahName} ${ayah.numberInSurah}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        // User cancelled
      }
    } else {
      await handleCopy();
    }
  };

  // Convert Arabic number
  const arabicNumber = ayah.numberInSurah.toLocaleString('ar-EG');

  return (
    <div
      id={`ayah-${ayah.numberInSurah}`}
      className={`group py-6 px-4 rounded-xl transition-all duration-300 ${
        isHighlighted ? 'ayah-highlight animate-gentle-pulse' : 'hover:bg-muted/50'
      }`}
    >
      {/* Arabic Text */}
      <div className="flex items-start gap-4" dir="rtl">
        <p
          className="font-quran leading-[2.2] flex-1 text-foreground"
          style={{ fontSize: `${settings.arabicFontSize}px` }}
        >
          {showWordByWord ? (
            ayah.text.split(' ').map((word, i) => (
              <span
                key={i}
                className="inline-block hover:text-primary transition-colors cursor-pointer mx-1"
              >
                {word}
              </span>
            ))
          ) : (
            ayah.text
          )}
          <span className="inline-flex items-center justify-center mx-2 text-base font-medium text-accent">
            ﴿{arabicNumber}﴾
          </span>
        </p>
      </div>

      {/* Translation */}
      {settings.showTranslation && ayah.translation && (
        <p
          className="mt-4 text-muted-foreground leading-relaxed"
          style={{ fontSize: `${settings.translationFontSize}px` }}
        >
          {ayah.translation}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlay}
          className="h-8 gap-1.5 text-muted-foreground hover:text-primary"
        >
          <Play className="h-3.5 w-3.5" />
          <span className="text-xs">Play</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmark}
          className={`h-8 w-8 ${bookmarked ? 'text-accent' : 'text-muted-foreground'}`}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8 text-muted-foreground"
        >
          <Copy className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-8 w-8 text-muted-foreground"
        >
          <Share2 className="h-4 w-4" />
        </Button>

        {/* Tafsir Dialog */}
        <TafsirDialog
          surahNumber={surahNumber}
          ayahNumber={ayah.numberInSurah}
          surahName={surahName}
        />

        {/* Note Dialog */}
        <NoteDialog
          surahNumber={surahNumber}
          ayahNumber={ayah.numberInSurah}
          surahName={surahName}
        />

        {/* Share Ayah Card */}
        <ShareAyahCard
          arabicText={ayah.text}
          translation={ayah.translation}
          surahName={surahName}
          ayahNumber={ayah.numberInSurah}
          surahNumber={surahNumber}
        />

        <span className="text-xs text-muted-foreground ml-auto">
          {surahNumber}:{ayah.numberInSurah}
        </span>
      </div>
    </div>
  );
}

export default memo(AyahDisplay);
