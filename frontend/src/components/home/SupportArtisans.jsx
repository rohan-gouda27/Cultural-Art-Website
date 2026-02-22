import { Heart, ShoppingBag, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SupportArtisans() {
  return (
    <section id="support" className="py-16 sm:py-20 bg-surface-50 dark:bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl text-center">Support local artisans</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400 text-center">Ways to make a difference</p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-6 text-center">
            <div className="inline-flex rounded-2xl bg-red-100 dark:bg-red-900/30 p-4">
              <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mt-4 font-semibold text-surface-900 dark:text-surface-100">Donate</h3>
            <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">Support rural artist funds and community programs.</p>
            <button className="mt-4 btn-secondary text-sm">Coming soon</button>
          </div>
          <div className="card p-6 text-center">
            <div className="inline-flex rounded-2xl bg-primary-100 dark:bg-primary-900/30 p-4">
              <ShoppingBag className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="mt-4 font-semibold text-surface-900 dark:text-surface-100">Buy handmade</h3>
            <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">Purchase directly from artists and craftspeople.</p>
            <Link to="/artists" className="mt-4 btn-primary text-sm inline-block">Browse artists</Link>
          </div>
          <div className="card p-6 text-center">
            <div className="inline-flex rounded-2xl bg-amber-100 dark:bg-amber-900/30 p-4">
              <Megaphone className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="mt-4 font-semibold text-surface-900 dark:text-surface-100">Promote rural artists</h3>
            <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">Share their work and help them reach more people.</p>
            <Link to="/artists" className="mt-4 btn-secondary text-sm inline-block">Discover artists</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
