import { Surah, Ayah, AyahWithTranslation, Juz } from '@/types/quran';

const BASE_URL = 'https://api.alquran.cloud/v1';

export async function fetchAllSurahs(): Promise<Surah[]> {
  const response = await fetch(`${BASE_URL}/surah`);
  const data = await response.json();
  if (data.code !== 200) throw new Error('Failed to fetch surahs');
  return data.data;
}

export async function fetchSurah(surahNumber: number): Promise<{ surah: Surah; ayahs: Ayah[] }> {
  const response = await fetch(`${BASE_URL}/surah/${surahNumber}`);
  const data = await response.json();
  if (data.code !== 200) throw new Error('Failed to fetch surah');
  return {
    surah: {
      number: data.data.number,
      name: data.data.name,
      englishName: data.data.englishName,
      englishNameTranslation: data.data.englishNameTranslation,
      numberOfAyahs: data.data.numberOfAyahs,
      revelationType: data.data.revelationType,
    },
    ayahs: data.data.ayahs,
  };
}

export async function fetchSurahWithTranslation(
  surahNumber: number,
  translationEdition: string
): Promise<{ surah: Surah; ayahs: AyahWithTranslation[] }> {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/surah/${surahNumber}`),
    fetch(`${BASE_URL}/surah/${surahNumber}/${translationEdition}`),
  ]);

  const arabicData = await arabicRes.json();
  const translationData = await translationRes.json();

  if (arabicData.code !== 200 || translationData.code !== 200) {
    throw new Error('Failed to fetch surah with translation');
  }

  const ayahs: AyahWithTranslation[] = arabicData.data.ayahs.map((ayah: Ayah, index: number) => ({
    ...ayah,
    translation: translationData.data.ayahs[index]?.text || '',
  }));

  return {
    surah: {
      number: arabicData.data.number,
      name: arabicData.data.name,
      englishName: arabicData.data.englishName,
      englishNameTranslation: arabicData.data.englishNameTranslation,
      numberOfAyahs: arabicData.data.numberOfAyahs,
      revelationType: arabicData.data.revelationType,
    },
    ayahs,
  };
}

export async function fetchSurahAudio(surahNumber: number, reciterEdition: string): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/surah/${surahNumber}/${reciterEdition}`);
  const data = await response.json();
  if (data.code !== 200) throw new Error('Failed to fetch audio');
  return data.data.ayahs.map((ayah: { audio: string }) => ayah.audio);
}

export async function fetchJuz(juzNumber: number): Promise<Juz> {
  const response = await fetch(`${BASE_URL}/juz/${juzNumber}/quran-uthmani`);
  const data = await response.json();
  if (data.code !== 200) throw new Error('Failed to fetch juz');
  return data.data;
}

export async function fetchJuzWithTranslation(
  juzNumber: number,
  translationEdition: string
): Promise<{ juz: Juz; translations: string[] }> {
  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/juz/${juzNumber}/quran-uthmani`),
    fetch(`${BASE_URL}/juz/${juzNumber}/${translationEdition}`),
  ]);

  const arabicData = await arabicRes.json();
  const translationData = await translationRes.json();

  if (arabicData.code !== 200 || translationData.code !== 200) {
    throw new Error('Failed to fetch juz with translation');
  }

  return {
    juz: arabicData.data,
    translations: translationData.data.ayahs.map((ayah: { text: string }) => ayah.text),
  };
}

export async function searchQuran(query: string, language: string = 'en'): Promise<{
  count: number;
  matches: Array<{
    number: number;
    text: string;
    surah: { number: number; name: string; englishName: string };
    numberInSurah: number;
  }>;
}> {
  const response = await fetch(`${BASE_URL}/search/${encodeURIComponent(query)}/all/${language}`);
  const data = await response.json();
  if (data.code !== 200) return { count: 0, matches: [] };
  return data.data;
}

export async function fetchRandomAyah(translationEdition: string = 'en.sahih'): Promise<{
  ayah: AyahWithTranslation;
  surah: { number: number; name: string; englishName: string };
}> {
  // Get a deterministic "random" ayah based on the date
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const ayahNumber = (dayOfYear % 6236) + 1; // 6236 total ayahs

  const [arabicRes, translationRes] = await Promise.all([
    fetch(`${BASE_URL}/ayah/${ayahNumber}`),
    fetch(`${BASE_URL}/ayah/${ayahNumber}/${translationEdition}`),
  ]);

  const arabicData = await arabicRes.json();
  const translationData = await translationRes.json();

  if (arabicData.code !== 200 || translationData.code !== 200) {
    throw new Error('Failed to fetch random ayah');
  }

  return {
    ayah: {
      ...arabicData.data,
      translation: translationData.data.text,
    },
    surah: arabicData.data.surah,
  };
}

export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciter: string = 'ar.alafasy'): string {
  // Format: https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3
  const ayahGlobalNumber = getGlobalAyahNumber(surahNumber, ayahNumber);
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${ayahGlobalNumber}.mp3`;
}

