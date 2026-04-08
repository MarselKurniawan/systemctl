import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Consultation } from '@/types/consultation';

// Map DB row to Consultation interface
function mapRow(row: any): Consultation {
  return {
    id: row.id,
    no: 0, // will be set by caller
    clientName: row.client_name,
    caseName: row.case_name,
    consultationType: row.consultation_type,
    serviceType: row.service_type || 'Layanan Konsultasi (Non-SKTM)',
    lawType: row.law_type || 'Perdata',
    date: new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    status: row.status,
    agenda: row.agenda || '',
    lawyerName: row.lawyer_name,
    duration: row.duration || 0,
    startPhoto: row.start_photo || undefined,
    endPhoto: row.end_photo || undefined,
    rating: row.rating || undefined,
    review: row.review || undefined,
    nik: row.nik || undefined,
    telp: row.telp || undefined,
    tanggalLahir: row.tanggal_lahir || undefined,
    jenisKelamin: row.jenis_kelamin || undefined,
    penyandangDisabilitas: row.penyandang_disabilitas || false,
    clientUserId: row.client_user_id || undefined,
    lawyerUserId: row.lawyer_user_id || undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
  };
}

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, role } = useAuth();

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('consultations')
      .select('*')
      .order('created_at', { ascending: false });

    // Role-based filtering
    if (role === 'lawyer' && user) {
      query = query.eq('lawyer_user_id', user.id);
    } else if (role === 'client' && user) {
      query = query.eq('client_user_id', user.id);
    }
    // superadmin & admin see all

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching consultations:', error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      // Fetch lawyer names
      const lawyerIds = [...new Set(data.filter(d => d.lawyer_user_id).map(d => d.lawyer_user_id!))];
      let lawyerMap: Record<string, string> = {};
      if (lawyerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, nama')
          .in('user_id', lawyerIds);
        if (profiles) {
          profiles.forEach(p => { lawyerMap[p.user_id] = p.nama; });
        }
      }

      const mapped = data.map((row, i) => {
        const c = mapRow({ ...row, lawyer_name: row.lawyer_user_id ? lawyerMap[row.lawyer_user_id] || 'Lawyer' : undefined });
        c.no = i + 1;
        return c;
      });
      setConsultations(mapped);
    } else {
      setConsultations([]);
    }
    setLoading(false);
  }, [user, role]);

  useEffect(() => {
    fetchConsultations();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('consultations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultations' }, () => {
        fetchConsultations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConsultations]);

  return { consultations, loading, refetch: fetchConsultations };
}

export function useConsultation(id: string | undefined) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConsultation = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      setConsultation(null);
      setLoading(false);
      return;
    }

    // Fetch lawyer name
    let lawyerName: string | undefined;
    if (data.lawyer_user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nama')
        .eq('user_id', data.lawyer_user_id)
        .single();
      lawyerName = profile?.nama;
    }

    const mapped = mapRow({ ...data, lawyer_name: lawyerName });
    mapped.no = 1;
    setConsultation(mapped);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchConsultation(); }, [fetchConsultation]);

  const updateConsultation = async (updates: Partial<{
    agenda: string; case_name: string; client_name: string; client_user_id: string;
    consultation_type: 'chat' | 'offline' | 'video_call'; date: string; duration: number;
    end_photo: string; end_time: string; jenis_kelamin: string; law_type: string;
    lawyer_user_id: string; nik: string; penyandang_disabilitas: boolean; rating: number;
    review: string; service_type: string; start_photo: string; start_time: string;
    status: 'pending' | 'in_progress' | 'completed'; tanggal_lahir: string; telp: string;
  }>) => {
    if (!id) return;
    const { error } = await supabase
      .from('consultations')
      .update(updates)
      .eq('id', id);
    if (!error) fetchConsultation();
    return error;
  };

  return { consultation, loading, refetch: fetchConsultation, updateConsultation };
}
