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

export interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  arabicFontSize: number;
  translationFontSize: number;
  lineSpacing: number;
  showTranslation: boolean;
  selectedTranslation: string;
  selectedReciter: string;
  playbackSpeed: number;
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

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  arabicFontSize: 28,
  translationFontSize: 16,
  lineSpacing: 1.8,
  showTranslation: true,
  selectedTranslation: 'en.sahih',
  selectedReciter: 'ar.alafasy',
  playbackSpeed: 1,
};
