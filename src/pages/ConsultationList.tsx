import { useState, useMemo } from 'react';
import { formatDurationText } from '@/hooks/useTimer';
import { useNavigate } from 'react-router-dom';
import { Search, Download, ExternalLink, Trash2, Plus, Monitor, MessageCircle, Video, CalendarIcon, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, FileDown, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useConsultations } from '@/hooks/useConsultations';
import { useAuth } from '@/contexts/AuthContext';
import CreateConsultationModal from '@/components/consultation/CreateConsultationModal';
import { exportToPDF, exportToCSV, exportToExcel } from '@/lib/exportUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};
const statusLabel: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
const typeStyle: Record<string, { icon: typeof Monitor; label: string; cls: string }> = {
  offline: { icon: Monitor, label: 'Offline', cls: 'bg-slate-50 text-slate-600 border border-slate-200' },
  chat: { icon: MessageCircle, label: 'Chat', cls: 'bg-teal-50 text-teal-600 border border-teal-200' },
  video_call: { icon: Video, label: 'Video Call', cls: 'bg-indigo-50 text-indigo-600 border border-indigo-200' },
};

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const MONTH_MAP: Record<string, number> = {};
MONTHS.forEach((m, i) => { MONTH_MAP[m.toLowerCase()] = i; });

function parseDateString(dateStr: string): Date | null {
  const parts = dateStr.split(' ');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0]);
  const monthIdx = MONTH_MAP[parts[1].toLowerCase()];
  const year = parseInt(parts[2]);
  if (isNaN(day) || monthIdx === undefined || isNaN(year)) return null;
  return new Date(year, monthIdx, day);
}

const PER_PAGE_OPTIONS = [10, 20, 30, 0]; // 0 = show all

