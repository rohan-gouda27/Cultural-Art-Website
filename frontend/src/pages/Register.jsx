import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Palette, Mail, Lock, User } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created!');
      navigate(role === 'artist' ? '/artist-dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-display font-semibold text-center text-surface-900 dark:text-surface-100">Create account</h1>
          <p className="mt-1 text-center text-sm text-surface-500 dark:text-surface-400">Join as a user or artist</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" placeholder="Your name" required />
              </div>
            </div>
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="Min 6 characters" minLength={6} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">I am a</label>
              <div className="mt-2 flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} className="text-primary-600" />
                  <span>User (discover & request art)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="radio" name="role" value="artist" checked={role === 'artist'} onChange={() => setRole('artist')} className="text-primary-600" />
                  <span>Artist</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
