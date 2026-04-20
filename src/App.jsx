import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import AddWebsiteModal from './components/modals/AddWebsiteModal';
import Login from './pages/Login';
import Home from './pages/Home';
import Websites from './pages/Websites';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout onAddWebsite={() => setIsAddModalOpen(true)}>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/websites"
          element={
            <ProtectedRoute>
              <AppLayout onAddWebsite={() => setIsAddModalOpen(true)}>
                <Websites />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
