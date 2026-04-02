import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gavel, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    nik: '',
    nomorWa: '',
    tanggalLahir: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.nik || !form.email || !form.password) {
      toast.error('Nama, NIK, Email, dan Password wajib diisi');
      return;
    }
    if (form.nik.length !== 16) {
      toast.error('NIK harus tepat 16 digit');
      return;
    }
    if (!/^\d{16}$/.test(form.nik)) {
      toast.error('NIK hanya boleh berisi angka (16 digit)');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nama: form.nama,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Update profile with additional fields
    if (data.user) {
      await supabase.from('profiles').update({
        nama: form.nama,
        nik: form.nik,
        nomor_wa: form.nomorWa || null,
        tanggal_lahir: form.tanggalLahir || null,
      }).eq('user_id', data.user.id);
    }

    setLoading(false);
    toast.success('Registrasi berhasil! Akun Anda menunggu persetujuan admin.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-3">
              <Gavel className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Daftar Akun</h1>
            <p className="text-sm text-muted-foreground mt-1">Bantuan Hukum Online</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama Lengkap</Label>
              <Input value={form.nama} onChange={(e) => update('nama', e.target.value)} placeholder="Nama lengkap" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">NIK (16 digit)</Label>
              <Input value={form.nik} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); update('nik', v); }} placeholder="Masukkan 16 digit NIK" maxLength={16} />
              {form.nik.length > 0 && form.nik.length < 16 && (
                <p className="text-xs text-destructive">{form.nik.length}/16 digit</p>
              )}
              {form.nik.length === 16 && (
                <p className="text-xs text-emerald-600">✓ 16 digit</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nomor WhatsApp</Label>
              <Input value={form.nomorWa} onChange={(e) => update('nomorWa', e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tanggal Lahir</Label>
              <Input type="date" value={form.tanggalLahir} onChange={(e) => update('tanggalLahir', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="email@contoh.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
