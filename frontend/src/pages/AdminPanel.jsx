import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, Palette, Image, Shield, Star } from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'users') api.get('/admin/users').then(({ data }) => setUsers(data.users || [])).catch(() => {});
    if (tab === 'artists') api.get('/admin/artists').then(({ data }) => setArtists(data.artists || [])).catch(() => {});
    if (tab === 'artworks') api.get('/admin/artworks').then(({ data }) => setArtworks(data.artworks || [])).catch(() => {});
  }, [tab]);

  const banUser = (id) => {
    api.post(`/admin/users/${id}/ban`).then(() => { toast.success('User banned'); setUsers((u) => u.map((x) => (x._id === id ? { ...x, isBanned: true } : x))); }).catch(() => toast.error('Failed'));
  };
  const unbanUser = (id) => {
    api.post(`/admin/users/${id}/unban`).then(() => { toast.success('User unbanned'); setUsers((u) => u.map((x) => (x._id === id ? { ...x, isBanned: false } : x))); }).catch(() => toast.error('Failed'));
  };
  const featureArtist = (id, featured) => {
    api.put(`/admin/artists/${id}/feature`, { featured }).then(() => { toast.success(featured ? 'Featured' : 'Unfeatured'); setArtists((a) => a.map((x) => (x._id === id ? { ...x, isFeatured: featured } : x))); }).catch(() => toast.error('Failed'));
  };
  const deleteArtwork = (id) => {
    if (!confirm('Delete this artwork?')) return;
    api.delete(`/admin/artworks/${id}`).then(() => { toast.success('Deleted'); setArtworks((a) => a.filter((x) => x._id !== id)); }).catch(() => toast.error('Failed'));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100">Admin panel</h1>
      <p className="mt-1 text-surface-600 dark:text-surface-400">Manage users, artists, and content</p>

      <div className="mt-6 flex gap-2 border-b border-surface-200 dark:border-surface-700">
        {['stats', 'users', 'artists', 'artworks'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-medium rounded-t-lg ${tab === t ? 'bg-primary-500 text-white' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
            {t === 'stats' && <Shield className="inline h-4 w-4 mr-1" />}
            {t === 'users' && <Users className="inline h-4 w-4 mr-1" />}
            {t === 'artists' && <Palette className="inline h-4 w-4 mr-1" />}
            {t === 'artworks' && <Image className="inline h-4 w-4 mr-1" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <Users className="h-8 w-8 text-primary-500 mb-2" />
            <p className="text-2xl font-semibold">{stats.usersCount}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Users</p>
          </div>
          <div className="card p-4">
            <Palette className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-2xl font-semibold">{stats.artistsCount}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Artists</p>
          </div>
          <div className="card p-4">
            <Image className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-semibold">{stats.artworksCount}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Artworks</p>
          </div>
          <div className="card p-4">
            <Star className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-semibold">{stats.requestsCount}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400">Requests</p>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">Email</th>
                <th className="text-left py-3 px-2">Role</th>
                <th className="text-left py-3 px-2">Status</th>
                <th className="text-left py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="py-3 px-2">{u.name}</td>
                  <td className="py-3 px-2">{u.email}</td>
                  <td className="py-3 px-2">{u.role}</td>
                  <td className="py-3 px-2">{u.isBanned ? 'Banned' : 'Active'}</td>
                  <td className="py-3 px-2">
                    {u.role !== 'admin' && (u.isBanned ? <button onClick={() => unbanUser(u._id)} className="text-green-600 dark:text-green-400 text-sm">Unban</button> : <button onClick={() => banUser(u._id)} className="text-red-600 dark:text-red-400 text-sm">Ban</button>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'artists' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="text-left py-3 px-2">Name</th>
                <th className="text-left py-3 px-2">City</th>
                <th className="text-left py-3 px-2">Featured</th>
                <th className="text-left py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((a) => (
                <tr key={a._id} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="py-3 px-2">{a.displayName}</td>
                  <td className="py-3 px-2">{a.city}</td>
                  <td className="py-3 px-2">{a.isFeatured ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-2">
                    <button onClick={() => featureArtist(a._id, !a.isFeatured)} className="text-primary-600 dark:text-primary-400 text-sm">{a.isFeatured ? 'Unfeature' : 'Feature'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'artworks' && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {artworks.map((a) => (
            <div key={a._id} className="card overflow-hidden">
              <img src={a.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200'} alt="" className="w-full aspect-square object-cover" />
              <p className="p-2 text-xs font-medium truncate">{a.title}</p>
              <button onClick={() => deleteArtwork(a._id)} className="w-full py-1 text-xs text-red-600 dark:text-red-400">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
