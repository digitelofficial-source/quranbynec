import { Award, Lock, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useQuran } from '@/context/QuranContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function AchievementsCard() {
  const { achievements } = useQuran();
  
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const recentUnlocked = achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {unlockedCount} of {achievements.length} unlocked
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-3">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>

        {/* Recent Achievements */}
        {recentUnlocked.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recently Unlocked</p>
            <div className="flex gap-2">
              {recentUnlocked.map(achievement => (
                <div key={achievement.id} className="flex items-center gap-1">
                  <span className="text-xl">{achievement.icon}</span>
                  <span className="text-xs font-medium">{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Achievements */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {achievements.map(achievement => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <div 
                    className={`relative flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105
                      ${achievement.unlockedAt 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                        : 'bg-muted/50 border border-border opacity-50'
                      }
                    `}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    {achievement.unlockedAt ? (
                      <Check className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-background rounded-full p-0.5" />
                    ) : (
                      <Lock className="absolute -top-1 -right-1 h-4 w-4 text-muted-foreground bg-background rounded-full p-0.5" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {!achievement.unlockedAt && achievement.target && (
                    <p className="text-xs mt-1">Progress: {achievement.progress || 0}/{achievement.target}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}