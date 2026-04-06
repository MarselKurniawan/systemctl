import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Listens for new profile inserts with approval_status='pending'
 * and shows a toast notification for admin/superadmin/lawyer users.
 */
export function useNewRegistrationNotifier() {
  const { role, user } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!user || !role || !['superadmin', 'admin', 'lawyer'].includes(role)) return;

    // Skip notifications from the initial subscription setup
    const setupTime = Date.now();

    const channel = supabase
      .channel('new-registration-notifier')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
          filter: 'approval_status=eq.pending',
        },
        (payload) => {
          // Only show for events after subscription was set up
          if (Date.now() - setupTime < 2000) return;
          const newProfile = payload.new as any;
          toast.info(`Pendaftaran baru: ${newProfile.nama || 'User baru'}`, {
            description: `NIK: ${newProfile.nik || '-'} • Menunggu persetujuan`,
            duration: 8000,
            action: {
              label: 'Lihat',
              onClick: () => {
                window.location.href = '/users/approval';
              },
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);
}
