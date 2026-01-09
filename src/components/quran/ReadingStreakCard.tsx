import { Flame, Trophy, Calendar, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuran } from '@/context/QuranContext';

export default function ReadingStreakCard() {
  const { readingStreak, readingGoal, getTodayStats } = useQuran();
  const todayStats = getTodayStats();

  const ayahProgress = todayStats ? (todayStats.ayahsRead / readingGoal.dailyAyahs) * 100 : 0;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-accent/10 via-card to-primary/5 border-accent/20">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Reading Streak
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Keep your streak going!</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-500">{readingStreak.currentStreak}</p>
            <p className="text-xs text-muted-foreground">days</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
            <p className="text-lg font-semibold">{readingStreak.longestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Best Streak</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-lg font-semibold">{readingStreak.totalDaysRead}</p>
            <p className="text-[10px] text-muted-foreground">Total Days</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Target className="h-4 w-4 mx-auto text-green-500 mb-1" />
            <p className="text-lg font-semibold">{todayStats?.ayahsRead || 0}</p>
            <p className="text-[10px] text-muted-foreground">Today</p>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Daily Goal</span>
            <span className="font-medium">{todayStats?.ayahsRead || 0}/{readingGoal.dailyAyahs} ayahs</span>
          </div>
          <Progress value={Math.min(ayahProgress, 100)} className="h-2" />
        </div>

        {/* Streak Calendar Preview */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const dateStr = date.toISOString().split('T')[0];
              const isToday = i === 6;
              const hasRead = readingStreak.lastReadDate === dateStr || 
                (i < 6 && readingStreak.currentStreak > (6 - i));
              
              return (
                <div 
                  key={i} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                    ${hasRead ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}
                  `}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}