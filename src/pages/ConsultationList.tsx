import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, ExternalLink, Trash2, UserPlus, Monitor, MessageCircle, Video, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { consultations } from '@/data/mockData';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  in_progress: 'bg-info/15 text-info border-info/30',
  completed: 'bg-success/15 text-success border-success/30',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const typeIcons: Record<string, typeof Monitor> = {
  offline: Monitor,
  chat: MessageCircle,
  video_call: Video,
};

const typeLabels: Record<string, string> = {
  offline: 'Offline',
  chat: 'Chat',
  video_call: 'Video',
};

export default function ConsultationList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = consultations.filter(
    (c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Riwayat Konsultasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua konsultasi hukum Anda</p>
        </div>
        <Button onClick={() => navigate('/consultation/new')} className="gap-2 shadow-md font-semibold">
          <UserPlus className="h-4 w-4" /> Buat Konsultasi
        </Button>
      </div>

      {/* Table card */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama klien atau kasus..."
                className="pl-10 bg-muted/50 border-0 focus-visible:bg-card h-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Filter className="h-3.5 w-3.5" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{filtered.length}</span> dari {consultations.length} data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/40 border-y">
                {['No', 'Profil', 'Nama Kasus', 'Jenis', 'Layanan', 'Hukum', 'Tanggal', 'Status', 'Agenda', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-left">
                    {h && (
                      <span className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                        {h} {h && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => {
                const TypeIcon = typeIcons[c.consultationType];
                return (
                  <tr key={c.id} className="hover:bg-accent/40 transition-colors group">
                    <td className="py-3.5 px-4 text-sm font-medium text-muted-foreground">{c.no}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {c.clientName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{c.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm max-w-[160px] truncate">{c.caseName}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" className="gap-1 text-[10px] font-semibold tracking-wide uppercase px-2.5">
                        <TypeIcon className="h-3 w-3" />
                        {typeLabels[c.consultationType]}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[140px] truncate">{c.serviceType}</td>
                    <td className="py-3.5 px-4 text-xs font-medium">{c.lawType}</td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{c.date}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className={`${statusColors[c.status]} text-[10px] font-semibold px-2.5`}>
                        <span className="mr-1.5 text-[8px]">●</span>{statusLabels[c.status]}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs">{c.agenda}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/consultation/${c.id}`)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
                          title="Lihat detail"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
          <span>Page 1 of 1</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled className="h-7 text-xs">Previous</Button>
            <Button variant="ghost" size="sm" disabled className="h-7 text-xs">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
