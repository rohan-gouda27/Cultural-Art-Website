import { Palette, Heart, Users, Sparkles } from 'lucide-react';

const ITEMS = [
  { icon: Palette, title: 'Preserve heritage', text: 'Traditional art forms carry generations of stories and skills. Supporting them keeps culture alive.' },
  { icon: Heart, title: 'Support livelihoods', text: 'Many artisans depend on their craft. Your purchase directly supports families and communities.' },
  { icon: Users, title: 'Connect locally', text: 'Meet artists in your city, commission custom work, and build lasting relationships.' },
  { icon: Sparkles, title: 'Unique pieces', text: 'Every piece is one-of-a-kind. No mass production—just authentic, handmade art.' },
];

export default function WhyCulturalArt() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-surface-900 border-y border-surface-100 dark:border-surface-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl text-center">Why cultural art matters</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400 text-center max-w-2xl mx-auto">A short story about the impact of supporting local art</p>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ITEMS.map((item) => (
            <div key={item.title} className="text-center">
              <div className="inline-flex rounded-2xl bg-primary-100 dark:bg-primary-900/30 p-4">
                <item.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="mt-4 font-semibold text-surface-900 dark:text-surface-100">{item.title}</h3>
              <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
