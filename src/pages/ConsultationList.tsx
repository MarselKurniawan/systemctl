import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Download, ExternalLink, Trash2, Plus, Monitor, MessageCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { consultations } from '@/data/mockData';

const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', label: 'Pending' },
  in_progress: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', label: 'Completed' },
};

const typeConfig: Record<string, { icon: typeof Monitor; label: string; color: string }> = {
  offline: { icon: Monitor, label: 'Offline', color: 'bg-slate-100 text-slate-600' },
  chat: { icon: MessageCircle, label: 'Chat', color: 'bg-primary/10 text-primary' },
  video_call: { icon: Video, label: 'Video', color: 'bg-info/10 text-info' },
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
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Konsultasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola dan pantau semua sesi konsultasi hukum</p>
        </div>
        <Button onClick={() => navigate('/consultation/new')} className="gap-2 h-11 px-5 rounded-xl font-semibold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Buat Konsultasi
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: consultations.length, color: 'from-primary/10 to-primary/5 text-primary' },
          { label: 'Pending', value: consultations.filter(c => c.status === 'pending').length, color: 'from-amber-100/80 to-amber-50 text-amber-700' },
          { label: 'In Progress', value: consultations.filter(c => c.status === 'in_progress').length, color: 'from-blue-100/80 to-blue-50 text-blue-700' },
          { label: 'Completed', value: consultations.filter(c => c.status === 'completed').length, color: 'from-emerald-100/80 to-emerald-50 text-emerald-700' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 border border-border/30`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-elevated rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari konsultasi..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 border-0 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-xl">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-xl">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Mobile cards / Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                {['No', 'Klien', 'Kasus', 'Tipe', 'Layanan', 'Hukum', 'Tanggal', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 text-left first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((c) => {
                const type = typeConfig[c.consultationType];
                const status = statusConfig[c.status];
                const TypeIcon = type.icon;
                return (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors group cursor-pointer" onClick={() => navigate(`/consultation/${c.id}`)}>
                    <td className="py-3.5 px-4 pl-6 text-sm text-muted-foreground font-medium">{c.no}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {c.clientName.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold">{c.clientName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-muted-foreground max-w-[180px] truncate">{c.caseName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${type.color}`}>
                        <TypeIcon className="h-3 w-3" /> {type.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-muted-foreground max-w-[130px] truncate">{c.serviceType}</td>
                    <td className="py-3.5 px-4 text-xs font-medium">{c.lawType}</td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">{c.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${status.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 pr-6">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/consultation/${c.id}`); }}
                          className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-destructive/60 hover:text-destructive"
                        >
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

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {filtered.map((c) => {
            const type = typeConfig[c.consultationType];
            const status = statusConfig[c.status];
            const TypeIcon = type.icon;
            return (
              <div key={c.id} className="p-4 hover:bg-muted/20 transition-colors" onClick={() => navigate(`/consultation/${c.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {c.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{c.clientName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.caseName}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${status.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${type.color}`}>
                    <TypeIcon className="h-3 w-3" /> {type.label}
                  </span>
                  <span>{c.date}</span>
                  <span>{c.lawType}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t bg-muted/10 text-xs text-muted-foreground">
          <span>Menampilkan {filtered.length} dari {consultations.length} data</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg hover:bg-muted transition-colors font-medium" disabled>Sebelumnya</button>
            <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold">1</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-muted transition-colors font-medium" disabled>Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
