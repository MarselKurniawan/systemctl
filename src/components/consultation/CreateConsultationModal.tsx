import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const lawyers = [
  'Pilih Lawyer Otomatis',
  'Dr. Ahmad Pratama, S.H.',
  'Siti Rahmawati, S.H.',
  'Budi Santoso, S.H.',
  'Dewi Lestari, S.H.',
  'Rina Agustina, S.H.',
];

export default function CreateConsultationModal({ open, onClose }: Props) {
  const { role } = useAuth();
  const [form, setForm] = useState({
    namaPengguna: '',
    nik: '',
    telp: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki Laki',
    penyandangDisabilitas: 'Ya',
    namaKasus: '',
    jenisKonsultasi: role === 'client' ? 'chat' : 'offline',
    jenisLayanan: 'Layanan Konsultasi (SKTM)',
    jenisHukum: 'Pidana',
    tanggalKonsultasi: new Date().toISOString().split('T')[0],
    agenda: '',
    pilihLawyer: 'Pilih Lawyer Otomatis',
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  // Client cannot create offline consultations
  const consultationTypes = role === 'client'
    ? [{ value: 'chat', label: 'Chat' }, { value: 'video_call', label: 'Video Call' }]
    : [{ value: 'offline', label: 'Offline' }, { value: 'chat', label: 'Chat' }, { value: 'video_call', label: 'Video Call' }];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaPengguna.trim() || !form.namaKasus.trim()) {
      toast({ title: 'Error', description: 'Nama Pengguna dan Nama Kasus wajib diisi', variant: 'destructive' });
      return;
    }
    if (form.nik && form.nik.length !== 16) {
      toast({ title: 'Error', description: 'NIK harus tepat 16 digit', variant: 'destructive' });
      return;
    }
    toast({ title: 'Berhasil', description: 'Konsultasi baru berhasil dibuat' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-center text-lg font-bold">Buat Konsultasi Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama Pengguna</Label>
              <Input value={form.namaPengguna} onChange={(e) => update('namaPengguna', e.target.value)} placeholder="" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">NIK (16 digit)</Label>
              <Input value={form.nik} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); update('nik', v); }} placeholder="Masukkan 16 digit NIK" maxLength={16} />
              {form.nik.length > 0 && form.nik.length < 16 && <p className="text-xs text-destructive">{form.nik.length}/16 digit</p>}
              {form.nik.length === 16 && <p className="text-xs text-emerald-600">✓ 16 digit</p>}
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Telp</Label>
              <Input value={form.telp} onChange={(e) => update('telp', e.target.value)} placeholder="" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tanggal Lahir</Label>
              <Input type="date" value={form.tanggalLahir} onChange={(e) => update('tanggalLahir', e.target.value)} />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Jenis Kelamin</Label>
              <Select value={form.jenisKelamin} onValueChange={(v) => update('jenisKelamin', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki Laki">Laki Laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Penyandang Disabilitas</Label>
              <Select value={form.penyandangDisabilitas} onValueChange={(v) => update('penyandangDisabilitas', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ya">Ya</SelectItem>
                  <SelectItem value="Tidak">Tidak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama Kasus</Label>
              <Input value={form.namaKasus} onChange={(e) => update('namaKasus', e.target.value)} placeholder="" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Jenis Konsultasi</Label>
              <Select value={form.jenisKonsultasi} onValueChange={(v) => update('jenisKonsultasi', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {consultationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Jenis Layanan</Label>
              <Select value={form.jenisLayanan} onValueChange={(v) => update('jenisLayanan', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Layanan Konsultasi (SKTM)">Layanan Konsultasi (SKTM)</SelectItem>
                  <SelectItem value="Layanan Konsultasi (Non-SKTM)">Layanan Konsultasi (Non-SKTM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Jenis Hukum</Label>
              <Select value={form.jenisHukum} onValueChange={(v) => update('jenisHukum', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pidana">Pidana</SelectItem>
                  <SelectItem value="Perdata">Perdata</SelectItem>
                  <SelectItem value="Tata Usaha Negara">Tata Usaha Negara</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 6 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Tanggal Konsultasi</Label>
              <Input type="date" value={form.tanggalKonsultasi} onChange={(e) => update('tanggalKonsultasi', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Agenda</Label>
              <Textarea value={form.agenda} onChange={(e) => update('agenda', e.target.value)} className="min-h-[40px] resize-none" rows={1} />
            </div>
          </div>

          {/* Row 7 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Pilih Lawyer</Label>
              <Select value={form.pilihLawyer} onValueChange={(v) => update('pilihLawyer', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {lawyers.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-sm font-bold">
            Simpan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
