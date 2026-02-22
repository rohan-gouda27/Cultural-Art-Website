import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Palette, Sun, Moon, User, LayoutDashboard, MessageCircle, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-lg dark:border-surface-800 dark:bg-surface-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-primary-600 dark:text-primary-400">
            <Palette className="h-7 w-7" />
            Cultural Art
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400">Home</Link>
            <Link to="/artists" className="text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400">Artists</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400">Dashboard</Link>
                {user?.role === 'artist' && (
                  <Link to="/artist-dashboard" className="text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400">Artist Hub</Link>
                )}
                <Link to="/messages" className="flex items-center gap-1 text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400">
                  <MessageCircle className="h-4 w-4" /> Messages
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-surface-600 hover:text-primary-600 dark:text-surface-300 dark:hover:text-primary-400">Admin</Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 dark:text-surface-400"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 dark:border-surface-700 dark:bg-surface-800">
                  <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}`} alt="" className="h-8 w-8 rounded-full object-cover" />
                  <span className="hidden sm:inline text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-surface-200 bg-white py-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition dark:border-surface-700 dark:bg-surface-800">
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700" onClick={() => setMobileOpen(false)}> <LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                  <Link to="/messages" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700"> <MessageCircle className="h-4 w-4" /> Messages</Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-surface-50 dark:hover:bg-surface-700"> <LogOut className="h-4 w-4" /> Logout</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">Sign up</Link>
              </div>
            )}
            <button className="md:hidden rounded-lg p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-surface-200 bg-white px-4 py-3 dark:border-surface-800 dark:bg-surface-900 md:hidden">
            <Link to="/" className="block py-2" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/artists" className="block py-2" onClick={() => setMobileOpen(false)}>Artists</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="block py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                {user?.role === 'artist' && <Link to="/artist-dashboard" className="block py-2" onClick={() => setMobileOpen(false)}>Artist Hub</Link>}
                <Link to="/messages" className="block py-2" onClick={() => setMobileOpen(false)}>Messages</Link>
                {user?.role === 'admin' && <Link to="/admin" className="block py-2" onClick={() => setMobileOpen(false)}>Admin</Link>}
              </>
            )}
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-surface-200 bg-surface-100 py-12 dark:border-surface-800 dark:bg-surface-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-primary-600 dark:text-primary-400">
              <Palette className="h-6 w-6" /> Cultural Art
            </div>
            <div className="flex gap-8 text-sm text-surface-600 dark:text-surface-400">
              <Link to="/artists" className="hover:text-primary-600 dark:hover:text-primary-400">Artists</Link>
              <a href="#support" className="hover:text-primary-600 dark:hover:text-primary-400">Support Artisans</a>
              <a href="#about" className="hover:text-primary-600 dark:hover:text-primary-400">About</a>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">© {new Date().getFullYear()} Cultural Art Discovery & Marketplace. Connect with local artists.</p>
        </div>
      </footer>
    </div>
  );
}
