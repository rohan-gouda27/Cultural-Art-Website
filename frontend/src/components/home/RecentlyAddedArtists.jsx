import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RecentlyAddedArtists() {
  const [artists, setArtists] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    api.get('/artists?sort=recent&limit=8').then(({ data }) => setArtists(data.artists || [])).catch(() => {});
  }, []);

  const follow = (e, id) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    api.post(`/users/follow-artist/${id}`).then(() => {}).catch(() => {});
  };

  return (
    <section className="py-16 sm:py-20 bg-surface-50 dark:bg-surface-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl">Recently added artists</h2>
        <p className="mt-1 text-surface-600 dark:text-surface-400">New faces on the platform</p>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {artists.map((a) => (
            <Link to={`/artists/${a._id}`} key={a._id} className="card p-4 text-center group hover:shadow-lg transition">
              <img src={a.profileImage || a.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.displayName || 'A')}`} alt="" className="w-20 h-20 rounded-full object-cover mx-auto group-hover:ring-2 ring-primary-400" />
              <h3 className="mt-3 font-medium text-surface-900 dark:text-surface-100 truncate">{a.displayName}</h3>
              <p className="flex items-center justify-center gap-1 text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                <MapPin className="h-3.5 w-3" /> {a.city || '—'}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{a.artStyles?.slice(0, 2).join(', ') || 'Various'}</p>
              {isAuthenticated && (
                <button onClick={(e) => follow(e, a._id)} className="mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-lg border border-surface-200 dark:border-surface-700 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                  <UserPlus className="h-4 w-4" /> Follow
                </button>
              )}
            </Link>
          ))}
        </div>
        {artists.length === 0 && (
          <div className="text-center py-12 text-surface-500 dark:text-surface-400">No artists yet.</div>
        )}
      </div>
    </section>
  );
}
