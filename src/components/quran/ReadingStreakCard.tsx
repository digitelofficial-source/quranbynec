import { Flame, Trophy, Calendar, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuran } from '@/context/QuranContext';

export default function ReadingStreakCard() {
  const { readingStreak, readingGoal, getTodayStats } = useQuran();
  const todayStats = getTodayStats();

  const ayahProgress = todayStats ? (todayStats.ayahsRead / readingGoal.dailyAyahs) * 100 : 0;
  const isGoalMet = ayahProgress >= 100;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-orange-500/10 via-card to-amber-500/5 border-orange-500/20 shadow-lg shadow-orange-500/5">
      <CardContent className="p-4 sm:p-5">
        {/* Header with Flame and Streak Count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Flame className="h-6 w-6 text-white" />
              </div>
              {readingStreak.currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">Reading Streak</h3>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {readingStreak.currentStreak}
            </p>
            <p className="text-xs text-muted-foreground font-medium">days</p>
          </div>
        </div>

        {/* Stats Row - Widget Style */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
            <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-xl font-bold text-foreground">{readingStreak.longestStreak}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Best</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <Calendar className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-bold text-foreground">{readingStreak.totalDaysRead}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <Target className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-xl font-bold text-foreground">{todayStats?.ayahsRead || 0}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Today</p>
          </div>
        </div>

        {/* Daily Goal Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Daily Goal</span>
            <span className={`font-bold ${isGoalMet ? 'text-green-500' : 'text-foreground'}`}>
              {todayStats?.ayahsRead || 0}/{readingGoal.dailyAyahs} ayahs
              {isGoalMet && ' ✓'}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(ayahProgress, 100)} 
              className="h-3 bg-muted/50" 
            />
            <div 
              className="absolute inset-0 h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${Math.min(ayahProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Streak Calendar - Week View */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2 font-medium">This Week</p>
          <div className="flex justify-between gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              const dateStr = date.toISOString().split('T')[0];
              const isToday = i === 6;
              const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
              const hasRead = readingStreak.lastReadDate === dateStr || 
                (i < 6 && readingStreak.currentStreak > (6 - i));
              
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {dayNames[date.getDay()]}
                  </span>
                  <div 
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                      ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                      ${hasRead 
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30' 
                        : 'bg-muted/50 text-muted-foreground'
                      }
                    `}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
