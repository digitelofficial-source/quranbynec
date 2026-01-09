import { useState } from 'react';
import { GraduationCap, Eye, EyeOff, RotateCcw, Check, X, Brain, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuran } from '@/context/QuranContext';
import { AyahWithTranslation } from '@/types/quran';

interface HifzModePanelProps {
  ayahs: AyahWithTranslation[];
  surahNumber: number;
  currentAyah: number;
  onAyahChange: (ayah: number) => void;
}

export default function HifzModePanel({
  ayahs,
  surahNumber,
  currentAyah,
  onAyahChange,
}: HifzModePanelProps) {
  const { getMemorizationStatus, updateMemorizationProgress } = useQuran();
  const [hideText, setHideText] = useState(false);
  const [hideTranslation, setHideTranslation] = useState(true);
  const [showFirstWords, setShowFirstWords] = useState(3);
  const [quizMode, setQuizMode] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const currentAyahData = ayahs.find(a => a.numberInSurah === currentAyah);
  const memStatus = getMemorizationStatus(surahNumber, currentAyah);

  const getHiddenText = (text: string) => {
    if (!hideText) return text;
    const words = text.split(' ');
    if (showFirstWords >= words.length) return text;
    return words.slice(0, showFirstWords).join(' ') + ' ' + '●'.repeat(words.length - showFirstWords);
  };

  const handleMarkCorrect = () => {
    setCorrectCount(c => c + 1);
    setTotalAttempts(t => t + 1);
    
    const current = memStatus || {
      surahNumber,
      ayahNumber: currentAyah,
      status: 'learning' as const,
      repetitions: 0,
      ease: 2.5,
    };

    updateMemorizationProgress({
      ...current,
      repetitions: current.repetitions + 1,
      lastReviewed: Date.now(),
      status: current.repetitions >= 5 ? 'memorized' : 'reviewing',
      ease: Math.min(current.ease + 0.1, 3),
    });

    // Move to next ayah
    if (currentAyah < ayahs.length) {
      onAyahChange(currentAyah + 1);
    }
  };

  const handleMarkIncorrect = () => {
    setTotalAttempts(t => t + 1);
    
    const current = memStatus || {
      surahNumber,
      ayahNumber: currentAyah,
      status: 'learning' as const,
      repetitions: 0,
      ease: 2.5,
    };

    updateMemorizationProgress({
      ...current,
      status: 'learning',
      ease: Math.max(current.ease - 0.2, 1.3),
      lastReviewed: Date.now(),
    });
  };

  const memorizedCount = ayahs.filter(a => 
    getMemorizationStatus(surahNumber, a.numberInSurah)?.status === 'memorized'
  ).length;

  const progress = (memorizedCount / ayahs.length) * 100;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 via-card to-blue-500/10 border-purple-500/20">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Memorization Mode</h3>
          </div>
          <Badge variant="secondary">
            {memorizedCount}/{ayahs.length} Memorized
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress.toFixed(0)}% Complete
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={hideText ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setHideText(!hideText)}
          >
            {hideText ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {hideText ? 'Hidden' : 'Visible'}
          </Button>

          <Button
            variant={quizMode ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={() => setQuizMode(!quizMode)}
          >
            <Brain className="h-3 w-3" />
            Quiz
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              const randomIndex = Math.floor(Math.random() * ayahs.length);
              onAyahChange(ayahs[randomIndex].numberInSurah);
            }}
          >
            <Shuffle className="h-3 w-3" />
            Random
          </Button>
        </div>

        {/* Hint Words Control */}
        {hideText && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show first</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 5].map(n => (
                <Button
                  key={n}
                  variant={showFirstWords === n ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowFirstWords(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">words</span>
          </div>
        )}

        {/* Quiz Stats */}
        {quizMode && totalAttempts > 0 && (
          <div className="flex items-center justify-center gap-4 p-2 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-green-500">{correctCount}</p>
              <p className="text-[10px] text-muted-foreground">Correct</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold">{((correctCount / totalAttempts) * 100).toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground">{totalAttempts}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
          </div>
        )}

        {/* Current Ayah Display */}
        {currentAyahData && (
          <div className="p-4 rounded-xl bg-background/50 border">
            <p 
              className="font-quran text-xl leading-loose text-center text-foreground"
              dir="rtl"
            >
              {getHiddenText(currentAyahData.text)}
            </p>

            {!hideTranslation && currentAyahData.translation && (
              <p className="text-sm text-muted-foreground text-center mt-3 italic">
                "{currentAyahData.translation}"
              </p>
            )}

            {/* Status Badge */}
            <div className="flex justify-center mt-3">
              <Badge 
                variant={memStatus?.status === 'memorized' ? 'default' : 'outline'}
                className="text-xs"
              >
                {memStatus?.status || 'Not Started'} • {memStatus?.repetitions || 0} reps
              </Badge>
            </div>
          </div>
        )}

        {/* Quiz Actions */}
        {quizMode && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={handleMarkIncorrect}
            >
              <X className="h-4 w-4" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setHideText(false)}
            >
              <Eye className="h-4 w-4" />
              Reveal
            </Button>
            <Button
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              onClick={handleMarkCorrect}
            >
              <Check className="h-4 w-4" />
              Correct
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}