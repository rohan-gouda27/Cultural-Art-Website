import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { TrendingUp, Heart, ShoppingBag } from 'lucide-react';

const STYLES = [
  { name: 'Mandala', slug: 'mandala' },
  { name: 'Portrait', slug: 'portrait' },
  { name: 'Wall painting', slug: 'wall-painting' },
  { name: 'Digital art', slug: 'digital-art' },
  { name: 'Traditional art', slug: 'traditional' },
];

export default function TrendingStyles() {
  const [artworks, setArtworks] = useState([]);
  const [filter, setFilter] = useState('recent');

  useEffect(() => {
    api.get(`/artworks?sort=${filter === 'likes' ? 'likes' : filter === 'orders' ? 'orders' : 'recent'}&limit=10`)
      .then(({ data }) => setArtworks(data.artworks || []))
      .catch(() => {});
  }, [filter]);

  return (
    <section className="py-16 sm:py-20 bg-surface-50 dark:bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl">Trending styles</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400">Browse by category</p>
        <div className="flex flex-wrap gap-2 mt-6">
          {STYLES.map((s) => (
            <Link key={s.slug} to={`/artists?style=${s.slug}`} className="rounded-xl border border-surface-200 bg-white px-4 py-2 text-sm font-medium text-surface-700 hover:border-primary-300 hover:bg-primary-50 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-200 dark:hover:border-primary-600 dark:hover:bg-primary-900/20">
              {s.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          {[
            { id: 'recent', label: 'Trending', icon: TrendingUp },
            { id: 'likes', label: 'Most liked', icon: Heart },
            { id: 'orders', label: 'Most ordered', icon: ShoppingBag },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${filter === f.id ? 'bg-primary-500 text-white' : 'bg-white border border-surface-200 text-surface-600 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-300'}`}
            >
              <f.icon className="h-4 w-4" /> {f.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
          {artworks.slice(0, 10).map((a) => (
            <Link to={`/artworks/${a._id}`} key={a._id} className="card overflow-hidden group">
              <div className="aspect-square bg-surface-100 dark:bg-surface-800">
                <img src={a.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-3">
                <p className="font-medium text-surface-900 dark:text-surface-100 truncate text-sm">{a.title}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400">{a.style}</p>
              </div>
            </Link>
          ))}
        </div>
        {artworks.length === 0 && (
          <div className="text-center py-12 text-surface-500 dark:text-surface-400">No artworks yet.</div>
        )}
      </div>
    </section>
  );
}
