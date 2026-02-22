import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MapPin, Star, MessageCircle, UserPlus, Heart } from 'lucide-react';

export default function ArtistProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', artworkOrdered: '' });

  useEffect(() => {
    api.get(`/artists/${id}`).then(({ data }) => {
      setArtist(data.artist);
      setArtworks(data.artworks || []);
      setReviews(data.reviews || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const follow = () => {
    if (!isAuthenticated) { toast.error('Log in to follow'); return; }
    api.post(`/users/follow-artist/${id}`).then(() => toast.success('Followed!')).catch(() => {});
  };

  const openChat = () => {
    if (!isAuthenticated) { toast.error('Log in to message'); return; }
    window.location.href = `/messages?to=${artist?.user?._id}`;
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Log in to review'); return; }
    try {
      await api.post('/reviews', { artistId: id, ...reviewForm });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', artworkOrdered: '' });
      const { data } = await api.get(`/artists/${id}`);
      setReviews(data.reviews || []);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading || !artist) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="card overflow-hidden">
        <div className="h-48 sm:h-64 bg-gradient-to-r from-primary-400 to-amber-400 dark:from-primary-700 dark:to-amber-700" />
        <div className="px-4 sm:px-8 -mt-16 relative">
          <div className="flex flex-col sm:flex-row gap-6">
            <img src={artist.profileImage || artist.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.displayName)}`} alt="" className="w-32 h-32 rounded-2xl border-4 border-white dark:border-surface-800 object-cover shadow-lg" />
            <div className="flex-1 pb-6">
              <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100">{artist.displayName}</h1>
              <p className="flex items-center gap-2 text-surface-600 dark:text-surface-400 mt-1">
                <MapPin className="h-4 w-4" /> {artist.city || '—'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="h-5 w-5 text-amber-400" fill="currentColor" />
                <span className="font-medium">{artist.rating?.toFixed(1) || '—'}</span>
                <span className="text-surface-500">({artist.reviewCount || 0} reviews)</span>
              </div>
              {artist.bio && <p className="mt-4 text-surface-600 dark:text-surface-400">{artist.bio}</p>}
              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">Styles: {artist.artStyles?.join(', ') || '—'}</p>
              {isAuthenticated && user?.role === 'user' && (
                <div className="flex gap-3 mt-4">
                  <button onClick={openChat} className="btn-primary flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> Message
                  </button>
                  <button onClick={follow} className="btn-secondary flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Follow
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="font-display text-xl font-semibold mt-10 mb-4 text-surface-900 dark:text-surface-100">Artworks</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {artworks.map((a) => (
          <Link to={`/artworks/${a._id}`} key={a._id} className="card overflow-hidden group">
            <div className="aspect-square bg-surface-100 dark:bg-surface-800">
              <img src={a.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="p-3">
              <p className="font-medium text-surface-900 dark:text-surface-100 truncate text-sm">{a.title}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">{a.style} · ₹{a.price}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-xl font-semibold mt-10 mb-4 text-surface-900 dark:text-surface-100">Reviews</h2>
      {isAuthenticated && user?.role === 'user' && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button onClick={() => setShowReviewForm(true)} className="btn-secondary text-sm">Write a review</button>
          ) : (
            <form onSubmit={submitReview} className="card p-4 space-y-3 max-w-md">
              <div>
                <label className="block text-sm font-medium">Rating</label>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="input-field mt-1">
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Comment</label>
                <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} className="input-field mt-1 min-h-[80px]" placeholder="Your experience..." />
              </div>
              <div>
                <label className="block text-sm font-medium">Artwork ordered (optional)</label>
                <input type="text" value={reviewForm.artworkOrdered} onChange={(e) => setReviewForm((f) => ({ ...f, artworkOrdered: e.target.value }))} className="input-field mt-1" placeholder="e.g. Custom Portrait" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">Submit review</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
      <div className="space-y-4">
        {reviews.slice(0, 10).map((r) => (
          <div key={r._id} className="card p-4">
            <div className="flex items-center gap-3">
              <img src={r.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || 'U')}`} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">{r.user?.name}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400' : 'text-surface-200 dark:text-surface-600'}`} fill={i < r.rating ? 'currentColor' : 'none'} />)}
                </div>
              </div>
            </div>
            <p className="mt-2 text-surface-600 dark:text-surface-400">{r.comment}</p>
            {r.artworkOrdered && <p className="mt-1 text-sm text-surface-500">Ordered: {r.artworkOrdered}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-surface-500 dark:text-surface-400">No reviews yet.</p>}
      </div>
    </div>
  );
}
