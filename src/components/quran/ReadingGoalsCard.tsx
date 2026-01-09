import { useState } from 'react';
import { Target, Settings2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuran } from '@/context/QuranContext';

export default function ReadingGoalsCard() {
  const { readingGoal, updateReadingGoal, getTodayStats } = useQuran();
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState(readingGoal);

  const todayStats = getTodayStats();
  const ayahProgress = todayStats ? (todayStats.ayahsRead / readingGoal.dailyAyahs) * 100 : 0;
  const timeProgress = todayStats ? (todayStats.minutesSpent / readingGoal.dailyMinutes) * 100 : 0;

  const handleSave = () => {
    updateReadingGoal(tempGoals);
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-foreground">Daily Goals</h3>
          </div>
          
          <Popover open={isEditing} onOpenChange={setIsEditing}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Set Your Goals</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="dailyAyahs" className="text-xs">Daily Ayahs</Label>
                  <Input
                    id="dailyAyahs"
                    type="number"
                    value={tempGoals.dailyAyahs}
                    onChange={(e) => setTempGoals(prev => ({ ...prev, dailyAyahs: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyMinutes" className="text-xs">Daily Minutes</Label>
                  <Input
                    id="dailyMinutes"
                    type="number"
                    value={tempGoals.dailyMinutes}
                    onChange={(e) => setTempGoals(prev => ({ ...prev, dailyMinutes: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={180}
                  />
                </div>

                <Button className="w-full gap-2" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                  Save Goals
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Ayah Goal */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">📖 Ayahs</span>
            <span className="font-medium">
              {todayStats?.ayahsRead || 0} / {readingGoal.dailyAyahs}
              {ayahProgress >= 100 && <span className="ml-1 text-green-500">✓</span>}
            </span>
          </div>
          <Progress value={Math.min(ayahProgress, 100)} className="h-2" />
        </div>

        {/* Time Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">⏱️ Minutes</span>
            <span className="font-medium">
              {todayStats?.minutesSpent || 0} / {readingGoal.dailyMinutes}
              {timeProgress >= 100 && <span className="ml-1 text-green-500">✓</span>}
            </span>
          </div>
          <Progress value={Math.min(timeProgress, 100)} className="h-2" />
        </div>

        {/* Completion Message */}
        {ayahProgress >= 100 && timeProgress >= 100 && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              🎉 All goals completed today!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}