// Helper to calculate global ayah number
const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
  89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
  12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
  30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

function getGlobalAyahNumber(surahNumber: number, ayahInSurah: number): number {
  let total = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    total += SURAH_AYAH_COUNTS[i];
  }
  return total + ayahInSurah;
}

export const JUZ_INFO = [
  { number: 1, startSurah: 1, startAyah: 1, name: 'Alif Lam Mim' },
  { number: 2, startSurah: 2, startAyah: 142, name: 'Sayaqul' },
  { number: 3, startSurah: 2, startAyah: 253, name: 'Tilka ar-Rusul' },
  { number: 4, startSurah: 3, startAyah: 93, name: "Lan Tana Lu" },
  { number: 5, startSurah: 4, startAyah: 24, name: "Wal Muhsanat" },
  { number: 6, startSurah: 4, startAyah: 148, name: "La Yuhibbullah" },
  { number: 7, startSurah: 5, startAyah: 82, name: "Wa Iza Samiu" },
  { number: 8, startSurah: 6, startAyah: 111, name: "Wa Lau Annana" },
  { number: 9, startSurah: 7, startAyah: 88, name: "Qalal Mala" },
  { number: 10, startSurah: 8, startAyah: 41, name: "Wa A'lamu" },
  { number: 11, startSurah: 9, startAyah: 93, name: "Ya'tazirun" },
  { number: 12, startSurah: 11, startAyah: 6, name: "Wa Ma Min Daabbah" },
  { number: 13, startSurah: 12, startAyah: 53, name: "Wa Ma Ubarri'u" },
  { number: 14, startSurah: 15, startAyah: 1, name: "Rubama" },
  { number: 15, startSurah: 17, startAyah: 1, name: "Subhanallazi" },
  { number: 16, startSurah: 18, startAyah: 75, name: "Qala Alam" },
  { number: 17, startSurah: 21, startAyah: 1, name: "Iqtaraba" },
  { number: 18, startSurah: 23, startAyah: 1, name: "Qad Aflaha" },
  { number: 19, startSurah: 25, startAyah: 21, name: "Wa Qalallazina" },
  { number: 20, startSurah: 27, startAyah: 56, name: "A'man Khalaqa" },
  { number: 21, startSurah: 29, startAyah: 46, name: "Utlu Ma Uhiya" },
  { number: 22, startSurah: 33, startAyah: 31, name: "Wa Man Yaqnut" },
  { number: 23, startSurah: 36, startAyah: 22, name: "Wa Mali" },
  { number: 24, startSurah: 39, startAyah: 32, name: "Fa Man Azlam" },
  { number: 25, startSurah: 41, startAyah: 47, name: "Ilayhi Yuraddu" },
  { number: 26, startSurah: 46, startAyah: 1, name: "Ha Mim" },
  { number: 27, startSurah: 51, startAyah: 31, name: "Qala Fa Ma Khatbukum" },
  { number: 28, startSurah: 58, startAyah: 1, name: "Qad Sami Allah" },
  { number: 29, startSurah: 67, startAyah: 1, name: "Tabarakallazi" },
  { number: 30, startSurah: 78, startAyah: 1, name: "Amma Yatasa'alun" },
];
