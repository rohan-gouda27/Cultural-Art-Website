import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Hero() {
  const [search, setSearch] = useState('');

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-amber-50/50 dark:from-surface-900 dark:via-surface-900 dark:to-primary-950/20 bg-hero-pattern">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-100 sm:text-5xl md:text-6xl animate-fade-in">
            Discover <span className="text-primary-600 dark:text-primary-400">Cultural Art</span>
            <br />& Connect with Local Artists
          </h1>
          <p className="mt-4 text-lg text-surface-600 dark:text-surface-400">
            Explore traditional and contemporary art, request custom pieces, and support artisans in your community.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/artists" className="btn-primary text-base px-6 py-3 rounded-xl">
              Explore artists
            </Link>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search artists or styles..."
                className="input-field pl-11 w-full sm:w-72 rounded-xl border-surface-200 dark:border-surface-700"
              />
              <Link to={`/artists?q=${encodeURIComponent(search)}`} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-primary-600 dark:text-primary-400">
                Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
