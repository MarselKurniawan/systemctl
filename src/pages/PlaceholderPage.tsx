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
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link to="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{title}</span>
      </nav>

      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Halaman ini sedang dalam pengembangan. Fitur akan segera tersedia.
        </p>
      </div>
    </div>
  );
}
