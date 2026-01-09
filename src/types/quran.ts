export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface AyahWithTranslation extends Ayah {
  translation?: string;
  audio?: string;
}

export interface Juz {
  number: number;
  ayahs: Ayah[];
  surahs: { [key: string]: { number: number; name: string; englishName: string } };
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction?: string;
}

export interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
}

export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface AyahNote {
  surahNumber: number;
  ayahNumber: number;
  note: string;
  timestamp: number;
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string;
  totalDaysRead: number;
  startDate: string;
}

export interface ReadingGoal {
  dailyAyahs: number;
  dailyMinutes: number;
  weeklyJuz: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress?: number;
  target?: number;
}

export interface MemorizationProgress {
  surahNumber: number;
  ayahNumber: number;
  status: 'not_started' | 'learning' | 'reviewing' | 'memorized';
  repetitions: number;
  lastReviewed?: number;
  nextReview?: number;
  ease: number; // For spaced repetition
}

export interface HifzSession {
  id: string;
  startTime: number;
  endTime?: number;
  ayahsReviewed: number;
  correctCount: number;
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  arabicFontSize: number;
  translationFontSize: number;
  lineSpacing: number;
  showTranslation: boolean;
  selectedTranslation: string;
  selectedReciter: string;
  playbackSpeed: number;
  // New settings
  sleepTimerMinutes: number;
  repeatCount: number;
  abLoopStart: number | null;
  abLoopEnd: number | null;
  autoScrollEnabled: boolean;
  wordByWordEnabled: boolean;
  tajweedHighlighting: boolean;
  continuousPlay: boolean;
}

export interface DailyStats {
  date: string;
  ayahsRead: number;
  minutesSpent: number;
  pagesRead: number;
  surahsCompleted: number[];
}

export const RECITERS: Reciter[] = [
  { identifier: 'ar.alafasy', name: 'مشاري العفاسي', englishName: 'Mishary Rashid Alafasy' },
  { identifier: 'ar.abdulsamad', name: 'عبدالباسط عبدالصمد', englishName: 'Abdul Samad' },
  { identifier: 'ar.abdurrahmaansudais', name: 'عبدالرحمن السديس', englishName: 'Abdurrahmaan As-Sudais' },
  { identifier: 'ar.saoodshuraym', name: 'سعود الشريم', englishName: 'Saud Al-Shuraim' },
  { identifier: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', englishName: 'Maher Al Muaiqly' },
  { identifier: 'ar.husary', name: 'محمود خليل الحصري', englishName: 'Mahmoud Khalil Al-Husary' },
  { identifier: 'ar.ahmedajamy', name: 'أحمد العجمي', englishName: 'Ahmed Al Ajmi' },
  { identifier: 'ar.shaatree', name: 'أبو بكر الشاطري', englishName: 'Abu Bakr Ash-Shaatree' },
];

export const TRANSLATIONS: { identifier: string; language: string; name: string }[] = [
  { identifier: 'en.sahih', language: 'English', name: 'Sahih International' },
  { identifier: 'en.pickthall', language: 'English', name: 'Pickthall' },
  { identifier: 'ur.jalandhry', language: 'Urdu', name: 'Fateh Muhammad Jalandhry' },
  { identifier: 'hi.hindi', language: 'Hindi', name: 'Hindi Translation' },
  { identifier: 'bn.bengali', language: 'Bengali', name: 'Muhiuddin Khan' },
  { identifier: 'tr.diyanet', language: 'Turkish', name: 'Diyanet İşleri' },
  { identifier: 'id.indonesian', language: 'Indonesian', name: 'Indonesian Ministry' },
  { identifier: 'ms.basmeih', language: 'Malay', name: 'Abdullah Muhammad Basmeih' },
  { identifier: 'fr.hamidullah', language: 'French', name: 'Muhammad Hamidullah' },
  { identifier: 'de.bubenheim', language: 'German', name: 'Bubenheim & Elyas' },
  { identifier: 'es.cortes', language: 'Spanish', name: 'Julio Cortes' },
  { identifier: 'fa.makarem', language: 'Persian', name: 'Ayatollah Makarem Shirazi' },
  { identifier: 'ru.kuliev', language: 'Russian', name: 'Elmir Kuliev' },
  { identifier: 'zh.majian', language: 'Chinese', name: 'Ma Jian' },
];

export const SPEED_PRESETS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

export const SLEEP_TIMER_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
];

export const ACHIEVEMENTS_LIST: Achievement[] = [
  { id: 'first_ayah', title: 'First Step', description: 'Read your first ayah', icon: '🌟', target: 1 },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day reading streak', icon: '🔥', target: 7 },
  { id: 'streak_30', title: 'Monthly Master', description: '30-day reading streak', icon: '💪', target: 30 },
  { id: 'surah_complete', title: 'Surah Scholar', description: 'Complete a full surah', icon: '📖', target: 1 },
  { id: 'juz_complete', title: 'Juz Journey', description: 'Complete a full juz', icon: '📚', target: 1 },
  { id: 'ayahs_100', title: 'Century Reader', description: 'Read 100 ayahs', icon: '💯', target: 100 },
  { id: 'ayahs_1000', title: 'Thousand Tales', description: 'Read 1000 ayahs', icon: '🏆', target: 1000 },
  { id: 'bookmarks_10', title: 'Bookmark Keeper', description: 'Save 10 bookmarks', icon: '🔖', target: 10 },
  { id: 'memorize_fatiha', title: 'Al-Fatiha Master', description: 'Memorize Al-Fatiha', icon: '🎓', target: 1 },
  { id: 'night_reader', title: 'Night Owl', description: 'Read after midnight', icon: '🌙', target: 1 },
  { id: 'early_bird', title: 'Early Bird', description: 'Read before Fajr', icon: '🌅', target: 1 },
  { id: 'share_10', title: 'Sharing is Caring', description: 'Share 10 ayahs', icon: '💝', target: 10 },
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  arabicFontSize: 28,
  translationFontSize: 16,
  lineSpacing: 1.8,
  showTranslation: true,
  selectedTranslation: 'en.sahih',
  selectedReciter: 'ar.alafasy',
  playbackSpeed: 1,
  sleepTimerMinutes: 0,
  repeatCount: 1,
  abLoopStart: null,
  abLoopEnd: null,
  autoScrollEnabled: true,
  wordByWordEnabled: false,
  tajweedHighlighting: false,
  continuousPlay: true,
};

export const DEFAULT_READING_GOAL: ReadingGoal = {
  dailyAyahs: 20,
  dailyMinutes: 15,
  weeklyJuz: 1,
};

export const DEFAULT_STREAK: ReadingStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: '',
  totalDaysRead: 0,
  startDate: new Date().toISOString().split('T')[0],
};