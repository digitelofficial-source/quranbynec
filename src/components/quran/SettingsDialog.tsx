import { Settings, Moon, Sun, BookOpen, Type, Minus, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuran } from '@/context/QuranContext';
import { TRANSLATIONS, RECITERS } from '@/types/quran';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useQuran();

  const handleThemeChange = (theme: 'light' | 'dark' | 'sepia') => {
    updateSettings({ theme });
    document.documentElement.classList.remove('light', 'dark', 'sepia');
    document.documentElement.classList.add(theme);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={settings.theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={settings.theme === 'sepia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleThemeChange('sepia')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Sepia
              </Button>
            </div>
          </div>

          {/* Translation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Translation</Label>
            <Select
              value={settings.selectedTranslation}
              onValueChange={(value) => updateSettings({ selectedTranslation: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSLATIONS.map((t) => (
                  <SelectItem key={t.identifier} value={t.identifier}>
                    {t.language} - {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reciter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Reciter (Qari)</Label>
            <Select
              value={settings.selectedReciter}
              onValueChange={(value) => updateSettings({ selectedReciter: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECITERS.map((r) => (
                  <SelectItem key={r.identifier} value={r.identifier}>
                    {r.englishName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show Translation Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Show Translation</Label>
            <Switch
              checked={settings.showTranslation}
              onCheckedChange={(checked) => updateSettings({ showTranslation: checked })}
            />
          </div>

          {/* Arabic Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Arabic Font Size</Label>
              <span className="text-sm text-muted-foreground">{settings.arabicFontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateSettings({ arabicFontSize: Math.max(18, settings.arabicFontSize - 2) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                value={[settings.arabicFontSize]}
                onValueChange={([value]) => updateSettings({ arabicFontSize: value })}
                min={18}
                max={48}
                step={2}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateSettings({ arabicFontSize: Math.min(48, settings.arabicFontSize + 2) })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Translation Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Translation Font Size</Label>
              <span className="text-sm text-muted-foreground">{settings.translationFontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateSettings({ translationFontSize: Math.max(12, settings.translationFontSize - 1) })}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Slider
                value={[settings.translationFontSize]}
                onValueChange={([value]) => updateSettings({ translationFontSize: value })}
                min={12}
                max={24}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateSettings({ translationFontSize: Math.min(24, settings.translationFontSize + 1) })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Playback Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Playback Speed</Label>
              <span className="text-sm text-muted-foreground">{settings.playbackSpeed}x</span>
            </div>
            <div className="flex gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                <Button
                  key={speed}
                  variant={settings.playbackSpeed === speed ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateSettings({ playbackSpeed: speed })}
                >
                  {speed}x
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
