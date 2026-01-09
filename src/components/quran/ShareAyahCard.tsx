import { useState, useRef } from 'react';
import { Share2, Download, Copy, Check, Image, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQuran } from '@/context/QuranContext';

interface ShareAyahCardProps {
  arabicText: string;
  translation?: string;
  surahName: string;
  ayahNumber: number;
  surahNumber: number;
}

const CARD_THEMES = [
  { id: 'green', bg: 'from-emerald-900 to-emerald-700', text: 'text-white' },
  { id: 'gold', bg: 'from-amber-800 to-amber-600', text: 'text-white' },
  { id: 'blue', bg: 'from-blue-900 to-blue-700', text: 'text-white' },
  { id: 'purple', bg: 'from-purple-900 to-purple-700', text: 'text-white' },
  { id: 'dark', bg: 'from-gray-900 to-gray-800', text: 'text-white' },
  { id: 'light', bg: 'from-amber-50 to-amber-100', text: 'text-gray-900' },
];

export default function ShareAyahCard({
  arabicText,
  translation,
  surahName,
  ayahNumber,
  surahNumber,
}: ShareAyahCardProps) {
  const { incrementShareCount } = useQuran();
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0]);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    const text = `${arabicText}\n\n${translation ? `"${translation}"` : ''}\n\n— ${surahName} ${ayahNumber}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    incrementShareCount();
    toast.success('Ayah copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `${arabicText}\n\n${translation ? `"${translation}"` : ''}\n\n— ${surahName} ${ayahNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
        incrementShareCount();
      } catch (err) {
        // User cancelled
      }
    } else {
      await handleCopy();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Image className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Ayah
          </DialogTitle>
        </DialogHeader>

        {/* Card Preview */}
        <div 
          ref={cardRef}
          className={`p-6 rounded-2xl bg-gradient-to-br ${selectedTheme.bg} ${selectedTheme.text}`}
        >
          <div className="text-center">
            {/* Arabic Text */}
            <p 
              className="font-quran text-xl leading-loose mb-4"
              dir="rtl"
            >
              {arabicText}
            </p>

            {/* Translation */}
            {translation && (
              <p className="text-sm opacity-90 mb-4 italic">
                "{translation}"
              </p>
            )}

            {/* Reference */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm opacity-80">
                {surahName} • Ayah {ayahNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {CARD_THEMES.map(theme => (
              <button
                key={theme.id}
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${theme.bg} border-2 transition-transform
                  ${selectedTheme.id === theme.id ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}
                `}
                onClick={() => setSelectedTheme(theme)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
          <Button className="flex-1 gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}