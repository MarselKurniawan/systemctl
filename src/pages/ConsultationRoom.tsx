import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronRight, Home, Camera, MessageCircle, Video, StopCircle, ArrowLeft, Clock, User, FileText, Calendar, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consultations } from '@/data/mockData';
import { useTimer } from '@/hooks/useTimer';
import ChatRoom from '@/components/consultation/ChatRoom';
import RatingPanel from '@/components/consultation/RatingPanel';
import CameraModal from '@/components/consultation/CameraModal';

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
};
const statusLabel: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };
const typeLabel: Record<string, string> = { chat: 'Chat Online', offline: 'Offline', video_call: 'Video Call' };

export default function ConsultationRoom() {
  const { id } = useParams();
  const consultation = consultations.find((c) => c.id === id);
  const timer = useTimer();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'start' | 'end'>('start');
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="font-bold text-lg mb-2">Konsultasi tidak ditemukan</p>
        <Link to="/" className="text-primary text-sm font-medium hover:underline">← Kembali</Link>
      </div>
    );
  }

  const isOffline = consultation.consultationType === 'offline';
  const isChat = consultation.consultationType === 'chat';
  const isVideo = consultation.consultationType === 'video_call';
  const showRating = ended || consultation.status === 'completed';

  const handleStartOffline = () => { setCameraMode('start'); setCameraOpen(true); };
  const handleEndOffline = () => { setCameraMode('end'); setCameraOpen(true); };
  const handleCameraCapture = () => {
    if (cameraMode === 'start') { setStarted(true); timer.start(); }
    else { setEnded(true); timer.stop(); }
  };
  const handleStartChat = () => { setChatOpen(true); setStarted(true); timer.start(); };
  const handleEndChat = () => { setChatOpen(false); setEnded(true); timer.stop(); };
  const handleStartVideo = () => { setChatOpen(true); setStarted(true); timer.start(); };
  const handleEndVideo = () => { setEnded(true); timer.stop(); };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground flex items-center gap-1"><Home className="h-3 w-3" /> Home</Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <Link to="/" className="hover:text-foreground">Konsultasi</Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-medium">Detail</span>
      </nav>

      {/* Top bar */}
      <div className="bg-card rounded-lg border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-lg font-bold">Ruang Konsultasi</h1>
            <p className="text-xs text-muted-foreground">{consultation.clientName} — {consultation.caseName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {(started || ended) && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
              {timer.isRunning && <span className="h-2 w-2 rounded-full bg-success animate-pulse-live" />}
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-sm font-bold text-primary">{timer.formatted}</span>
            </div>
          )}
          {isOffline && !started && <Button onClick={handleStartOffline} className="gap-2 h-9 text-sm font-semibold"><Camera className="h-4 w-4" /> Mulai Konsultasi</Button>}
          {isOffline && started && !ended && <Button variant="destructive" onClick={handleEndOffline} className="gap-2 h-9 text-sm font-semibold"><StopCircle className="h-4 w-4" /> Akhiri</Button>}
          {isChat && !chatOpen && !ended && <Button onClick={handleStartChat} className="gap-2 h-9 text-sm font-semibold"><MessageCircle className="h-4 w-4" /> Buka Chat</Button>}
          {isChat && chatOpen && !ended && <Button variant="destructive" onClick={handleEndChat} className="gap-2 h-9 text-sm font-semibold"><StopCircle className="h-4 w-4" /> Akhiri</Button>}
          {isVideo && !started && <Button onClick={handleStartVideo} className="gap-2 h-9 text-sm font-semibold"><Video className="h-4 w-4" /> Mulai Video</Button>}
          {isVideo && started && !ended && <Button variant="destructive" onClick={handleEndVideo} className="gap-2 h-9 text-sm font-semibold"><StopCircle className="h-4 w-4" /> Akhiri</Button>}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: main area - chat/offline/video */}
        <div className="lg:col-span-3 space-y-5">
          {/* Chat or main panel */}
          <div className="bg-card rounded-lg border overflow-hidden" style={{ minHeight: '460px' }}>
            {(isChat || isVideo) && chatOpen ? (
              <div className="h-[460px] flex flex-col">
                <ChatRoom clientName={consultation.clientName} disabled={ended} />
              </div>
            ) : isOffline && started ? (
              <div className="h-[460px] flex flex-col items-center justify-center p-8 space-y-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="h-7 w-7 text-primary/50" />
                </div>
                {ended ? (
                  <div className="text-center">
                    <p className="font-semibold text-success">✓ Konsultasi Selesai</p>
                    <p className="text-xs text-muted-foreground mt-1">Sesi telah berakhir</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold">Konsultasi Offline Berlangsung</p>
                    <p className="text-xs text-muted-foreground mt-1">Sesi sedang berjalan</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[460px] flex flex-col items-center justify-center p-8">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center mb-3">
                  {isOffline ? <Camera className="h-6 w-6 text-muted-foreground/40" /> :
                   isChat ? <MessageCircle className="h-6 w-6 text-muted-foreground/40" /> :
                   <Video className="h-6 w-6 text-muted-foreground/40" />}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Belum dimulai</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Klik tombol di atas untuk memulai sesi</p>
              </div>
            )}
          </div>

          {/* Video call button */}
          {isVideo && started && !ended && (
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">Video Call</h3>
                  <p className="text-xs text-muted-foreground">Bergabung ke sesi video call</p>
                </div>
                <Button className="gap-2 h-9 text-sm font-semibold" onClick={() => window.open('https://meet.google.com', '_blank')}>
                  <Video className="h-4 w-4" /> Join Video Call
                </Button>
              </div>
            </div>
          )}

          {/* Rating (below chat on larger screens) */}
          {showRating && (
            <div className="lg:hidden">
              <RatingPanel />
            </div>
          )}
        </div>

        {/* Right: detail + rating */}
        <div className="lg:col-span-2 space-y-5">
          {/* Detail card */}
          <div className="bg-card rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-bold text-sm">Detail Konsultasi</h3>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${statusStyle[consultation.status]}`}>
                  {statusLabel[consultation.status]}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">
                  {typeLabel[consultation.consultationType]}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* People */}
              {[
                { role: 'Pengacara', name: consultation.lawyerName || 'Lawyer' },
                { role: 'Klien', name: consultation.clientName },
              ].map((p) => (
                <div key={p.role} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{p.role}</p>
                    <p className="text-sm font-medium">{p.name}</p>
                  </div>
                </div>
              ))}

              <div className="border-t my-3" />

              {/* Info items */}
              {[
                { icon: FileText, label: 'Nama Kasus', value: consultation.caseName },
                { icon: Scale, label: 'Jenis Hukum', value: consultation.lawType },
                { icon: Calendar, label: 'Tanggal', value: consultation.date },
                { icon: FileText, label: 'Agenda', value: consultation.agenda },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-[13px] font-medium">{item.value}</p>
                  </div>
                </div>
              ))}

              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Durasi</p>
                  <div className="flex items-center gap-1.5">
                    {timer.isRunning && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-live" />}
                    <span className="text-[13px] font-bold font-mono text-primary">{timer.formatted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating (right column on large) */}
          {showRating && (
            <div className="hidden lg:block">
              <RatingPanel />
            </div>
          )}
        </div>
      </div>

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
        title={cameraMode === 'start' ? 'Foto Mulai Konsultasi' : 'Foto Akhiri Konsultasi'}
      />
    </div>
  );
}
