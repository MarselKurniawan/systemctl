import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Clock, User, FileText, Scale, Calendar, ArrowLeft, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConsultation } from '@/hooks/useConsultations';
import { useTimer, formatDurationText } from '@/hooks/useTimer';
import { useAuth } from '@/contexts/AuthContext';
import JitsiRoom from '@/components/consultation/JitsiRoom';

const statusLabel: Record<string, string> = { pending: 'Belum Mulai', in_progress: 'Sedang Berlangsung', completed: 'Selesai' };

export default function VideoCallPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { consultation, loading, updateConsultation } = useConsultation(id);
  const startTimeFromDB = consultation?.startTime || null;
  const timer = useTimer(consultation?.status === 'in_progress' ? startTimeFromDB : null);
  const [detailOpen, setDetailOpen] = useState(false);

  const jitsiRoomName = `consultation_${id?.replace(/-/g, '_')}`;
  const displayName = profile?.nama || 'User';

  const handleEnd = useCallback(() => {
    const durationMins = Math.max(1, Math.floor(timer.seconds / 60));
    updateConsultation({ status: 'completed', duration: durationMins, end_time: new Date().toISOString() });
    timer.stop();
    navigate(`/consultation/${id}`);
  }, [timer, updateConsultation, navigate, id]);

  const handleClose = useCallback(() => {
    navigate(`/consultation/${id}`);
  }, [navigate, id]);

  if (loading || !consultation) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Full-screen Jitsi */}
      <div className="absolute inset-0">
        <JitsiRoom roomName={jitsiRoomName} displayName={displayName} onClose={handleClose} />
      </div>

      {/* Floating timer bar - top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black/70 backdrop-blur-md text-white rounded-full px-5 py-2 flex items-center gap-3 shadow-lg border border-white/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <Clock className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-sm font-bold tracking-wider">{timer.formatted}</span>
          <div className="w-px h-5 bg-white/20" />
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white hover:bg-white/20 h-7 text-xs gap-1 px-2"
            onClick={() => setDetailOpen(!detailOpen)}
          >
            Detail {detailOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <div className="w-px h-5 bg-white/20" />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-7 text-xs gap-1 px-2"
            onClick={handleEnd}
          >
            <StopCircle className="h-3.5 w-3.5" /> Akhiri
          </Button>
        </div>
      </div>

      {/* Floating detail panel */}
      {detailOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-80 max-w-[90vw]">
          <div className="bg-black/80 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold border-b border-white/10 pb-2">Detail Konsultasi</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { icon: User, label: 'Klien', value: consultation.clientName },
                { icon: FileText, label: 'Kasus', value: consultation.caseName },
                { icon: Scale, label: 'Jenis Hukum', value: consultation.lawType || '-' },
                { icon: Calendar, label: 'Tanggal', value: consultation.date },
                { icon: FileText, label: 'Agenda', value: consultation.agenda || '-' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="h-3.5 w-3.5 text-white/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">{item.label}</p>
                    <p className="text-white/90">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase">Status</span>
              <span className="text-xs font-semibold text-emerald-400">{statusLabel[consultation.status]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
