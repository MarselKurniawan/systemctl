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
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1"><Home className="h-3 w-3" /> Home</Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-medium">{title}</span>
      </nav>
      <div className="bg-card rounded-lg border p-16 flex flex-col items-center text-center">
        <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          <Construction className="h-6 w-6 text-primary/50" />
        </div>
        <h1 className="text-lg font-bold mb-1">{title}</h1>
        <p className="text-sm text-muted-foreground">Halaman ini sedang dalam pengembangan.</p>
      </div>
    </div>
  );
}
