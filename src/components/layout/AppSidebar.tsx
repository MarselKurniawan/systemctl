import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Database, Users, ChevronDown, Gavel, LayoutDashboard } from 'lucide-react';

const menuItems = [
  { label: 'Riwayat Konsultasi', icon: Clock, path: '/' },
  {
    label: 'Master Data',
    icon: Database,
    children: [
      { label: 'Jenis Konsultasi', path: '/master/jenis-konsultasi' },
      { label: 'Jenis Layanan', path: '/master/jenis-layanan' },
      { label: 'Jenis Hukum', path: '/master/jenis-hukum' },
    ],
  },
  {
    label: 'User Management',
    icon: Users,
    children: [
      { label: 'Daftar User', path: '/users' },
      { label: 'Roles', path: '/users/roles' },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-[260px] min-h-screen sidebar-gradient flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg shadow-secondary/20">
          <Gavel className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-white tracking-tight leading-none">Bantuan Hukum</p>
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-secondary mt-0.5">Online</p>
        </div>
      </div>

      {/* Nav section label */}
      <div className="px-6 mt-2 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">Menu</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.label);
          const hasActiveChild = item.children?.some((c) => isActive(c.path));

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 group ${
                    hasActiveChild || isOpen
                      ? 'bg-white/10 text-white'
                      : 'text-white/55 hover:text-white/90 hover:bg-white/5'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                    hasActiveChild ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-white/50 group-hover:text-white/80'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                  <div className="ml-[22px] pl-5 border-l border-white/10 space-y-0.5 pb-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-2 text-[12px] font-medium rounded-lg transition-all duration-150 ${
                          isActive(child.path)
                            ? 'text-secondary bg-secondary/10'
                            : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 group ${
                isActive(item.path!)
                  ? 'bg-white/10 text-white'
                  : 'text-white/55 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive(item.path!) ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-white/50 group-hover:text-white/80'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom card */}
      <div className="px-4 pb-5">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-[11px] font-semibold text-white/70 mb-1">Butuh bantuan?</p>
          <p className="text-[10px] text-white/40 leading-relaxed">Hubungi support team untuk mendapatkan bantuan teknis.</p>
        </div>
      </div>
    </aside>
  );
}
