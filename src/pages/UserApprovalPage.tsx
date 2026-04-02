import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

export default function UserApprovalPage() {
  const { user, role } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    setPendingUsers((data as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();

    // Realtime subscription for new registrations
    const channel = supabase
      .channel('pending-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: 'approval_status=eq.pending' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleApproval = async (profile: Profile, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: status,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Gagal memperbarui status: ' + error.message);
    } else {
      toast.success(status === 'approved' ? `${profile.nama} berhasil disetujui` : `${profile.nama} ditolak`);
      fetchPending();
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Memuat data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Persetujuan User</h1>
        <p className="text-sm text-muted-foreground mt-1">Setujui atau tolak pendaftaran user baru</p>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada pendaftaran yang menunggu persetujuan</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{p.nama || 'Tanpa Nama'}</p>
                    <p className="text-xs text-muted-foreground">{p.email}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {p.nik && <span>NIK: {p.nik}</span>}
                      {p.nomor_wa && <span>WA: {p.nomor_wa}</span>}
                      {p.tanggal_lahir && <span>Lahir: {p.tanggal_lahir}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">Menunggu persetujuan</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleApproval(p, 'rejected')}>
                    <XCircle className="h-4 w-4 mr-1" /> Tolak
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApproval(p, 'approved')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Setujui
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
