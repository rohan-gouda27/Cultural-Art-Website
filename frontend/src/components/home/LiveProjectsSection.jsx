import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';

export default function LiveProjectsSection() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/live-projects?limit=6').then(({ data }) => setProjects(data.projects || [])).catch(() => {});
  }, []);

  const statusLabel = (s) => ({ sketch: 'Sketch', 'in-progress': 'In progress', final: 'Final', completed: 'Completed' }[s] || s);

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-surface-900 border-y border-surface-100 dark:border-surface-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="font-display text-2xl font-semibold text-surface-900 dark:text-surface-100 sm:text-3xl">Live projects</h2>
            <p className="mt-1 text-surface-600 dark:text-surface-400">Watch artists create in real time</p>
          </div>
          <Link to="/artists" className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((p) => (
            <Link to={`/artists/${p.artist?._id}`} key={p._id} className="card overflow-hidden group hover:shadow-lg transition">
              <div className="aspect-video bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 dark:bg-surface-800/90 px-2.5 py-1 text-xs font-medium text-surface-700 dark:text-surface-200">
                  {statusLabel(p.status)} · {p.progress}%
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">{p.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 truncate">{p.artist?.displayName || 'Artist'}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-surface-500">
                  <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {p.likeCount || 0}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {p.comments?.length || 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {projects.length === 0 && (
          <div className="text-center py-12 text-surface-500 dark:text-surface-400">No live projects yet. Check back soon.</div>
        )}
      </div>
    </section>
  );
}
