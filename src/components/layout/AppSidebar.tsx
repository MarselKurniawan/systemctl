import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clock, Database, Users, ChevronDown, Gavel, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  roles?: string[];
  children?: { label: string; path: string; roles?: string[] }[];
}

const allMenuItems: MenuItem[] = [
  { label: 'Riwayat Konsultasi', icon: Clock, path: '/', roles: ['superadmin', 'admin', 'lawyer', 'client'] },
  {
    label: 'Master Data',
    icon: Database,
    roles: ['superadmin', 'admin'],
    children: [
      { label: 'Jenis Konsultasi', path: '/master/jenis-konsultasi' },
      { label: 'Jenis Layanan', path: '/master/jenis-layanan' },
      { label: 'Jenis Hukum', path: '/master/jenis-hukum' },
    ],
  },
  {
    label: 'User Management',
    icon: Users,
    roles: ['superadmin', 'admin'],
    children: [
      { label: 'Daftar User', path: '/users' },
      { label: 'Roles', path: '/users/roles', roles: ['superadmin'] },
      { label: 'Persetujuan User', path: '/users/approval' },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const { role } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (role && ['superadmin', 'admin', 'lawyer'].includes(role)) {
      const fetchPending = async () => {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending');
        setPendingCount(count || 0);
      };
      fetchPending();

      const channel = supabase
        .channel('sidebar-pending')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchPending())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [role]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  // Filter menu items based on role
  const menuItems = allMenuItems.filter((item) => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  return (
    <aside className="w-[250px] min-h-screen bg-sidebar flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
          <Gavel className="h-4 w-4 text-secondary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Bantuan Hukum</p>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-secondary mt-0.5">Online</p>
        </div>
      </div>

      {/* Label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">Menu Utama</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.label);
          const hasActiveChild = item.children?.some((c) => isActive(c.path));
          const active = isActive(item.path!) || hasActiveChild;

          if (item.children) {
            // Filter children by role
            const visibleChildren = item.children.filter((c) => {
              if (!c.roles) return true;
              return role && c.roles.includes(role);
            });

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium rounded-lg transition-colors ${
                    active ? 'bg-sidebar-accent text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-[17px] w-[17px]" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                {isOpen && (
                  <div className="ml-8 mt-1 pl-3 border-l border-white/10 space-y-0.5">
                    {visibleChildren.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center justify-between px-3 py-2 text-[12px] font-medium rounded-md transition-colors ${
                          isActive(child.path)
                            ? 'text-secondary font-semibold'
                            : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        <span>{child.label}</span>
                        {child.path === '/users/approval' && pendingCount > 0 && (
                          <span className="h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-colors ${
                active ? 'bg-sidebar-accent text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon className="h-[17px] w-[17px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-[10px] text-white/25">© 2026 BHO System</div>
    </aside>
  );
}
