import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, Database, Users, ChevronDown, ChevronRight, Scale, Gavel } from 'lucide-react';

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
    <aside className="w-60 min-h-screen gradient-sidebar text-sidebar-foreground flex flex-col shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <Gavel className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide leading-tight">
            Bantuan Hukum
          </div>
          <div className="text-secondary font-extrabold text-xs tracking-widest uppercase">
            Online
          </div>
        </div>
      </div>

      <div className="mx-4 border-t border-sidebar-border/30 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.label);
          const hasActiveChild = item.children?.some((c) => isActive(c.path));

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    hasActiveChild
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/60 text-sidebar-foreground/80 hover:text-sidebar-foreground'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40 mt-1' : 'max-h-0'}`}>
                  <div className="ml-5 pl-4 border-l border-sidebar-border/30 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                          isActive(child.path)
                            ? 'bg-secondary/20 text-secondary'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40'
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
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(item.path!)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'hover:bg-sidebar-accent/60 text-sidebar-foreground/80 hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 text-[10px] text-sidebar-foreground/40 tracking-wide">
        © 2026 BHO System
      </div>
    </aside>
  );
}
