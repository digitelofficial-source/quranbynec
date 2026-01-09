import { Heart, BookOpen, Star } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-16 rounded-3xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border/50 islamic-pattern">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Decorative Bismillah */}
        <div className="mb-8">
          <p className="bismillah text-3xl md:text-4xl mb-4">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-muted-foreground text-sm">
            In the name of Allah, the Most Gracious, the Most Merciful
          </p>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          About This Platform
        </h2>
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
          This Quran platform is built with love and dedication to serve Muslims worldwide. 
          Our mission is to make the Holy Quran accessible to everyone, everywhere, 
          in a peaceful and distraction-free environment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="flex flex-col items-center p-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Read with Ease</h3>
            <p className="text-sm text-muted-foreground text-center">
              Beautiful Arabic typography with adjustable font sizes and comfortable reading modes 
              for extended study sessions.
            </p>
          </div>

          <div className="flex flex-col items-center p-6">
            <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Heart className="h-7 w-7 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Built with Love</h3>
            <p className="text-sm text-muted-foreground text-center">
              Created as a service to the Ummah, this platform is completely free to use 
              with no ads, no distractions, just the Quran.
            </p>
          </div>

          <div className="flex flex-col items-center p-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">World-Class Quality</h3>
            <p className="text-sm text-muted-foreground text-center">
              Authentic Quran text, verified translations, and high-quality audio 
              from renowned reciters around the world.
            </p>
          </div>
        </div>

        {/* Quran Quote */}
        <div className="mt-12 p-6 rounded-2xl bg-card/50 border border-border/50 max-w-2xl mx-auto">
          <p className="font-quran text-xl md:text-2xl text-foreground leading-loose mb-4" dir="rtl">
            إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ
          </p>
          <p className="text-muted-foreground italic">
            "Indeed, it is We who sent down the Quran and indeed, We will be its guardian."
          </p>
          <p className="text-sm text-muted-foreground mt-2">— Surah Al-Hijr (15:9)</p>
        </div>
      </div>
    </section>
  );
}