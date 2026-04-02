import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight, Construction } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/master/jenis-konsultasi': 'Jenis Konsultasi',
  '/master/jenis-layanan': 'Jenis Layanan',
  '/master/jenis-hukum': 'Jenis Hukum',
  '/users': 'Daftar User',
  '/users/roles': 'Roles',
  '/consultation/new': 'Buat Konsultasi Baru',
};

export default function PlaceholderPage() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Halaman';

  return (
    <div className="space-y-5 animate-slide-in">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link to="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-semibold">{title}</span>
      </nav>

      <div className="glass-elevated rounded-2xl p-16 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5">
          <Construction className="h-8 w-8 text-primary/60" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Halaman ini sedang dalam pengembangan. Fitur akan segera tersedia.
        </p>
      </div>
    </div>
  );
}
