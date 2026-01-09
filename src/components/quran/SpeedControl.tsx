import { Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SPEED_PRESETS } from '@/types/quran';

interface SpeedControlProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export default function SpeedControl({ currentSpeed, onSpeedChange }: SpeedControlProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <Gauge className="h-3.5 w-3.5" />
          {currentSpeed}x
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Playback Speed</p>
          {SPEED_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant={currentSpeed === preset.value ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => onSpeedChange(preset.value)}
            >
              {preset.label}
              {preset.value === 1 && <span className="ml-auto text-xs text-muted-foreground">Normal</span>}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}