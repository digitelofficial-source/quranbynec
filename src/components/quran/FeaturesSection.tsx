import { Book, Headphones, Bookmark, Globe, Moon, Smartphone, GraduationCap, Search } from 'lucide-react';

const features = [
  {
    icon: Book,
    title: 'Read the Quran',
    description: 'Beautiful Arabic text with authentic Quran fonts, proper Tajweed markers, and elegant ayah separators.'
  },
  {
    icon: Headphones,
    title: 'Listen to Recitations',
    description: 'World-famous reciters including Mishary Alafasy, Abdul Basit, Sudais, and many more.'
  },
  {
    icon: Globe,
    title: '14+ Translations',
    description: 'Read translations in English, Urdu, Hindi, Bengali, Turkish, Indonesian, French, German, and more.'
  },
  {
    icon: GraduationCap,
    title: 'Memorization Mode',
    description: 'Word-by-word highlighting, ayah repetition, and focus mode designed for Hifz practice.'
  },
  {
    icon: Bookmark,
    title: 'Bookmarks & Progress',
    description: 'Save your favorite ayahs, track reading progress, and continue where you left off.'
  },
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Search across Surahs, Ayahs, and translations instantly with real-time results.'
  },
  {
    icon: Moon,
    title: 'Reading Themes',
    description: 'Light, dark, and sepia themes for comfortable reading day or night.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Fully responsive design that works perfectly on mobile, tablet, and desktop.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Your Complete Quran Companion
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to read, listen, understand, and memorize the Holy Quran in one peaceful platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}