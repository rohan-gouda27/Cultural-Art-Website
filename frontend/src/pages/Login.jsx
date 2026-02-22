import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Palette, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data?.user?.role === 'artist' ? '/artist-dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="card p-8 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="rounded-2xl bg-primary-100 p-4 dark:bg-primary-900/30">
              <Palette className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-semibold text-center text-surface-900 dark:text-surface-100">Log in</h1>
          <p className="mt-1 text-center text-sm text-surface-500 dark:text-surface-400">Access your account</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Don't have an account? <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
