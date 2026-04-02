import { useEffect, useState } from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
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

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export default function AppHeader({ onMenuClick }: AppHeaderProps) {
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
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles', filter: 'approval_status=eq.pending' }, () => {
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
    <header className="h-14 sm:h-16 bg-card border-b flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-muted transition-colors">
        <Menu className="h-5 w-5 text-foreground" />
      </button>
      <div className="flex-1 lg:hidden" />
      <div className="hidden lg:block flex-1" />
      
      <div className="flex items-center gap-2 sm:gap-4">
        {role && ['superadmin', 'admin', 'lawyer'].includes(role) && (
          <button
            onClick={() => navigate('/users/approval')}
            className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <Bell className="h-4 w-4 sm:h-[17px] sm:w-[17px] text-muted-foreground" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 sm:h-5 sm:min-w-5 px-1 rounded-full bg-red-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        )}
        <div className="h-6 w-px bg-border hidden sm:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary flex items-center justify-center">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[13px] font-semibold leading-none">{profile?.nama || 'User'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{roleLabel[role || 'client'] || role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="sm:hidden px-2 py-1.5 border-b mb-1">
              <p className="text-sm font-semibold">{profile?.nama || 'User'}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[role || 'client'] || role}</p>
            </div>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" /> Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
