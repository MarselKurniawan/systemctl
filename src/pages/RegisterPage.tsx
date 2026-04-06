import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import legalEmblem from '@/assets/legal-emblem.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '', nik: '', nomorWa: '', tanggalLahir: '', jenisKelamin: '', penyandangDisabilitas: 'false', email: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.nik || !form.email || !form.password) {
      toast.error('Nama, NIK, Email, dan Password wajib diisi'); return;
    }
    if (form.nik.length !== 16 || !/^\d{16}$/.test(form.nik)) {
      toast.error('NIK harus tepat 16 digit angka'); return;
    }
    if (!form.jenisKelamin) { toast.error('Jenis kelamin wajib dipilih'); return; }
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }

    setLoading(true);

    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, nama, approval_status, rejection_reason')
      .eq('nik', form.nik);

    if (existingProfiles && existingProfiles.length > 0) {
      const existing = existingProfiles[0];
      if (existing.approval_status === 'pending') {
        toast.error('NIK ini sudah terdaftar dan sedang menunggu persetujuan admin.');
        setLoading(false); return;
      }
      if (existing.approval_status === 'approved') {
        toast.error('NIK ini sudah terdaftar dan aktif. Silakan login.');
        setLoading(false); return;
      }
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nama: form.nama, nik: form.nik, nomor_wa: form.nomorWa || null,
          tanggal_lahir: form.tanggalLahir || null, jenis_kelamin: form.jenisKelamin,
          penyandang_disabilitas: form.penyandangDisabilitas === 'true',
        },
      },
    });

    if (error) { toast.error(error.message); setLoading(false); return; }

    await supabase.auth.signOut();
    setLoading(false);
    toast.success('Registrasi berhasil! Akun Anda menunggu persetujuan admin.');
    navigate('/login');
  };

  const inputClass = "bg-white border-0 text-foreground h-11";
  const labelClass = "text-sm font-semibold text-white";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ backgroundColor: '#1a3a2a' }}>
      <div className="w-full max-w-lg">
        <div className="rounded-2xl shadow-2xl p-6 sm:p-8 border" style={{ backgroundColor: '#1e5c3a', borderColor: '#2a7a4e' }}>
          <div className="flex flex-col items-center mb-6">
            <img src={legalEmblem} alt="Bantuan Hukum Online" width={100} height={100} className="mb-2" />
            <h1 className="text-2xl font-bold text-white">
              Bantuan Hukum <span style={{ color: '#d4a017' }}>Online</span>
            </h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Nama Lengkap</Label>
              <Input value={form.nama} onChange={(e) => update('nama', e.target.value)} placeholder="Nama lengkap" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>NIK (16 digit)</Label>
                <Input value={form.nik} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); update('nik', v); }} placeholder="16 digit NIK" maxLength={16} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>WhatsApp</Label>
                <Input value={form.nomorWa} onChange={(e) => update('nomorWa', e.target.value)} placeholder="08xxxxxxxxxx" className={inputClass} />
              </div>
            </div>
            {form.nik.length > 0 && form.nik.length < 16 && <p className="text-xs" style={{ color: '#d4a017' }}>{form.nik.length}/16 digit</p>}
            <div className="space-y-1.5">
              <Label className={labelClass}>Tanggal Lahir</Label>
              <Input type="date" value={form.tanggalLahir} onChange={(e) => update('tanggalLahir', e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Jenis Kelamin</Label>
                <Select value={form.jenisKelamin} onValueChange={(v) => update('jenisKelamin', v)}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Disabilitas</Label>
                <Select value={form.penyandangDisabilitas} onValueChange={(v) => update('penyandangDisabilitas', v)}>
                  <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Tidak</SelectItem>
                    <SelectItem value="true">Ya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelClass}>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="email@contoh.com" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min 6 karakter" className={`pr-10 ${inputClass}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#a0c4b0' }}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-bold text-base border-0"
              style={{ backgroundColor: '#d4a017', color: '#1a3a2a' }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Buat Akun'}
            </Button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#a0c4b0' }}>
            Sudah Punya Akun?{' '}
            <Link to="/login" className="font-bold hover:underline" style={{ color: '#d4a017' }}>Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
