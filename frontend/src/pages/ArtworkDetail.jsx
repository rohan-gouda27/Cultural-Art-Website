import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Heart, MapPin, MessageCircle, Star } from 'lucide-react';

export default function ArtworkDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [artwork, setArtwork] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    api.get(`/artworks/${id}`).then(({ data }) => {
      setArtwork(data.artwork);
      setLikeCount(data.artwork?.likeCount || 0);
    }).catch(() => {});
  }, [id]);

  const handleLike = () => {
    if (!isAuthenticated) { toast.error('Log in to like'); return; }
    api.post(`/artworks/${id}/like`).then(({ data }) => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    }).catch(() => {});
  };

  const saveArtwork = () => {
    if (!isAuthenticated) { toast.error('Log in to save'); return; }
    api.post(`/users/save-artwork/${id}`).then(() => toast.success('Saved!')).catch(() => {});
  };

  if (!artwork) return <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>;

  const artist = artwork.artist;
  const artistUserId = artist?.user?._id || artist?.user;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 aspect-square max-h-[600px]">
          <img src={artwork.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'} alt={artwork.title} className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100">{artwork.title}</h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">{artwork.style} {artwork.category && `· ${artwork.category}`}</p>
          <div className="flex items-center gap-4 mt-4">
            <button onClick={handleLike} className="flex items-center gap-2 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
              <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} /> {likeCount}
            </button>
            {isAuthenticated && <button onClick={saveArtwork} className="text-sm font-medium text-primary-600 dark:text-primary-400">Save</button>}
          </div>
          {artwork.price > 0 && <p className="mt-4 text-xl font-semibold text-surface-900 dark:text-surface-100">₹{artwork.price}</p>}
          {artwork.description && <p className="mt-4 text-surface-600 dark:text-surface-400">{artwork.description}</p>}
          {artist && (
            <Link to={`/artists/${artist._id}`} className="mt-6 flex items-center gap-3 card p-4">
              <img src={artist.profileImage || artist.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.displayName || 'A')}`} alt="" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">{artist.displayName}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1"><MapPin className="h-3.5 w-3" /> {artist.city || '—'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
                  <span className="text-sm">{artist.rating?.toFixed(1)}</span>
                </div>
              </div>
              {isAuthenticated && user?.role === 'user' && artistUserId && (
                <Link to={`/messages?to=${artistUserId}`} className="ml-auto btn-primary text-sm flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> Message
                </Link>
              )}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
