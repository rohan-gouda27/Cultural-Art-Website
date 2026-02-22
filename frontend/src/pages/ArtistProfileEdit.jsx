import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ArtistProfileEdit() {
  const navigate = useNavigate();
  const { artist: authArtist } = useAuth();
  const [form, setForm] = useState({ displayName: '', bio: '', artStyles: '', city: '' });

  useEffect(() => {
    api.get('/artists/me/profile').then(({ data }) => {
      const a = data.artist;
      setForm({
        displayName: a?.displayName || '',
        bio: a?.bio || '',
        artStyles: (a?.artStyles || []).join(', '),
        city: a?.city || '',
      });
    }).catch(() => navigate('/artist-dashboard'));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/artists/me/profile', {
        ...form,
        artStyles: form.artStyles.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.success('Profile updated');
      navigate('/artist-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100">Edit artist profile</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Display name</label>
          <input type="text" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} className="input-field mt-1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} className="input-field mt-1 min-h-[100px]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Art styles (comma-separated)</label>
          <input type="text" value={form.artStyles} onChange={(e) => setForm((f) => ({ ...f, artStyles: e.target.value }))} className="input-field mt-1" placeholder="e.g. Mandala, Portrait, Wall painting" />
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">City</label>
          <input type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-field mt-1" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" onClick={() => navigate('/artist-dashboard')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
