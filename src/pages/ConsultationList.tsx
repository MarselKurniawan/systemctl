import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Download, ExternalLink, Trash2, Plus, Monitor, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consultations } from '@/data/mockData';
import CreateConsultationModal from '@/components/consultation/CreateConsultationModal';

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
};
const statusLabel: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};
const typeStyle: Record<string, { icon: typeof Monitor; label: string; cls: string }> = {
  offline: { icon: Monitor, label: 'Offline', cls: 'bg-slate-100 text-slate-700' },
  chat: { icon: MessageCircle, label: 'Chat', cls: 'bg-teal-100 text-teal-700' },
  video_call: { icon: Video, label: 'Video Call', cls: 'bg-indigo-100 text-indigo-700' },
};

export default function ConsultationList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = consultations.filter(
    (c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.caseName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Konsultasi', value: consultations.length, cls: 'border-l-primary' },
    { label: 'Pending', value: consultations.filter(c => c.status === 'pending').length, cls: 'border-l-warning' },
    { label: 'In Progress', value: consultations.filter(c => c.status === 'in_progress').length, cls: 'border-l-info' },
    { label: 'Selesai', value: consultations.filter(c => c.status === 'completed').length, cls: 'border-l-success' },
  ];

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Riwayat Konsultasi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola dan pantau semua sesi konsultasi hukum</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 h-10 font-semibold">
          <Plus className="h-4 w-4" /> Buat Konsultasi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-card rounded-lg border border-l-4 ${s.cls} p-4`}>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari konsultasi..."
              className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['No', 'Klien', 'Nama Kasus', 'Tipe', 'Layanan', 'Hukum', 'Tanggal', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => {
                const t = typeStyle[c.consultationType];
                const TypeIcon = t.icon;
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => navigate(`/consultation/${c.id}`)}>
                    <td className="py-3 px-4 text-muted-foreground">{c.no}</td>
                    <td className="py-3 px-4 font-medium">{c.clientName}</td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[180px] truncate">{c.caseName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${t.cls}`}>
                        <TypeIcon className="h-3 w-3" /> {t.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-muted-foreground max-w-[120px] truncate">{c.serviceType}</td>
                    <td className="py-3 px-4 text-xs">{c.lawType}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{c.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold ${statusStyle[c.status]}`}>
                        {statusLabel[c.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/consultation/${c.id}`); }}
                          className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {filtered.map((c) => {
            const t = typeStyle[c.consultationType];
            const TypeIcon = t.icon;
            return (
              <div key={c.id} className="p-4 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/consultation/${c.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{c.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.caseName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusStyle[c.status]}`}>{statusLabel[c.status]}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${t.cls}`}>
                    <TypeIcon className="h-3 w-3" /> {t.label}
                  </span>
                  <span>•</span>
                  <span>{c.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
          <span>Menampilkan {filtered.length} dari {consultations.length}</span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-semibold text-[11px]">1</button>
          </div>
        </div>
      </div>
    </div>

    <CreateConsultationModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
}
