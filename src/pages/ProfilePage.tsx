import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { User, Phone, Mail, CreditCard, Calendar, Shield, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { profile, role, refreshProfile } = useAuth();
  const [nomorWa, setNomorWa] = useState(profile?.nomor_wa || '');
  const [savingWa, setSavingWa] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Administrator',
    lawyer: 'Lawyer',
    client: 'Client',
  };

  const handleUpdateWa = async () => {
    if (!profile) return;
    setSavingWa(true);
    const { error } = await supabase
      .from('profiles')
      .update({ nomor_wa: nomorWa })
      .eq('user_id', profile.user_id);
    setSavingWa(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil', description: 'Nomor WhatsApp berhasil diperbarui' });
      refreshProfile();
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password baru minimal 6 karakter', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Konfirmasi password tidak cocok', variant: 'destructive' });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil', description: 'Password berhasil diubah' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!profile) return null;

  const infoItems = [
    { icon: User, label: 'Nama', value: profile.nama },
    { icon: CreditCard, label: 'NIK', value: profile.nik || '-' },
    { icon: Mail, label: 'Email', value: profile.email || '-' },
    { icon: Calendar, label: 'Tanggal Lahir', value: profile.tanggal_lahir || '-' },
    { icon: User, label: 'Jenis Kelamin', value: profile.jenis_kelamin || '-' },
    { icon: Shield, label: 'Penyandang Disabilitas', value: profile.penyandang_disabilitas ? 'Ya' : 'Tidak' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold">Profil Saya</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {roleLabel[role || 'client']}
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3 py-2 border-b last:border-0">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium truncate">{item.value}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Edit WA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" /> Nomor WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Nomor WhatsApp</Label>
            <Input value={nomorWa} onChange={(e) => setNomorWa(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <Button onClick={handleUpdateWa} disabled={savingWa} size="sm">
            {savingWa ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ganti Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm">Password Baru</Label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Konfirmasi Password Baru</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" />
          </div>
          <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword} size="sm">
            {savingPassword ? 'Menyimpan...' : 'Ganti Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
