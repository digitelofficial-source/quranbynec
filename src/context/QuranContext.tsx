import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Bookmark, ReadingProgress, UserSettings, DEFAULT_SETTINGS, RECITERS } from '@/types/quran';

interface QuranContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  readingProgress: ReadingProgress | null;
  updateReadingProgress: (surahNumber: number, ayahNumber: number) => void;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export function QuranProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<UserSettings>('quran-settings', DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('quran-bookmarks', []);
  const [readingProgress, setReadingProgress] = useLocalStorage<ReadingProgress | null>('quran-progress', null);

  // If an older build stored an invalid reciter identifier in localStorage,
  // reset it to a known-good option so audio never 404s silently.
  useEffect(() => {
    const valid = new Set(RECITERS.map((r) => r.identifier));
    if (!valid.has(settings.selectedReciter)) {
      setSettings((prev) => ({ ...prev, selectedReciter: DEFAULT_SETTINGS.selectedReciter }));
    }
  }, [settings.selectedReciter, setSettings]);

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

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
      }}
    >
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}
