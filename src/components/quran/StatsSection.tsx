const stats = [
  { value: '114', label: 'Surahs' },
  { value: '6,236', label: 'Ayahs' },
  { value: '30', label: 'Juz (Para)' },
  { value: '14+', label: 'Translations' },
  { value: '8+', label: 'Reciters' },
  { value: '∞', label: 'Blessings' },
];

export default function StatsSection() {
  return (
    <section className="py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center p-6 rounded-2xl bg-card border border-border animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}