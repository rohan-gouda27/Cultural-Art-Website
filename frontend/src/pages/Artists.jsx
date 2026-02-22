import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { MapPin, Star, Search } from 'lucide-react';

export default function Artists() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const style = searchParams.get('style') || '';
  const city = searchParams.get('city') || '';
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('recent');
  const [searchCity, setSearchCity] = useState(city);
  const [searchStyle, setSearchStyle] = useState(style);

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 24 };
    if (searchCity) params.city = searchCity;
    if (searchStyle) params.style = searchStyle;
    api.get('/artists', { params }).then(({ data }) => {
      let list = data.artists || [];
      if (q) list = list.filter((a) => (a.displayName + ' ' + (a.artStyles || []).join(' ') + ' ' + (a.city || '')).toLowerCase().includes(q.toLowerCase()));
      setArtists(list);
    }).catch(() => setArtists([])).finally(() => setLoading(false));
  }, [sort, searchCity, searchStyle, q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl">Artists</h1>
      <p className="mt-1 text-surface-600 dark:text-surface-400">Discover and connect with local artists</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input type="text" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} placeholder="City" className="input-field pl-9 w-40" />
        </div>
        <input type="text" value={searchStyle} onChange={(e) => setSearchStyle(e.target.value)} placeholder="Style" className="input-field w-40" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-40">
          <option value="recent">Recent</option>
          <option value="rating">Top rated</option>
          <option value="followers">Most followers</option>
        </select>
      </div>
      {loading ? (
        <div className="mt-10 text-center text-surface-500 dark:text-surface-400">Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artists.map((a) => (
            <Link to={`/artists/${a._id}`} key={a._id} className="card overflow-hidden group hover:shadow-lg transition">
              <div className="aspect-[4/3] bg-surface-100 dark:bg-surface-800">
                <img src={a.profileImage || a.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.displayName || 'A')}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-surface-900 dark:text-surface-100">{a.displayName}</h2>
                <p className="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400 mt-0.5"><MapPin className="h-3.5 w-3" /> {a.city || '—'}</p>
                <p className="text-sm text-surface-600 dark:text-surface-300 mt-1">{a.artStyles?.slice(0, 3).join(', ') || 'Various'}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
                  <span className="text-sm font-medium">{a.rating?.toFixed(1) || '—'}</span>
                  <span className="text-sm text-surface-500">({a.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && artists.length === 0 && (
        <div className="mt-10 text-center text-surface-500 dark:text-surface-400">No artists found.</div>
      )}
    </div>
  );
}
