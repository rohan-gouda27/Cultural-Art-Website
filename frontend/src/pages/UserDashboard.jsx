import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Bookmark, FileText, MessageCircle, Package, Star, Sparkles, Upload, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const [saved, setSaved] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    api.get('/users/saved-artworks').then(({ data }) => setSaved(data.artworks || [])).catch(() => {});
    api.get('/custom-requests/my').then(({ data }) => setRequests(data.requests || [])).catch(() => {});
    api.get('/reviews/my').then(({ data }) => setReviews(data.reviews || [])).catch(() => {});
  }, []);

  const handleAiSuggest = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiLoading(true);
    setAiSuggestion(null);
    const fd = new FormData();
    fd.append('image', file);
    api.post('/ai/suggest-style', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(({ data }) => {
        setAiSuggestion(data);
        toast.success('Style suggested!');
      })
      .catch(() => toast.error('Could not analyze image'))
      .finally(() => setAiLoading(false));
  };

  const statusColor = (s) => ({ pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', 'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', completed: 'bg-surface-200 text-surface-800 dark:bg-surface-700 dark:text-surface-200' }[s] || 'bg-surface-100 text-surface-700');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100">My dashboard</h1>
      <p className="mt-1 text-surface-600 dark:text-surface-400">Saved artworks, requests, and reviews</p>

      <section className="mt-8 card p-4 flex flex-wrap items-center gap-4">
        <Lightbulb className="h-8 w-8 text-amber-500" />
        <div>
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">AI style suggestion</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400">Upload an image to get a suggested art style (e.g. portrait, mandala, sketch).</p>
        </div>
        <label className="btn-secondary cursor-pointer flex items-center gap-2">
          <Upload className="h-4 w-4" /> {aiLoading ? 'Analyzing...' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleAiSuggest} disabled={aiLoading} />
        </label>
        {aiSuggestion && (
          <div className="w-full mt-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20">
            <p className="font-medium text-surface-900 dark:text-surface-100">Suggested: {aiSuggestion.suggested}</p>
            {aiSuggestion.alternatives?.length > 0 && <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Also consider: {aiSuggestion.alternatives.join(', ')}</p>}
          </div>
        )}
      </section>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-surface-900 dark:text-surface-100 mb-4">
            <Bookmark className="h-5 w-5 text-primary-500" /> Saved artworks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {saved.slice(0, 6).map((a) => (
              <Link to={`/artworks/${a._id}`} key={a._id} className="card overflow-hidden group">
                <div className="aspect-square bg-surface-100 dark:bg-surface-800">
                  <img src={a.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <p className="p-2 text-sm font-medium truncate">{a.title}</p>
              </Link>
            ))}
          </div>
          {saved.length === 0 && <p className="text-surface-500 dark:text-surface-400 py-4">No saved artworks yet.</p>}
        </section>

        <section>
          <h2 className="flex items-center gap-2 font-semibold text-surface-900 dark:text-surface-100 mb-4">
            <FileText className="h-5 w-5 text-primary-500" /> My requests
          </h2>
          <div className="space-y-3">
            {requests.slice(0, 5).map((r) => (
              <div key={r._id} className="card p-3">
                <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{r.artType} · ₹{r.budget}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
              </div>
            ))}
            {requests.length === 0 && <p className="text-surface-500 dark:text-surface-400 text-sm">No requests yet.</p>}
          </div>
          <Link to="/#request" className="mt-3 btn-primary text-sm inline-flex">Request custom art</Link>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-semibold text-surface-900 dark:text-surface-100 mb-4">
          <Star className="h-5 w-5 text-amber-500" /> Reviews I gave
        </h2>
        <div className="space-y-3">
          {reviews.slice(0, 5).map((r) => (
            <div key={r._id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">{r.artist?.displayName}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{r.comment}</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400' : 'text-surface-200'}`} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-surface-500 dark:text-surface-400">No reviews yet.</p>}
        </div>
      </section>

      <div className="mt-8 flex gap-3">
        <Link to="/messages" className="btn-primary flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> Messages
        </Link>
        <Link to="/#request" className="btn-secondary flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Request custom art
        </Link>
      </div>
    </div>
  );
}
