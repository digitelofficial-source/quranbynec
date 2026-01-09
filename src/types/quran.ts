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
  // Most Popular Reciters
  { identifier: 'ar.alafasy', name: 'مشاري العفاسي', englishName: 'Mishary Rashid Alafasy' },
  { identifier: 'ar.abdulsamad', name: 'عبدالباسط عبدالصمد', englishName: 'Abdul Basit Abdul Samad' },
  { identifier: 'ar.abdurrahmaansudais', name: 'عبدالرحمن السديس', englishName: 'Abdurrahmaan As-Sudais' },
  { identifier: 'ar.saoodshuraym', name: 'سعود الشريم', englishName: 'Saud Al-Shuraim' },
  { identifier: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', englishName: 'Maher Al Muaiqly' },
  { identifier: 'ar.husary', name: 'محمود خليل الحصري', englishName: 'Mahmoud Khalil Al-Husary' },
  { identifier: 'ar.ahmedajamy', name: 'أحمد العجمي', englishName: 'Ahmed Al Ajmi' },
  { identifier: 'ar.shaatree', name: 'أبو بكر الشاطري', englishName: 'Abu Bakr Ash-Shaatree' },
  // Additional World-Famous Reciters
  { identifier: 'ar.minshawi', name: 'محمد صديق المنشاوي', englishName: 'Mohamed Siddiq Al-Minshawi' },
  { identifier: 'ar.minshawimujawwad', name: 'المنشاوي مجود', englishName: 'Al-Minshawi (Mujawwad)' },
  { identifier: 'ar.husarymujawwad', name: 'الحصري مجود', englishName: 'Al-Husary (Mujawwad)' },
  { identifier: 'ar.muhammadayyoub', name: 'محمد أيوب', englishName: 'Muhammad Ayyub' },
  { identifier: 'ar.muhammadjibreel', name: 'محمد جبريل', englishName: 'Muhammad Jibreel' },
  { identifier: 'ar.parhizgar', name: 'شهريار پرهیزگار', englishName: 'Shahriar Parhizgar' },
  { identifier: 'ar.aaboromee', name: 'إبراهيم الدوسري', englishName: 'Ibrahim Al-Dossari' },
  { identifier: 'ar.haboromee', name: 'هاني الرفاعي', englishName: 'Hani Ar-Rifai' },
  { identifier: 'ar.husarymuallem', name: 'الحصري المعلم', englishName: 'Al-Husary (Muallim)' },
  { identifier: 'ar.abdullahbasfar', name: 'عبدالله بصفر', englishName: 'Abdullah Basfar' },
  { identifier: 'ar.akramalaqqad', name: 'أكرم العلاقمي', englishName: 'Akram Al-Alaqmi' },
  { identifier: 'ar.bandarbalilah', name: 'بندر بليلة', englishName: 'Bandar Balilah' },
  { identifier: 'ar.ibrahimakhdar', name: 'إبراهيم الأخضر', englishName: 'Ibrahim Al-Akhdar' },
  { identifier: 'ar.yaboromee', name: 'ياسر الدوسري', englishName: 'Yasser Al-Dosari' },
  { identifier: 'ar.faboromee', name: 'فارس عباد', englishName: 'Fares Abbad' },
  { identifier: 'ar.naboromee', name: 'ناصر القطامي', englishName: 'Nasser Al-Qatami' },
  { identifier: 'ar.khalifaa', name: 'خليفة الطنيجي', englishName: 'Khalifah Al-Tunaiji' },
  { identifier: 'ar.aliabdullah', name: 'علي جابر', englishName: 'Ali Jaber' },
  { identifier: 'ar.saboromee', name: 'صلاح بو خاطر', englishName: 'Salah Bukhatir' },
  { identifier: 'ar.tababoromee', name: 'سلمان العتيبي', englishName: 'Salman Al-Utaybi' },
  { identifier: 'ar.aymanswoaid', name: 'أيمن سويد', englishName: 'Ayman Sowaid' },
  { identifier: 'ar.abdulbari', name: 'عبدالباري الثبيتي', englishName: 'Abdul Bari Ath-Thubaity' },
];

