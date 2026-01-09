import { useState, useEffect, useCallback } from 'react';
import { Moon, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SLEEP_TIMER_OPTIONS } from '@/types/quran';
import { toast } from 'sonner';

interface SleepTimerProps {
  onTimerEnd: () => void;
  isPlaying: boolean;
}

export default function SleepTimer({ onTimerEnd, isPlaying }: SleepTimerProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const startTimer = useCallback((minutes: number) => {
    if (minutes === 0) {
      setIsActive(false);
      setRemainingSeconds(0);
      return;
    }
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setIsActive(true);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  }, []);

  const cancelTimer = useCallback(() => {
    setIsActive(false);
    setRemainingSeconds(0);
    setSelectedMinutes(0);
    toast.info('Sleep timer cancelled');
  }, []);

  useEffect(() => {
    if (!isActive || !isPlaying) return;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setIsActive(false);
          onTimerEnd();
          toast.info('Sleep timer ended - audio paused');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPlaying, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-9 w-9 relative ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Moon className="h-4 w-4" />
          {isActive && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sleep Timer
            </h4>
            {isActive && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelTimer}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {isActive ? (
            <div className="text-center py-4">
              <p className="text-3xl font-mono font-bold text-primary">
                {formatTime(remainingSeconds)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Audio will pause when timer ends
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {SLEEP_TIMER_OPTIONS.filter(o => o.value > 0).map(option => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => startTimer(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}