import { useEffect, useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const roleLabel: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrator',
  lawyer: 'Lawyer',
  client: 'Client',
};

export default function AppHeader() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (role && ['superadmin', 'admin', 'lawyer'].includes(role)) {
      const fetchPending = async () => {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending');
        const newCount = count || 0;
        if (newCount > pendingCount && pendingCount > 0) {
          toast.info(`Ada ${newCount} user baru menunggu persetujuan!`, {
            action: { label: 'Lihat', onClick: () => navigate('/users/approval') },
            duration: 8000,
          });
        }
        setPendingCount(newCount);
      };
      fetchPending();

      const channel = supabase
        .channel('header-pending')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles', filter: 'approval_status=eq.pending' }, (payload) => {
          fetchPending();
          toast.info('Ada pendaftaran user baru!', {
            action: { label: 'Lihat', onClick: () => navigate('/users/approval') },
            duration: 8000,
          });
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-card border-b flex items-center justify-end px-6 gap-4">
      {role && ['superadmin', 'admin', 'lawyer'].includes(role) && (
        <button
          onClick={() => navigate('/users/approval')}
          className="relative h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <Bell className="h-[17px] w-[17px] text-muted-foreground" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      )}
      <div className="h-7 w-px bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold leading-none">{profile?.nama || 'User'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{roleLabel[role || 'client'] || role}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
