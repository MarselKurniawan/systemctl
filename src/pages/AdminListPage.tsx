import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Shield, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import OnlineBadge from '@/components/shared/OnlineBadge';

export default function AdminListPage() {
  const { role } = useAuth();
  const [admins, setAdmins] = useState<(Profile & { userRole?: string })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nama: '', email: '', password: '', role: 'admin' });
  const [showPw, setShowPw] = useState(false);
  const [adding, setAdding] = useState(false);

  // Only superadmin can add admin/superadmin
  const canAdd = role === 'superadmin';

  const fetchAdmins = async () => {
    const { data: roles } = await supabase.from('user_roles').select('user_id, role').in('role', ['admin', 'superadmin']);
    if (!roles || roles.length === 0) { setAdmins([]); setLoading(false); return; }
    const userIds = roles.map(r => r.user_id);
    const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', userIds);
    const merged = (profiles as Profile[])?.map(p => ({
      ...p,
      userRole: roles.find(r => r.user_id === p.user_id)?.role || 'admin',
    })) || [];
    setAdmins(merged);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama || !addForm.email || !addForm.password) {
      toast.error('Semua field wajib diisi');
      return;
    }
    if (addForm.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setAdding(true);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke('create-user', {
      body: { email: addForm.email, password: addForm.password, nama: addForm.nama, role: addForm.role },
    });
    if (res.error || res.data?.error) {
      toast.error(res.data?.error || res.error?.message || 'Gagal membuat user');
      setAdding(false);
      return;
    }

    toast.success(`${addForm.role === 'superadmin' ? 'Super Admin' : 'Admin'} berhasil ditambahkan`);
    setShowAdd(false);
    setAddForm({ nama: '', email: '', password: '', role: 'admin' });
    setAdding(false);
    fetchAdmins();
  };

  const filtered = admins.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Daftar Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola admin dan superadmin sistem</p>
        </div>
        {canAdd && (
          <Button onClick={() => setShowAdd(true)} className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Tambah Admin
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
          <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada admin ditemukan</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((a) => (
            <div key={a.id} className="bg-card rounded-xl border p-4 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${a.userRole === 'superadmin' ? 'bg-amber-50 border-2 border-amber-200' : 'bg-blue-50 border-2 border-blue-200'}`}>
                <Shield className={`h-5 w-5 ${a.userRole === 'superadmin' ? 'text-amber-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground truncate">{a.nama}</p>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.userRole === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {a.userRole === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                  <OnlineBadge lastSeenAt={(a as any).last_seen_at} />
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />{a.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Admin Modal */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama</Label>
              <Input value={addForm.nama} onChange={(e) => setAddForm(p => ({ ...p, nama: e.target.value }))} placeholder="Nama admin" />
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
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Role</Label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full font-bold" disabled={adding}>{adding ? 'Memproses...' : 'Simpan'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
