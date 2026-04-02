import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Phone, Mail, Calendar, Search, UserCircle } from 'lucide-react';
import OnlineBadge from '@/components/shared/OnlineBadge';

export default function ClientListPage() {
  const [clients, setClients] = useState<(Profile & { role?: string })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role').eq('role', 'client');
      if (!roles) { setLoading(false); return; }
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds).eq('approval_status', 'approved');
      setClients((profiles as Profile[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = clients.filter(c =>
    c.nama.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.nik?.includes(search)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Daftar Client</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola data client yang terdaftar</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, atau NIK..." className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada client ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {c.jenis_kelamin === 'Perempuan' ? (
                  <svg className="h-5 w-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
                ) : (
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"/><path d="M19 5l-4.5 4.5M19 5h-5M19 5v5"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate">{c.nama}</p>
                  <OnlineBadge lastSeenAt={(c as any).last_seen_at} />
                  {(c as any).penyandang_disabilitas && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 6v6M8 12h8l-2 8H10l-2-8"/></svg>
                      Disabilitas
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {c.nik && <span>NIK: {c.nik}</span>}
                  {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                  {c.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.nomor_wa}</span>}
                  {c.tanggal_lahir && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{c.tanggal_lahir}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