export const TRANSLATIONS: { identifier: string; language: string; name: string }[] = [
  // English Translations
  { identifier: 'en.sahih', language: 'English', name: 'Sahih International' },
  { identifier: 'en.pickthall', language: 'English', name: 'Pickthall' },
  { identifier: 'en.yusufali', language: 'English', name: 'Yusuf Ali' },
  { identifier: 'en.asad', language: 'English', name: 'Muhammad Asad' },
  { identifier: 'en.daryabadi', language: 'English', name: 'Daryabadi' },
  { identifier: 'en.hilali', language: 'English', name: 'Hilali & Khan' },
  { identifier: 'en.itani', language: 'English', name: 'Talal Itani' },
  { identifier: 'en.sarwar', language: 'English', name: 'Muhammad Sarwar' },
  { identifier: 'en.wahiduddin', language: 'English', name: 'Wahiduddin Khan' },
  { identifier: 'en.transliteration', language: 'English', name: 'Transliteration' },
  // Urdu Translations
  { identifier: 'ur.jalandhry', language: 'Urdu', name: 'Fateh Muhammad Jalandhry' },
  { identifier: 'ur.ahmedali', language: 'Urdu', name: 'Ahmed Ali' },
  { identifier: 'ur.junagarhi', language: 'Urdu', name: 'Muhammad Junagarhi' },
  { identifier: 'ur.maududi', language: 'Urdu', name: 'Abul Ala Maududi' },
  { identifier: 'ur.qadri', language: 'Urdu', name: 'Tahir ul Qadri' },
  // Hindi Translations
  { identifier: 'hi.hindi', language: 'Hindi', name: 'Hindi Translation' },
  { identifier: 'hi.farooq', language: 'Hindi', name: 'Muhammad Farooq Khan' },
  // Bengali Translations
  { identifier: 'bn.bengali', language: 'Bengali', name: 'Muhiuddin Khan' },
  { identifier: 'bn.hoque', language: 'Bengali', name: 'Zohurul Hoque' },
  // Arabic Tafsir
  { identifier: 'ar.muyassar', language: 'Arabic', name: 'King Fahad Quran Complex' },
  { identifier: 'ar.jalalayn', language: 'Arabic', name: 'Tafsir al-Jalalayn' },
  // Turkish Translations
  { identifier: 'tr.diyanet', language: 'Turkish', name: 'Diyanet İşleri' },
  { identifier: 'tr.yazir', language: 'Turkish', name: 'Elmalılı Hamdi Yazır' },
  { identifier: 'tr.ozturk', language: 'Turkish', name: 'Yaşar Nuri Öztürk' },
  { identifier: 'tr.golpinarli', language: 'Turkish', name: 'Abdulbaki Gölpınarlı' },
  { identifier: 'tr.ates', language: 'Turkish', name: 'Süleyman Ateş' },
  // Indonesian/Malay Translations
  { identifier: 'id.indonesian', language: 'Indonesian', name: 'Indonesian Ministry' },
  { identifier: 'id.muntakhab', language: 'Indonesian', name: 'Quraish Shihab' },
  { identifier: 'ms.basmeih', language: 'Malay', name: 'Abdullah Muhammad Basmeih' },
  // French Translations
  { identifier: 'fr.hamidullah', language: 'French', name: 'Muhammad Hamidullah' },
  { identifier: 'fr.montada', language: 'French', name: 'Montada Islamic Foundation' },
  // German Translations
  { identifier: 'de.bubenheim', language: 'German', name: 'Bubenheim & Elyas' },
  { identifier: 'de.aburida', language: 'German', name: 'Abu Rida' },
  { identifier: 'de.khoury', language: 'German', name: 'Adel Theodor Khoury' },
  { identifier: 'de.zaidan', language: 'German', name: 'Amir Zaidan' },
  // Spanish Translations
  { identifier: 'es.cortes', language: 'Spanish', name: 'Julio Cortes' },
  { identifier: 'es.asad', language: 'Spanish', name: 'Muhammad Asad (Spanish)' },
  { identifier: 'es.bornez', language: 'Spanish', name: 'Raúl González Bórnez' },
  // Portuguese Translations
  { identifier: 'pt.elhayek', language: 'Portuguese', name: 'Samir El-Hayek' },
  { identifier: 'pt.nasr', language: 'Portuguese', name: 'Helmi Nasr' },
  // Persian/Farsi Translations
  { identifier: 'fa.makarem', language: 'Persian', name: 'Ayatollah Makarem Shirazi' },
  { identifier: 'fa.ansarian', language: 'Persian', name: 'Hussain Ansarian' },
  { identifier: 'fa.ayati', language: 'Persian', name: 'Abolqasem Ayati' },
  { identifier: 'fa.fooladvand', language: 'Persian', name: 'Mohammad Mahdi Fooladvand' },
  { identifier: 'fa.ghomshei', language: 'Persian', name: 'Elahi Ghomshei' },
  // Russian Translations
  { identifier: 'ru.kuliev', language: 'Russian', name: 'Elmir Kuliev' },
  { identifier: 'ru.osmanov', language: 'Russian', name: 'Magomed-Nuri Osmanov' },
  { identifier: 'ru.krachkovsky', language: 'Russian', name: 'Ignaty Krachkovsky' },
  { identifier: 'ru.abuadel', language: 'Russian', name: 'Abu Adel' },
  // Chinese Translations
  { identifier: 'zh.majian', language: 'Chinese', name: 'Ma Jian' },
  { identifier: 'zh.jian', language: 'Chinese', name: 'Ma Jian (Traditional)' },
  // Japanese Translation
  { identifier: 'ja.japanese', language: 'Japanese', name: 'Japanese Translation' },
  // Korean Translation
  { identifier: 'ko.korean', language: 'Korean', name: 'Korean Translation' },
  // Italian Translations
  { identifier: 'it.piccardo', language: 'Italian', name: 'Hamza Piccardo' },
  // Dutch Translation
  { identifier: 'nl.keyzer', language: 'Dutch', name: 'Salomo Keyzer' },
  { identifier: 'nl.siregar', language: 'Dutch', name: 'Sofian Siregar' },
  // Swedish Translation
  { identifier: 'sv.bernstrom', language: 'Swedish', name: 'Knut Bernström' },
  // Norwegian Translation
  { identifier: 'no.berg', language: 'Norwegian', name: 'Einar Berg' },
  // Polish Translation
  { identifier: 'pl.bielawskiego', language: 'Polish', name: 'Józef Bielawski' },
  // Czech Translation
  { identifier: 'cs.hrbek', language: 'Czech', name: 'Ivan Hrbek' },
  { identifier: 'cs.nykl', language: 'Czech', name: 'A.R. Nykl' },
  // Albanian Translation
  { identifier: 'sq.ahmeti', language: 'Albanian', name: 'Sherif Ahmeti' },
  { identifier: 'sq.mehdiu', language: 'Albanian', name: 'Feti Mehdiu' },
  // Bosnian Translation
  { identifier: 'bs.korkut', language: 'Bosnian', name: 'Besim Korkut' },
  { identifier: 'bs.mlivo', language: 'Bosnian', name: 'Mustafa Mlivo' },
  // Azerbaijani Translation
  { identifier: 'az.mammadaliyev', language: 'Azerbaijani', name: 'Vasim Mammadaliyev' },
  { identifier: 'az.musayev', language: 'Azerbaijani', name: 'Alikhan Musayev' },
  // Tamil Translation
  { identifier: 'ta.tamil', language: 'Tamil', name: 'Tamil Translation' },
  // Malayalam Translation
  { identifier: 'ml.abdulhameed', language: 'Malayalam', name: 'Abdul Hameed & Kunhi' },
  { identifier: 'ml.karakunnu', language: 'Malayalam', name: 'Cheriyamundam Abdul Hameed' },
  // Telugu Translation
  { identifier: 'te.maulana', language: 'Telugu', name: 'Maulana Abul Aala Maududi' },
  // Swahili Translation
  { identifier: 'sw.barwani', language: 'Swahili', name: 'Ali Muhsin Al-Barwani' },
  // Hausa Translation
  { identifier: 'ha.gumi', language: 'Hausa', name: 'Abubakar Mahmud Gumi' },
  // Somali Translation
  { identifier: 'so.abduh', language: 'Somali', name: 'Mahmud Muhammad Abduh' },
  // Amharic Translation
  { identifier: 'am.sadiq', language: 'Amharic', name: 'Sadiq & Sani' },
  // Thai Translation
  { identifier: 'th.thai', language: 'Thai', name: 'Thai Translation' },
  // Vietnamese Translation
  { identifier: 'vi.khang', language: 'Vietnamese', name: 'Hassan Abdulkarim' },
  // Uzbek Translation
  { identifier: 'uz.sodik', language: 'Uzbek', name: 'Muhammad Sodik' },
  // Kazakh Translation
  { identifier: 'kk.altai', language: 'Kazakh', name: 'Khalifa Altai' },
  // Tajik Translation
  { identifier: 'tg.ayati', language: 'Tajik', name: 'Tajik Translation' },
  // Kurdish Translation
  { identifier: 'ku.asan', language: 'Kurdish', name: 'Burhan Muhammad-Amin' },
  // Sindhi Translation
  { identifier: 'sd.amroti', language: 'Sindhi', name: 'Taj Mehmood Amroti' },
  // Pashto Translation
  { identifier: 'ps.abdulwali', language: 'Pashto', name: 'Abdul Wali Khan' },
  // Uyghur Translation
  { identifier: 'ug.saleh', language: 'Uyghur', name: 'Muhammad Saleh' },
  // Romanian Translation
  { identifier: 'ro.grigore', language: 'Romanian', name: 'George Grigore' },
  // Bulgarian Translation
  { identifier: 'bg.theophanov', language: 'Bulgarian', name: 'Tzvetan Theophanov' },
  // Divehi/Maldivian Translation
  { identifier: 'dv.divehi', language: 'Divehi', name: 'Office of the President of Maldives' },
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