import React, { createContext, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  Bookmark, 
  ReadingProgress, 
  UserSettings, 
  DEFAULT_SETTINGS, 
  RECITERS,
  AyahNote,
  ReadingStreak,
  ReadingGoal,
  Achievement,
  ACHIEVEMENTS_LIST,
  DEFAULT_READING_GOAL,
  DEFAULT_STREAK,
  DailyStats,
  MemorizationProgress
} from '@/types/quran';

interface QuranContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  readingProgress: ReadingProgress | null;
  updateReadingProgress: (surahNumber: number, ayahNumber: number) => void;
  // Notes
  notes: AyahNote[];
  addNote: (surahNumber: number, ayahNumber: number, note: string) => void;
  removeNote: (surahNumber: number, ayahNumber: number) => void;
  getNote: (surahNumber: number, ayahNumber: number) => string | undefined;
  // Reading Streak
  readingStreak: ReadingStreak;
  updateStreak: () => void;
  // Reading Goals
  readingGoal: ReadingGoal;
  updateReadingGoal: (updates: Partial<ReadingGoal>) => void;
  // Achievements
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievements: () => void;
  // Daily Stats
  dailyStats: DailyStats[];
  recordAyahRead: (count?: number) => void;
  recordTimeSpent: (minutes: number) => void;
  getTodayStats: () => DailyStats | undefined;
  // Memorization
  memorizationProgress: MemorizationProgress[];
  updateMemorizationProgress: (progress: MemorizationProgress) => void;
  getMemorizationStatus: (surahNumber: number, ayahNumber: number) => MemorizationProgress | undefined;
  // Share count
  shareCount: number;
  incrementShareCount: () => void;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export function QuranProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<UserSettings>('quran-settings', DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('quran-bookmarks', []);
  const [readingProgress, setReadingProgress] = useLocalStorage<ReadingProgress | null>('quran-progress', null);
  const [notes, setNotes] = useLocalStorage<AyahNote[]>('quran-notes', []);
  const [readingStreak, setReadingStreak] = useLocalStorage<ReadingStreak>('quran-streak', DEFAULT_STREAK);
  const [readingGoal, setReadingGoal] = useLocalStorage<ReadingGoal>('quran-goal', DEFAULT_READING_GOAL);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('quran-achievements', ACHIEVEMENTS_LIST);
  const [dailyStats, setDailyStats] = useLocalStorage<DailyStats[]>('quran-daily-stats', []);
  const [memorizationProgress, setMemorizationProgress] = useLocalStorage<MemorizationProgress[]>('quran-memorization', []);
  const [shareCount, setShareCount] = useLocalStorage<number>('quran-share-count', 0);

  // Validate reciter
  useEffect(() => {
    const valid = new Set(RECITERS.map((r) => r.identifier));
    if (!valid.has(settings.selectedReciter)) {
      setSettings((prev) => ({ ...prev, selectedReciter: DEFAULT_SETTINGS.selectedReciter }));
    }
  }, [settings.selectedReciter, setSettings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Bookmarks
  const addBookmark = (bookmark: Omit<Bookmark, 'timestamp'>) => {
    setBookmarks(prev => {
      const exists = prev.some(
        b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
      );
      if (exists) return prev;
      return [...prev, { ...bookmark, timestamp: Date.now() }];
    });
  };

  const removeBookmark = (surahNumber: number, ayahNumber: number) => {
    setBookmarks(prev =>
      prev.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber))
    );
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  };

  const updateReadingProgress = (surahNumber: number, ayahNumber: number) => {
    setReadingProgress({ surahNumber, ayahNumber, timestamp: Date.now() });
  };

  // Notes
  const addNote = (surahNumber: number, ayahNumber: number, note: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => !(n.surahNumber === surahNumber && n.ayahNumber === ayahNumber));
      return [...filtered, { surahNumber, ayahNumber, note, timestamp: Date.now() }];
    });
  };

  const removeNote = (surahNumber: number, ayahNumber: number) => {
    setNotes(prev => prev.filter(n => !(n.surahNumber === surahNumber && n.ayahNumber === ayahNumber)));
  };

  const getNote = (surahNumber: number, ayahNumber: number) => {
    return notes.find(n => n.surahNumber === surahNumber && n.ayahNumber === ayahNumber)?.note;
  };

  // Reading Streak
  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setReadingStreak(prev => {
      if (prev.lastReadDate === today) return prev;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = prev.currentStreak;
      if (prev.lastReadDate === yesterdayStr) {
        newStreak += 1;
      } else if (prev.lastReadDate !== today) {
        newStreak = 1;
      }
      
      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastReadDate: today,
        totalDaysRead: prev.totalDaysRead + (prev.lastReadDate === today ? 0 : 1),
        startDate: prev.startDate || today,
      };
    });
  }, [setReadingStreak]);

  // Reading Goals
  const updateReadingGoal = (updates: Partial<ReadingGoal>) => {
    setReadingGoal(prev => ({ ...prev, ...updates }));
  };

  // Achievements
  const unlockAchievement = (id: string) => {
    setAchievements(prev => 
      prev.map(a => a.id === id && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a)
    );
  };

  const checkAchievements = useCallback(() => {
    // Check streak achievements
    if (readingStreak.currentStreak >= 7) {
      unlockAchievement('streak_7');
    }
    if (readingStreak.currentStreak >= 30) {
      unlockAchievement('streak_30');
    }
    
    // Check bookmark achievements
    if (bookmarks.length >= 10) {
      unlockAchievement('bookmarks_10');
    }

    // Check share achievements
    if (shareCount >= 10) {
      unlockAchievement('share_10');
    }

    // Check time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 4) {
      unlockAchievement('night_reader');
    }
    if (hour >= 4 && hour < 6) {
      unlockAchievement('early_bird');
    }

    // Check total ayahs read
    const totalAyahs = dailyStats.reduce((sum, s) => sum + s.ayahsRead, 0);
    if (totalAyahs >= 1) {
      unlockAchievement('first_ayah');
    }
    if (totalAyahs >= 100) {
      unlockAchievement('ayahs_100');
    }
    if (totalAyahs >= 1000) {
      unlockAchievement('ayahs_1000');
    }
  }, [readingStreak, bookmarks, shareCount, dailyStats]);

  // Daily Stats
  const getTodayStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailyStats.find(s => s.date === today);
  }, [dailyStats]);

  const recordAyahRead = useCallback((count = 1) => {
    const today = new Date().toISOString().split('T')[0];
    setDailyStats(prev => {
      const existing = prev.find(s => s.date === today);
      if (existing) {
        return prev.map(s => s.date === today ? { ...s, ayahsRead: s.ayahsRead + count } : s);
      }
      return [...prev, { date: today, ayahsRead: count, minutesSpent: 0, pagesRead: 0, surahsCompleted: [] }];
    });
    updateStreak();
  }, [setDailyStats, updateStreak]);

  const recordTimeSpent = useCallback((minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    setDailyStats(prev => {
      const existing = prev.find(s => s.date === today);
      if (existing) {
        return prev.map(s => s.date === today ? { ...s, minutesSpent: s.minutesSpent + minutes } : s);
      }
      return [...prev, { date: today, ayahsRead: 0, minutesSpent: minutes, pagesRead: 0, surahsCompleted: [] }];
    });
  }, [setDailyStats]);

  // Memorization
  const updateMemorizationProgress = (progress: MemorizationProgress) => {
    setMemorizationProgress(prev => {
      const filtered = prev.filter(p => 
        !(p.surahNumber === progress.surahNumber && p.ayahNumber === progress.ayahNumber)
      );
      return [...filtered, progress];
    });
  };

  const getMemorizationStatus = (surahNumber: number, ayahNumber: number) => {
    return memorizationProgress.find(p => 
      p.surahNumber === surahNumber && p.ayahNumber === ayahNumber
    );
  };

  // Share count
  const incrementShareCount = () => {
    setShareCount(prev => prev + 1);
  };

  // Check achievements periodically
  useEffect(() => {
    checkAchievements();
  }, [readingStreak, bookmarks, dailyStats, shareCount, checkAchievements]);

  return (
    <QuranContext.Provider
      value={{
        settings,
        updateSettings,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        readingProgress,
        updateReadingProgress,
        notes,
        addNote,
        removeNote,
        getNote,
        readingStreak,
        updateStreak,
        readingGoal,
        updateReadingGoal,
        achievements,
        unlockAchievement,
        checkAchievements,
        dailyStats,
        recordAyahRead,
        recordTimeSpent,
        getTodayStats,
        memorizationProgress,
        updateMemorizationProgress,
        getMemorizationStatus,
        shareCount,
        incrementShareCount,
      }}
    >
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran(): QuranContextType {
  const context = useContext(QuranContext);
  if (!context) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}