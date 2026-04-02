import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Profile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

// Notification sound using Web Audio API
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First beep
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.frequency.value = 800;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.3);

    // Second beep (higher pitch)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.frequency.value = 1000;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio notification not supported');
  }
}

export default function UserApprovalPage() {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevCountRef = useRef<number | null>(null);

  const fetchPending = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
    const newData = (data as Profile[]) || [];
    
    // Check if there are new registrations
    if (prevCountRef.current !== null && newData.length > prevCountRef.current) {
      const newCount = newData.length - prevCountRef.current;
      if (soundEnabled) playNotificationSound();
      toast.info(`🔔 ${newCount} pendaftaran baru masuk!`, {
        description: newData[0]?.nama ? `${newData[0].nama} baru saja mendaftar` : undefined,
        duration: 5000,
      });
    }
    prevCountRef.current = newData.length;
    
    setPendingUsers(newData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();

    // Realtime subscription for new registrations
    const channel = supabase
      .channel('pending-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload: any) => {
        if (payload.new.approval_status === 'pending') {
          fetchPending();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Persetujuan User</h1>
          <p className="text-sm text-muted-foreground mt-1">Setujui atau tolak pendaftaran user baru</p>
        </div>
        <Button
          variant={soundEnabled ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            toast.info(soundEnabled ? 'Notifikasi suara dimatikan' : 'Notifikasi suara diaktifkan');
          }}
        >
          {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {soundEnabled ? 'Suara On' : 'Suara Off'}
        </Button>
      </div>

      {pendingUsers.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Tidak ada pendaftaran yang menunggu persetujuan</p>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600 animate-pulse" />
            <p className="text-sm text-amber-800 font-medium">
              {pendingUsers.length} pendaftaran menunggu persetujuan
            </p>
          </div>
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
                        {p.jenis_kelamin && (
                          <span className="flex items-center gap-1">
                            {p.jenis_kelamin === 'Perempuan' ? (
                              <svg className="h-3 w-3 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg>
                            ) : (
                              <svg className="h-3 w-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="14" r="5"/><path d="M19 5l-4.5 4.5M19 5h-5M19 5v5"/></svg>
                            )}
                            {p.jenis_kelamin}
                          </span>
                        )}
                        {p.penyandang_disabilitas && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">
                            ♿ Disabilitas
                          </span>
                        )}
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
        </>
      )}
    </div>
  );
}
