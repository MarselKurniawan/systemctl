import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import PendingApprovalPage from '@/pages/PendingApprovalPage';
import { useNewRegistrationNotifier } from '@/hooks/useNewRegistrationNotifier';

export default function AppLayout() {
  const { user, loading, isApproved, role, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useNewRegistrationNotifier();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role to load before making access decisions
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Clients must be approved; other roles are auto-approved
  if (role === 'client' && !isApproved) {
    return <PendingApprovalPage />;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
