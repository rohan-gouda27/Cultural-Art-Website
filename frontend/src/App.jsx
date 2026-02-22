import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import ArtworkDetail from './pages/ArtworkDetail';
import UserDashboard from './pages/UserDashboard';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistProfileEdit from './pages/ArtistProfileEdit';
import Messages from './pages/Messages';
import AdminPanel from './pages/AdminPanel';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="artists" element={<Artists />} />
          <Route path="artists/:id" element={<ArtistProfile />} />
          <Route path="artworks/:id" element={<ArtworkDetail />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="artist-dashboard"
            element={
              <ProtectedRoute roles={['artist']}>
                <ArtistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="artist-dashboard/profile"
            element={
              <ProtectedRoute roles={['artist']}>
                <ArtistProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
