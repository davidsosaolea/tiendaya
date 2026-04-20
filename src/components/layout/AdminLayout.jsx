import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../hooks/useStore';
import Sidebar from './Sidebar';
import { PageSpinner } from '../ui/Spinner';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const { currentStore, stores, loading: storeLoading, createStore, setCurrentStore } = useStore();

  if (authLoading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="admin-layout">
      <Sidebar store={currentStore} />
      <main className="admin-main">
        <div className="admin-content">
          <Outlet context={{ currentStore, stores, storeLoading, createStore, setCurrentStore }} />
        </div>
      </main>
    </div>
  );
}