export default function ConsultationList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { consultations, loading: consultationsLoading } = useConsultations();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Filter state
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Pagination
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Available years from data
  const years = useMemo(() => {
    const ys = new Set(consultations.map(c => { const p = parseDateString(c.date); return p ? p.getFullYear() : 0; }).filter(Boolean));
    return Array.from(ys).sort((a, b) => (b as number) - (a as number));
  }, [consultations]);

  // Filter logic
  const filtered = useMemo(() => {
    let result = consultations;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.clientName.toLowerCase().includes(q) || c.caseName.toLowerCase().includes(q));
    }

    // Month/Year
    if (filterMonth !== 'all' || filterYear !== 'all') {
      result = result.filter(c => {
        const d = parseDateString(c.date);
        if (!d) return false;
        if (filterYear !== 'all' && d.getFullYear() !== parseInt(filterYear)) return false;
        if (filterMonth !== 'all' && d.getMonth() !== parseInt(filterMonth)) return false;
        return true;
      });
    }

    // Date range
    if (dateFrom || dateTo) {
      result = result.filter(c => {
        const d = parseDateString(c.date);
        if (!d) return false;
        if (dateFrom && d < dateFrom) return false;
        if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59); if (d > end) return false; }
        return true;
      });
    }

    return result;
  }, [consultations, search, filterMonth, filterYear, dateFrom, dateTo]);

  // Summary
  const totalMinutes = filtered.reduce((sum, c) => sum + (c.duration || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainMinutes = totalMinutes % 60;

  // Pagination
  const totalPages = perPage === 0 ? 1 : Math.ceil(filtered.length / perPage);
  const paginated = perPage === 0 ? filtered : filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetFilters = () => { setFilterMonth('all'); setFilterYear('all'); setDateFrom(undefined); setDateTo(undefined); setCurrentPage(1); };

  const getFilterLabel = () => {
    const parts: string[] = [];
    if (filterMonth !== 'all') parts.push(MONTHS[parseInt(filterMonth)]);
    if (filterYear !== 'all') parts.push(filterYear);
    if (dateFrom) parts.push(`dari ${format(dateFrom, 'dd MMM yyyy', { locale: idLocale })}`);
    if (dateTo) parts.push(`s/d ${format(dateTo, 'dd MMM yyyy', { locale: idLocale })}`);
    return parts.length > 0 ? parts.join(' ') : 'Semua Data';
  };

  const handleExport = async (type: 'pdf' | 'csv' | 'excel') => {
    const label = getFilterLabel();
    if (type === 'pdf') await exportToPDF(filtered, label);
    else if (type === 'csv') exportToCSV(filtered, label);
    else exportToExcel(filtered, label);
    setShowExportMenu(false);
  };

  const stats = [
    { label: 'Total Konsultasi', value: filtered.length, cls: 'border-l-primary' },
    { label: 'Pending', value: filtered.filter(c => c.status === 'pending').length, cls: 'border-l-amber-400' },
    { label: 'In Progress', value: filtered.filter(c => c.status === 'in_progress').length, cls: 'border-l-blue-400' },
    { label: 'Total Durasi', value: `${totalHours}j ${remainMinutes}m`, cls: 'border-l-emerald-400' },
  ];

  const hasActiveFilter = filterMonth !== 'all' || filterYear !== 'all' || dateFrom || dateTo;

  return (
    <>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Riwayat Konsultasi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola dan pantau semua sesi konsultasi hukum</p>
        </div>
        {role && ['superadmin', 'admin', 'lawyer', 'client'].includes(role) && (
          <Button onClick={() => setShowCreate(true)} className="gap-2 h-10 font-semibold">
            <Plus className="h-4 w-4" /> Buat Konsultasi
          </Button>
        )}
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
        {/* Toolbar */}
        <div className="p-4 flex flex-col gap-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Cari konsultasi..." className="w-full h-9 pl-9 pr-4 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={showFilter ? 'default' : 'outline'} size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setShowFilter(!showFilter)}>
                <CalendarIcon className="h-3.5 w-3.5" /> Filter
                {hasActiveFilter && <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">!</span>}
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setShowExportMenu(!showExportMenu)}>
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg z-50 py-1 w-44">
                    <button onClick={() => handleExport('pdf')} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" /> Export PDF
                    </button>
                    <button onClick={() => handleExport('csv')} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                      <FileDown className="h-4 w-4 text-green-500" /> Export CSV
                    </button>
                    <button onClick={() => handleExport('excel')} className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Filter Data</p>
                {hasActiveFilter && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" onClick={resetFilters}>
                    <X className="h-3 w-3" /> Reset
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Month */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Bulan</label>
                  <Select value={filterMonth} onValueChange={(v) => { setFilterMonth(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Semua Bulan" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bulan</SelectItem>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Year */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Tahun</label>
                  <Select value={filterYear} onValueChange={(v) => { setFilterYear(v); setCurrentPage(1); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Semua Tahun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {years.map((y: any) => <SelectItem key={String(y)} value={String(y)}>{String(y)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {/* Date From */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Dari Tanggal</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full h-9 justify-start text-left text-sm font-normal', !dateFrom && 'text-muted-foreground')}>
                        <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                        {dateFrom ? format(dateFrom, 'dd MMM yyyy', { locale: idLocale }) : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setCurrentPage(1); }} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Date To */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Sampai Tanggal</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn('w-full h-9 justify-start text-left text-sm font-normal', !dateTo && 'text-muted-foreground')}>
                        <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                        {dateTo ? format(dateTo, 'dd MMM yyyy', { locale: idLocale }) : 'Pilih tanggal'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setCurrentPage(1); }} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Active filter summary */}
              {hasActiveFilter && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background rounded-md px-3 py-2 border">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Filter aktif: <strong className="text-foreground">{getFilterLabel()}</strong> — {filtered.length} data, total durasi: <strong className="text-foreground">{totalHours}j {remainMinutes}m</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {['No', 'Klien', 'Nama Kasus', 'Tipe', 'Hukum', 'Tanggal', 'Durasi', 'Status', ''].map((h) => (
                  <th key={h} className="py-3 px-4 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((c, idx) => {
                const t = typeStyle[c.consultationType];
                const TypeIcon = t.icon;
                const rowNo = perPage === 0 ? idx + 1 : (currentPage - 1) * perPage + idx + 1;
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => navigate(`/consultation/${c.id}`)}>
                    <td className="py-3 px-4 text-muted-foreground">{rowNo}</td>
                    <td className="py-3 px-4 font-medium">{c.clientName}</td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[180px] truncate">{c.caseName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${t.cls}`}>
                        <TypeIcon className="h-3 w-3" /> {t.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">{c.lawType}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{c.date}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDurationText(c.duration || 0)}</td>
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
              {paginated.length === 0 && (
                <tr><td colSpan={9} className="py-12 text-center text-muted-foreground text-sm">Tidak ada data ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {paginated.map((c) => {
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
                  {c.duration ? <><span>•</span><span>{formatDurationText(c.duration)}</span></> : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Menampilkan {paginated.length} dari {filtered.length}</span>
            <div className="flex items-center gap-1.5">
              <span>Show:</span>
              {PER_PAGE_OPTIONS.map(n => (
                <button key={n} onClick={() => { setPerPage(n); setCurrentPage(1); }}
                  className={cn('px-2 py-1 rounded text-[11px] font-medium transition-colors',
                    perPage === n ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                  {n === 0 ? 'All' : n}
                </button>
              ))}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                return false;
              }).map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                  <button onClick={() => setCurrentPage(p)}
                    className={cn('px-2.5 py-1 rounded text-[11px] font-medium transition-colors',
                      currentPage === p ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
                    {p}
                  </button>
                </span>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-muted disabled:opacity-30 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    <CreateConsultationModal
      open={showCreate}
      onClose={() => setShowCreate(false)}
      onCreated={(id, type) => {
        if (type === 'offline') {
          navigate(`/consultation/${id}?autostart=true`);
        } else {
          navigate(`/consultation/${id}`);
        }
      }}
    />
    </>
  );
}
