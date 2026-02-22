import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { MapPin } from 'lucide-react';

export default function PopularInCity() {
  const [artists, setArtists] = useState([]);
  const [city, setCity] = useState('');

  useEffect(() => {
    const params = city ? { city } : {};
    api.get('/artists/nearby', { params }).then(({ data }) => setArtists(data.artists || [])).catch(() => setArtists([]));
  }, [city]);

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-surface-900 border-y border-surface-100 dark:border-surface-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl">Popular in your city</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400">Discover artists near you</p>
        <div className="mt-4 flex gap-2">
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city (e.g. Mumbai, Delhi)" className="input-field max-w-xs" />
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {artists.slice(0, 8).map((a) => (
            <Link to={`/artists/${a._id}`} key={a._id} className="card overflow-hidden group">
              <div className="aspect-square bg-surface-100 dark:bg-surface-800">
                <img src={a.profileImage || a.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.displayName || 'A')}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{a.displayName}</h3>
                <p className="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400"><MapPin className="h-3.5 w-3" /> {a.city || '—'}</p>
              </div>
            </Link>
          ))}
        </div>
        {artists.length === 0 && !city && (
          <div className="text-center py-12 text-surface-500 dark:text-surface-400">Enter a city to see nearby artists, or we'll show featured artists.</div>
        )}
      </div>
    </section>
  );
}
