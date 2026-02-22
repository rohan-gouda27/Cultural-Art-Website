import { useState } from 'react';

const SLIDES = [
  { before: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600', after: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600', title: 'Wall transformation' },
  { before: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600', after: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=600', title: 'Portrait to art' },
  { before: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600', after: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600', title: 'Digital makeover' },
];

export default function BeforeAfterGallery() {
  const [index, setIndex] = useState(0);
  const s = SLIDES[index];

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-surface-900 border-y border-surface-100 dark:border-surface-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl text-center">Before & after</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400 text-center">See how art transforms spaces</p>
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
              <p className="text-center text-sm font-medium text-surface-500 dark:text-surface-400 py-2 bg-surface-50 dark:bg-surface-800">Before</p>
              <img src={s.before} alt="Before" className="w-full aspect-video object-cover" />
            </div>
            <div className="rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700">
              <p className="text-center text-sm font-medium text-surface-500 dark:text-surface-400 py-2 bg-surface-50 dark:bg-surface-800">After</p>
              <img src={s.after} alt="After" className="w-full aspect-video object-cover" />
            </div>
          </div>
          <p className="text-center font-medium text-surface-700 dark:text-surface-300 mt-3">{s.title}</p>
          <div className="flex justify-center gap-2 mt-4">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition ${i === index ? 'w-6 bg-primary-500' : 'w-2 bg-surface-300 dark:bg-surface-600'}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
