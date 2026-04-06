import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

interface LawyerOption {
  user_id: string;
  nama: string;
  isOnline: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  consultationId: string;
  onAssigned: () => void;
}

export default function AssignLawyerModal({ open, onClose, consultationId, onAssigned }: Props) {
  const [lawyers, setLawyers] = useState<LawyerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'lawyer');
      if (roles && roles.length > 0) {
        const ids = roles.map(r => r.user_id);
        const { data: profiles } = await supabase.from('profiles').select('user_id, nama, last_seen_at').in('user_id', ids).eq('approval_status', 'approved');
        const now = new Date();
        setLawyers((profiles || []).map(p => ({
          user_id: p.user_id,
          nama: p.nama,
          isOnline: p.last_seen_at ? (now.getTime() - new Date(p.last_seen_at).getTime()) < 24 * 60 * 60 * 1000 : false,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [open]);

  const assign = async (lawyerUserId: string) => {
    setAssigning(lawyerUserId);
    const { error } = await supabase.from('consultations').update({ lawyer_user_id: lawyerUserId }).eq('id', consultationId);
    setAssigning(null);
    if (error) {
      toast.error('Gagal assign lawyer');
    } else {
      toast.success('Lawyer berhasil di-assign');
      onAssigned();
      onClose();
    }
  };

  const onlineLawyers = lawyers.filter(l => l.isOnline);
  const offlineLawyers = lawyers.filter(l => !l.isOnline);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Assign Pengacara
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Memuat data pengacara...</p>
        ) : lawyers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Tidak ada pengacara terdaftar</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {onlineLawyers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Online</p>
                <div className="space-y-2">
                  {onlineLawyers.map(l => (
                    <div key={l.user_id} className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/50 border-emerald-200">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-medium">{l.nama}</span>
                      </div>
                      <Button size="sm" className="h-7 text-xs" onClick={() => assign(l.user_id)} disabled={assigning === l.user_id}>
                        {assigning === l.user_id ? '...' : 'Assign'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {offlineLawyers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Offline</p>
                <div className="space-y-2">
                  {offlineLawyers.map(l => (
                    <div key={l.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                        <span className="text-sm font-medium text-muted-foreground">{l.nama}</span>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => assign(l.user_id)} disabled={assigning === l.user_id}>
                        {assigning === l.user_id ? '...' : 'Assign'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
