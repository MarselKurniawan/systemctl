import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, UserCircle, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import OnlineBadge from '@/components/shared/OnlineBadge';

export default function LawyerListPage() {
  const { role } = useAuth();
  const [lawyers, setLawyers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nama: '', nomorWa: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);

  const canAdd = role === 'superadmin' || role === 'admin';

  const fetchLawyers = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'lawyer');
    if (!roles || roles.length === 0) { setLawyers([]); setLoading(false); return; }
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', roles.map(r => r.user_id));
    setLawyers((profiles as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLawyers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama || !addForm.email || !addForm.password) {
      toast.error('Nama, Email, dan Password wajib diisi');
      return;
    }
    if (addForm.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setAdding(true);

    const { data, error } = await supabase.auth.signUp({
      email: addForm.email,
      password: addForm.password,
      options: { data: { nama: addForm.nama } },
    });
    if (error) { toast.error(error.message); setAdding(false); return; }

    if (data.user) {
      await supabase.from('profiles').update({
        nama: addForm.nama,
        nomor_wa: addForm.nomorWa || null,
        approval_status: 'approved',
      }).eq('user_id', data.user.id);
      await supabase.from('user_roles').update({ role: 'lawyer' }).eq('user_id', data.user.id);
    }

    toast.success('Lawyer berhasil ditambahkan');
    setShowAdd(false);
    setAddForm({ nama: '', nomorWa: '', email: '', password: '' });
    setAdding(false);
    fetchLawyers();
  };

  const filtered = lawyers.filter(c =>
    c.nama.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daftar Lawyer</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data lawyer</p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowAdd(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Tambah Lawyer
          </Button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada lawyer ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{l.nama}</p>
                  <OnlineBadge lastSeenAt={(l as any).last_seen_at} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {l.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span>}
                  {l.nomor_wa && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{l.nomor_wa}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Lawyer Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Lawyer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama</Label>
              <Input value={addForm.nama} onChange={(e) => setAddForm(p => ({ ...p, nama: e.target.value }))} placeholder="Nama lawyer" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nomor WhatsApp</Label>
              <Input value={addForm.nomorWa} onChange={(e) => setAddForm(p => ({ ...p, nomorWa: e.target.value }))} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Email</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="email@contoh.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input type={showPw ? 'text' : 'password'} value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Minimal 6 karakter" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full font-bold" disabled={adding}>{adding ? 'Memproses...' : 'Simpan'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
