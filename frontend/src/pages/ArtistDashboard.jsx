import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Upload, FolderOpen, DollarSign, MessageCircle, User, ImagePlus, X } from 'lucide-react';

export default function ArtistDashboard() {
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [liveProjects, setLiveProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showUploadArt, setShowUploadArt] = useState(false);
  const [showLiveProject, setShowLiveProject] = useState(false);
  const [formArt, setFormArt] = useState({ title: '', description: '', style: 'Other', category: 'other', price: '', images: null });
  const [formLive, setFormLive] = useState({ title: '', description: '', status: 'sketch', progress: 0, images: null });

  useEffect(() => {
    api.get('/artists/me/profile').then(({ data }) => setArtist(data.artist)).catch(() => {});
    api.get('/artworks').then(({ data }) => setArtworks(data.artworks || [])).catch(() => {});
    api.get('/live-projects').then(({ data }) => setLiveProjects(data.projects || [])).catch(() => {});
    api.get('/custom-requests/artist').then(({ data }) => setRequests(data.requests || [])).catch(() => {});
  }, []);
  const myArtistId = artist?._id;

  const myArtworks = artworks.filter((a) => String(a.artist?._id) === String(myArtistId));
  const myLiveProjects = liveProjects.filter((p) => String(p.artist?._id) === String(myArtistId));

  const submitArtwork = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', formArt.title);
    fd.append('description', formArt.description);
    fd.append('style', formArt.style);
    fd.append('category', formArt.category);
    fd.append('price', formArt.price);
    if (formArt.images) for (const f of formArt.images) fd.append('images', f);
    try {
      await api.post('/artworks', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Artwork uploaded!');
      setShowUploadArt(false);
      setFormArt({ title: '', description: '', style: 'Other', category: 'other', price: '', images: null });
      api.get('/artworks').then(({ data }) => setArtworks(data.artworks || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  const submitLiveProject = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', formLive.title);
    fd.append('description', formLive.description);
    fd.append('status', formLive.status);
    fd.append('progress', formLive.progress);
    if (formLive.images) for (const f of formLive.images) fd.append('images', f);
    try {
      await api.post('/live-projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Live project added!');
      setShowLiveProject(false);
      setFormLive({ title: '', description: '', status: 'sketch', progress: 0, images: null });
      api.get('/live-projects').then(({ data }) => setLiveProjects(data.projects || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const acceptRequest = async (reqId) => {
    try {
      await api.post(`/custom-requests/${reqId}/accept`, { finalPrice: 0 });
      toast.success('Request accepted');
      api.get('/custom-requests/artist').then(({ data }) => setRequests(data.requests || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const rejectRequest = async (reqId) => {
    try {
      await api.post(`/custom-requests/${reqId}/reject`);
      toast.success('Request rejected');
      api.get('/custom-requests/artist').then(({ data }) => setRequests(data.requests || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100">Artist dashboard</h1>
      <p className="mt-1 text-surface-600 dark:text-surface-400">Manage your artworks, live projects, and orders</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <ImagePlus className="h-8 w-8 text-primary-500 mb-2" />
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">{myArtworks.length}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Artworks</p>
        </div>
        <div className="card p-4">
          <FolderOpen className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">{myLiveProjects.length}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Live projects</p>
        </div>
        <div className="card p-4">
          <DollarSign className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-semibold text-surface-900 dark:text-surface-100">₹{artist?.totalEarnings || 0}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Earnings</p>
        </div>
        <div className="card p-4">
          <MessageCircle className="h-8 w-8 text-blue-500 mb-2" />
          <Link to="/messages" className="text-primary-600 dark:text-primary-400 font-medium text-sm">Messages</Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => setShowUploadArt(true)} className="btn-primary flex items-center gap-2">
          <Upload className="h-4 w-4" /> Upload artwork
        </button>
        <button onClick={() => setShowLiveProject(true)} className="btn-secondary flex items-center gap-2">
          <ImagePlus className="h-4 w-4" /> Add live project
        </button>
        <Link to="/artist-dashboard/profile" className="btn-secondary text-sm">Edit profile</Link>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">Custom requests</h2>
        <div className="space-y-3">
          {requests.filter((r) => r.status === 'pending').map((r) => (
            <div key={r._id} className="card p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">{r.artType} · ₹{r.budget}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{r.description?.slice(0, 80)}...</p>
                <p className="text-xs text-surface-500 mt-1">from {r.user?.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptRequest(r._id)} className="btn-primary text-sm">Accept</button>
                <button onClick={() => rejectRequest(r._id)} className="btn-secondary text-sm">Reject</button>
              </div>
            </div>
          ))}
          {requests.filter((r) => r.status === 'pending').length === 0 && <p className="text-surface-500 dark:text-surface-400">No pending requests.</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-surface-900 dark:text-surface-100 mb-4">My artworks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {myArtworks.map((a) => (
            <div key={a._id} className="card overflow-hidden">
              <img src={a.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400'} alt="" className="w-full aspect-square object-cover" />
              <p className="p-2 text-sm font-medium truncate">{a.title}</p>
            </div>
          ))}
        </div>
      </section>

      {showUploadArt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowUploadArt(false)}>
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b dark:border-surface-700">
              <h3 className="font-semibold">Upload artwork</h3>
              <button onClick={() => setShowUploadArt(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submitArtwork} className="p-4 space-y-4">
              <input type="text" value={formArt.title} onChange={(e) => setFormArt((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Title" required />
              <textarea value={formArt.description} onChange={(e) => setFormArt((f) => ({ ...f, description: e.target.value }))} className="input-field min-h-[80px]" placeholder="Description" />
              <input type="text" value={formArt.style} onChange={(e) => setFormArt((f) => ({ ...f, style: e.target.value }))} className="input-field" placeholder="Style" />
              <select value={formArt.category} onChange={(e) => setFormArt((f) => ({ ...f, category: e.target.value }))} className="input-field">
                <option value="mandala">Mandala</option>
                <option value="portrait">Portrait</option>
                <option value="wall-painting">Wall painting</option>
                <option value="digital-art">Digital art</option>
                <option value="traditional">Traditional</option>
                <option value="other">Other</option>
              </select>
              <input type="number" value={formArt.price} onChange={(e) => setFormArt((f) => ({ ...f, price: e.target.value }))} className="input-field" placeholder="Price (₹)" />
              <input type="file" accept="image/*" multiple onChange={(e) => setFormArt((f) => ({ ...f, images: Array.from(e.target.files || []) }))} className="text-sm" />
              <button type="submit" className="btn-primary w-full">Upload</button>
            </form>
          </div>
        </div>
      )}

      {showLiveProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLiveProject(false)}>
          <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b dark:border-surface-700">
              <h3 className="font-semibold">Add live project</h3>
              <button onClick={() => setShowLiveProject(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submitLiveProject} className="p-4 space-y-4">
              <input type="text" value={formLive.title} onChange={(e) => setFormLive((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Title" required />
              <textarea value={formLive.description} onChange={(e) => setFormLive((f) => ({ ...f, description: e.target.value }))} className="input-field min-h-[80px]" placeholder="Description" />
              <select value={formLive.status} onChange={(e) => setFormLive((f) => ({ ...f, status: e.target.value }))} className="input-field">
                <option value="sketch">Sketch</option>
                <option value="in-progress">In progress</option>
                <option value="final">Final</option>
              </select>
              <input type="number" min="0" max="100" value={formLive.progress} onChange={(e) => setFormLive((f) => ({ ...f, progress: e.target.value }))} className="input-field" placeholder="Progress %" />
              <input type="file" accept="image/*" multiple onChange={(e) => setFormLive((f) => ({ ...f, images: Array.from(e.target.files || []) }))} className="text-sm" />
              <button type="submit" className="btn-primary w-full">Add project</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
