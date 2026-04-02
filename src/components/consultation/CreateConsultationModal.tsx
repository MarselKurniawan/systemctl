import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (consultationId: string, type: string) => void;
}

interface LawyerOption {
  user_id: string;
  nama: string;
  isOnline: boolean;
  isOnConsultation: boolean;
}

export default function CreateConsultationModal({ open, onClose, onCreated }: Props) {
  const { role, user } = useAuth();
  const [jenisLayananOptions, setJenisLayananOptions] = useState<{ id: string; nama: string }[]>([]);
  const [jenisHukumOptions, setJenisHukumOptions] = useState<{ id: string; nama: string }[]>([]);
  const [lawyerOptions, setLawyerOptions] = useState<LawyerOption[]>([]);
  const [handleSelf, setHandleSelf] = useState(false);
  const [nikFound, setNikFound] = useState(false);
  const [nikSearching, setNikSearching] = useState(false);

  const [form, setForm] = useState({
    namaPengguna: '',
    nik: '',
    telp: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki Laki',
    penyandangDisabilitas: 'Ya',
    namaKasus: '',
    jenisKonsultasi: role === 'client' ? 'chat' : 'offline',
    jenisLayanan: '',
    jenisHukum: '',
    tanggalKonsultasi: new Date().toISOString().split('T')[0],
    agenda: '',
    pilihLawyer: 'auto',
  });

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (field === 'nik') setNikFound(false);
  };

  // NIK lookup
  const lookupNik = async () => {
    if (form.nik.length !== 16) return;
    setNikSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('nama, nik, nomor_wa, tanggal_lahir, jenis_kelamin, penyandang_disabilitas')
      .eq('nik', form.nik)
      .limit(1);
    
    if (data && data.length > 0) {
      const p = data[0];
      setForm(prev => ({
        ...prev,
        namaPengguna: p.nama || prev.namaPengguna,
        telp: p.nomor_wa || prev.telp,
        tanggalLahir: p.tanggal_lahir || prev.tanggalLahir,
        jenisKelamin: p.jenis_kelamin || prev.jenisKelamin,
        penyandangDisabilitas: p.penyandang_disabilitas ? 'Ya' : 'Tidak',
      }));
      setNikFound(true);
      toast({ title: 'Data ditemukan', description: `Data ${p.nama} berhasil dimuat dari NIK` });
    }
    setNikSearching(false);
  };

  // Fetch master data & lawyers
  useEffect(() => {
    if (!open) return;
    setNikFound(false);
    const fetchData = async () => {
      const [layananRes, hukumRes, rolesRes] = await Promise.all([
        supabase.from('master_jenis_layanan').select('id, nama').order('nama'),
        supabase.from('master_jenis_hukum').select('id, nama').order('nama'),
        supabase.from('user_roles').select('user_id').eq('role', 'lawyer'),
      ]);
      
      const layanan = layananRes.data || [];
      const hukum = hukumRes.data || [];
      setJenisLayananOptions(layanan);
      setJenisHukumOptions(hukum);
      if (layanan.length > 0 && !form.jenisLayanan) setForm(p => ({ ...p, jenisLayanan: layanan[0].nama }));
      if (hukum.length > 0 && !form.jenisHukum) setForm(p => ({ ...p, jenisHukum: hukum[0].nama }));

      if (rolesRes.data && rolesRes.data.length > 0) {
        const lawyerIds = rolesRes.data.map(r => r.user_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, nama, last_seen_at').in('user_id', lawyerIds).eq('approval_status', 'approved');
        const now = new Date();
        const lawyers: LawyerOption[] = (profiles || []).map(p => {
          const lastSeen = p.last_seen_at ? new Date(p.last_seen_at) : null;
          const isOnline = lastSeen ? (now.getTime() - lastSeen.getTime()) < 24 * 60 * 60 * 1000 : false;
          return { user_id: p.user_id, nama: p.nama, isOnline, isOnConsultation: false };
        });
        setLawyerOptions(lawyers);
      }
    };
    fetchData();
  }, [open]);

  const consultationTypes = role === 'client'
    ? [{ value: 'chat', label: 'Chat' }, { value: 'video_call', label: 'Video Call' }]
    : [{ value: 'offline', label: 'Offline' }, { value: 'chat', label: 'Chat' }, { value: 'video_call', label: 'Video Call' }];

  const isLawyer = role === 'lawyer';
  const isAdminOrSuperadmin = role === 'admin' || role === 'superadmin';
  const isClient = role === 'client';

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaPengguna.trim() || !form.namaKasus.trim()) {
      toast({ title: 'Error', description: 'Nama Pengguna dan Nama Kasus wajib diisi', variant: 'destructive' });
      return;
    }
    if (form.nik && form.nik.length !== 16) {
      toast({ title: 'Error', description: 'NIK harus tepat 16 digit', variant: 'destructive' });
      return;
    }

    setSaving(true);

    // Determine lawyer_user_id
    let lawyerUserId: string | null = null;
    if (isLawyer) {
      lawyerUserId = user?.id || null;
    } else if (isAdminOrSuperadmin) {
      if (handleSelf) {
        lawyerUserId = user?.id || null;
      } else if (form.pilihLawyer !== 'auto') {
        lawyerUserId = form.pilihLawyer;
      } else {
        const available = lawyerOptions.find(l => l.isOnline && !l.isOnConsultation);
        lawyerUserId = available?.user_id || null;
      }
    } else {
      const available = lawyerOptions.find(l => l.isOnline && !l.isOnConsultation);
      lawyerUserId = available?.user_id || null;
    }

    const { data, error } = await supabase.from('consultations').insert({
      client_user_id: isClient ? user?.id : null,
      lawyer_user_id: lawyerUserId,
      client_name: form.namaPengguna,
      case_name: form.namaKasus,
      consultation_type: form.jenisKonsultasi as any,
      service_type: form.jenisLayanan || null,
      law_type: form.jenisHukum || null,
      date: form.tanggalKonsultasi,
      agenda: form.agenda,
      nik: form.nik || null,
      telp: form.telp || null,
      tanggal_lahir: form.tanggalLahir || null,
      jenis_kelamin: form.jenisKelamin,
      penyandang_disabilitas: form.penyandangDisabilitas === 'Ya',
    }).select('id, consultation_type').single();

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Berhasil', description: 'Konsultasi baru berhasil dibuat' });
    onClose();
    
    if (data) {
      if (isLawyer && form.jenisKonsultasi === 'offline') {
        onCreated?.(data.id, 'offline');
      } else {
        onCreated?.(data.id, form.jenisKonsultasi);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          <DialogTitle className="text-center text-lg font-bold">Buat Konsultasi Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 space-y-4 sm:space-y-5">
          {/* Row 1 - NIK with lookup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">NIK (16 digit)</Label>
              <div className="flex gap-2">
                <Input value={form.nik} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); update('nik', v); }} placeholder="Masukkan 16 digit NIK" maxLength={16} className="flex-1" />
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={lookupNik} disabled={form.nik.length !== 16 || nikSearching}>
                  {nikFound ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {form.nik.length > 0 && form.nik.length < 16 && <p className="text-xs text-destructive">{form.nik.length}/16 digit</p>}
              {nikFound && <p className="text-xs text-emerald-600 font-medium">✓ Data ditemukan & dimuat</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nama Pengguna</Label>
              <Input value={form.namaPengguna} onChange={(e) => update('namaPengguna', e.target.value)} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Telp</Label>
              <Input value={form.telp} onChange={(e) => update('telp', e.target.value)} />
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
              <Input value={form.namaKasus} onChange={(e) => update('namaKasus', e.target.value)} />
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
                <SelectTrigger><SelectValue placeholder="Pilih jenis layanan" /></SelectTrigger>
                <SelectContent>
                  {jenisLayananOptions.length === 0 ? (
                    <SelectItem value="_empty" disabled>Belum ada data</SelectItem>
                  ) : (
                    jenisLayananOptions.map((l) => (
                      <SelectItem key={l.id} value={l.nama}>{l.nama}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Jenis Hukum</Label>
              <Select value={form.jenisHukum} onValueChange={(v) => update('jenisHukum', v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis hukum" /></SelectTrigger>
                <SelectContent>
                  {jenisHukumOptions.length === 0 ? (
                    <SelectItem value="_empty" disabled>Belum ada data</SelectItem>
                  ) : (
                    jenisHukumOptions.map((h) => (
                      <SelectItem key={h.id} value={h.nama}>{h.nama}</SelectItem>
                    ))
                  )}
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

          {/* Lawyer picker */}
          {isLawyer ? (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm font-semibold text-foreground">Lawyer yang menangani</p>
              <p className="text-xs text-muted-foreground mt-0.5">Anda otomatis yang menangani konsultasi ini</p>
            </div>
          ) : isClient ? (
            <div className="bg-muted/50 rounded-lg p-3 border">
              <p className="text-sm font-semibold text-foreground">Pilih Lawyer</p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-2">Lawyer akan dipilih otomatis berdasarkan ketersediaan</p>
              <div className="flex flex-wrap gap-1.5">
                {lawyerOptions.filter(l => l.isOnline && !l.isOnConsultation).length > 0 ? (
                  lawyerOptions.filter(l => l.isOnline).map(l => (
                    <span key={l.user_id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border text-xs">
                      <span className={`h-1.5 w-1.5 rounded-full ${l.isOnConsultation ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      {l.nama}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Tidak ada lawyer yang online saat ini</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox id="handleSelf" checked={handleSelf} onCheckedChange={(v) => setHandleSelf(!!v)} />
                <label htmlFor="handleSelf" className="text-sm font-semibold cursor-pointer">Saya sendiri yang menangani</label>
              </div>
              {!handleSelf && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Pilih Lawyer</Label>
                  <Select value={form.pilihLawyer} onValueChange={(v) => update('pilihLawyer', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">🔄 Pilih Lawyer Otomatis</SelectItem>
                      {lawyerOptions.map((l) => (
                        <SelectItem key={l.user_id} value={l.user_id} disabled={l.isOnConsultation}>
                          <span className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${l.isOnConsultation ? 'bg-amber-400' : l.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                            {l.nama}
                            {l.isOnConsultation && <span className="text-[10px] text-amber-600 ml-1">(Busy)</span>}
                            {!l.isOnline && !l.isOnConsultation && <span className="text-[10px] text-muted-foreground ml-1">(Offline)</span>}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-sm font-bold" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
