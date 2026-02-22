import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { X, Upload } from 'lucide-react';

const ART_TYPES = ['Portrait', 'Mandala', 'Wall painting', 'Digital art', 'Sketch', 'Traditional', 'Other'];

export default function CustomRequestSection({ openRequest, preselectedArtistId }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [artists, setArtists] = useState([]);
  const [form, setForm] = useState({
    artType: 'Portrait',
    budget: '',
    deadline: '',
    description: '',
    artistId: preselectedArtistId || '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/artists?limit=50').then(({ data }) => setArtists(data.artists || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (openRequest && preselectedArtistId) {
      setOpen(true);
      setForm((f) => ({ ...f, artistId: preselectedArtistId }));
    }
  }, [openRequest, preselectedArtistId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a request');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('artType', form.artType);
      fd.append('budget', form.budget);
      fd.append('deadline', form.deadline);
      fd.append('description', form.description);
      if (form.artistId) fd.append('artistId', form.artistId);
      files.forEach((f) => fd.append('images', f));
      await api.post('/custom-requests', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Request submitted! Artists can now accept it.');
      setOpen(false);
      setForm({ artType: 'Portrait', budget: '', deadline: '', description: '', artistId: '' });
      setFiles([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="request" className="py-16 sm:py-20 bg-primary-600 dark:bg-primary-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Want something unique?</h2>
        <p className="mt-2 text-primary-100 max-w-xl mx-auto">Request custom artwork—describe your idea, budget, and deadline. Our artists will respond.</p>
        <button onClick={() => setOpen(true)} className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-medium text-primary-600 hover:bg-primary-50 transition">
          Request custom artwork
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-surface-200 dark:border-surface-700">
              <h3 className="font-display text-lg font-semibold">Custom art request</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Art type</label>
                <select value={form.artType} onChange={(e) => setForm((f) => ({ ...f, artType: e.target.value }))} className="input-field mt-1" required>
                  {ART_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Budget (₹)</label>
                <input type="number" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} className="input-field mt-1" placeholder="3000" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="input-field mt-1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field mt-1 min-h-[100px]" placeholder="Describe your idea..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Preferred artist (optional)</label>
                <select value={form.artistId} onChange={(e) => setForm((f) => ({ ...f, artistId: e.target.value }))} className="input-field mt-1">
                  <option value="">Any artist</option>
                  {artists.map((a) => <option key={a._id} value={a._id}>{a.displayName} — {a.city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Reference images (optional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="mt-1 text-sm" />
                {files.length > 0 && <p className="text-xs text-surface-500 mt-1">{files.length} file(s) selected</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Submitting...' : 'Submit request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
