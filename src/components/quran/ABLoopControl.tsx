import { useState } from 'react';
import { Repeat, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ABLoopControlProps {
  currentAyah: number;
  totalAyahs: number;
  loopStart: number | null;
  loopEnd: number | null;
  repeatCount: number;
  currentRepeat: number;
  onSetLoopStart: (ayah: number) => void;
  onSetLoopEnd: (ayah: number) => void;
  onClearLoop: () => void;
  onSetRepeatCount: (count: number) => void;
}

export default function ABLoopControl({
  currentAyah,
  totalAyahs,
  loopStart,
  loopEnd,
  repeatCount,
  currentRepeat,
  onSetLoopStart,
  onSetLoopEnd,
  onClearLoop,
  onSetRepeatCount,
}: ABLoopControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLoopActive = loopStart !== null && loopEnd !== null;

  const handleSetA = () => {
    onSetLoopStart(currentAyah);
    toast.success(`Loop start set at Ayah ${currentAyah}`);
  };

  const handleSetB = () => {
    if (loopStart !== null && currentAyah > loopStart) {
      onSetLoopEnd(currentAyah);
      toast.success(`Loop end set at Ayah ${currentAyah}`);
    } else {
      toast.error('End point must be after start point');
    }
  };

  const handleClear = () => {
    onClearLoop();
    toast.info('A-B Loop cleared');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-9 w-9 relative ${isLoopActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
        >
          <Repeat className="h-4 w-4" />
          {isLoopActive && (
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-4 min-w-4 p-0 text-[10px] flex items-center justify-center"
            >
              {currentRepeat}/{repeatCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">A-B Loop</h4>
            {isLoopActive && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 gap-1">
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          {/* Set A-B Points */}
          <div className="flex gap-2">
            <Button 
              variant={loopStart !== null ? "default" : "outline"} 
              size="sm" 
              className="flex-1"
              onClick={handleSetA}
            >
              {loopStart !== null ? `A: ${loopStart}` : 'Set A'}
            </Button>
            <Button 
              variant={loopEnd !== null ? "default" : "outline"} 
              size="sm" 
              className="flex-1"
              onClick={handleSetB}
              disabled={loopStart === null}
            >
              {loopEnd !== null ? `B: ${loopEnd}` : 'Set B'}
            </Button>
          </div>

          {/* Repeat Count */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Repeat Count</label>
            <div className="flex gap-1">
              {[1, 2, 3, 5, 10, 0].map((count) => (
                <Button
                  key={count}
                  variant={repeatCount === count ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs px-2"
                  onClick={() => onSetRepeatCount(count)}
                >
                  {count === 0 ? '∞' : count}
                </Button>
              ))}
            </div>
          </div>

          {isLoopActive && (
            <div className="text-xs text-center text-muted-foreground bg-muted/50 rounded p-2">
              Looping Ayah {loopStart} to {loopEnd}
              <br />
              Repeat: {currentRepeat} of {repeatCount === 0 ? '∞' : repeatCount}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}