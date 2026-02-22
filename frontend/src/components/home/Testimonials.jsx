import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/artists?limit=3').then(({ data }) => {
      const artists = data.artists || [];
      if (artists.length) {
        Promise.all(artists.slice(0, 3).map((a) => api.get(`/reviews/artist/${a._id}`).then((r) => r.data.reviews?.[0] && { ...r.data.reviews[0], artistName: a.displayName }))).then((r) => setReviews(r.filter(Boolean)));
      }
    }).catch(() => {});
  }, []);

  const fallbacks = [
    { user: { name: 'Priya S.', avatar: '' }, rating: 5, comment: 'Got a beautiful custom portrait. The artist understood exactly what I wanted!', artworkOrdered: 'Custom Portrait', artistName: 'Vikram Singh' },
    { user: { name: 'Rahul V.', avatar: '' }, rating: 4, comment: 'Amazing mandala for our living room. Quality and timing were perfect.', artworkOrdered: 'Wall Mandala', artistName: 'Meera Krishnan' },
    { user: { name: 'Anita D.', avatar: '' }, rating: 5, comment: 'Supporting local artists feels great. The mural transformed our café.', artworkOrdered: 'Café Mural', artistName: 'Arjun Nair' },
  ];
  const list = reviews.length ? reviews : fallbacks;

  return (
    <section className="py-16 sm:py-20 bg-surface-50 dark:bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl text-center">Client stories</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400 text-center">What people say about their experience</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.slice(0, 3).map((r, i) => (
            <div key={i} className="card p-6">
              <Quote className="h-10 w-10 text-primary-200 dark:text-primary-800 mb-4" />
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`h-5 w-5 ${j < (r.rating || 5) ? 'text-amber-400' : 'text-surface-200 dark:text-surface-600'}`} fill={j < (r.rating || 5) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-surface-700 dark:text-surface-300">"{r.comment || r.comment}"</p>
              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">Ordered: {r.artworkOrdered || 'Custom art'}</p>
              <div className="mt-4 flex items-center gap-3">
                <img src={r.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || 'U')}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="font-medium text-surface-900 dark:text-surface-100">{r.user?.name || 'Client'}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">by {r.artistName || 'Artist'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
