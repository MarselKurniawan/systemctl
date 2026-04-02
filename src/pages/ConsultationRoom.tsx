import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronRight, Home, Camera, MessageCircle, Video, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consultations } from '@/data/mockData';
import { useTimer } from '@/hooks/useTimer';
import ChatRoom from '@/components/consultation/ChatRoom';
import ConsultationDetail from '@/components/consultation/ConsultationDetail';
import RatingPanel from '@/components/consultation/RatingPanel';
import CameraModal from '@/components/consultation/CameraModal';

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
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="text-5xl mb-4">🔍</div>
        <p className="font-semibold text-lg">Konsultasi tidak ditemukan</p>
        <Link to="/" className="mt-4 text-primary font-medium text-sm hover:underline">← Kembali ke daftar</Link>
      </div>
    );
  }

  const isOffline = consultation.consultationType === 'offline';
  const isChat = consultation.consultationType === 'chat';
  const isVideo = consultation.consultationType === 'video_call';

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
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link to="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Detail Konsultasi</span>
      </nav>

      {/* Page title + action */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Ruang Konsultasi</h1>

        <div className="flex gap-2">
          {isOffline && !started && (
            <Button onClick={handleStartOffline} className="gap-2 font-semibold shadow-md">
              <Camera className="h-4 w-4" /> Mulai Konsultasi
            </Button>
          )}
          {isOffline && started && !ended && (
            <Button variant="destructive" onClick={handleEndOffline} className="gap-2 font-semibold shadow-md">
              <StopCircle className="h-4 w-4" /> Akhiri Konsultasi
            </Button>
          )}
          {isChat && !chatOpen && !ended && (
            <Button onClick={handleStartChat} className="gap-2 font-semibold shadow-md">
              <MessageCircle className="h-4 w-4" /> Buka Chat
            </Button>
          )}
          {isChat && chatOpen && !ended && (
            <Button variant="destructive" onClick={handleEndChat} className="gap-2 font-semibold shadow-md">
              <StopCircle className="h-4 w-4" /> Akhiri Konsultasi
            </Button>
          )}
          {isVideo && !started && (
            <Button onClick={handleStartVideo} className="gap-2 font-semibold shadow-md">
              <Video className="h-4 w-4" /> Mulai Video
            </Button>
          )}
          {isVideo && started && !ended && (
            <Button variant="destructive" onClick={handleEndVideo} className="gap-2 font-semibold shadow-md">
              <StopCircle className="h-4 w-4" /> Akhiri Konsultasi
            </Button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat / Offline area */}
        <div className="lg:col-span-1 glass-card rounded-xl min-h-[500px] flex flex-col overflow-hidden">
          {(isChat || isVideo) && chatOpen ? (
            <ChatRoom clientName={consultation.clientName} disabled={ended} />
          ) : isOffline && started ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-center text-sm font-medium">
                {ended ? 'Konsultasi telah selesai' : 'Konsultasi offline berlangsung'}
              </p>
              {ended && <div className="text-success font-bold text-sm">✓ Selesai</div>}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                {isOffline ? <Camera className="h-7 w-7" /> : isChat ? <MessageCircle className="h-7 w-7" /> : <Video className="h-7 w-7" />}
              </div>
              <p className="text-sm font-medium">Klik tombol untuk memulai konsultasi</p>
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-1">
          <ConsultationDetail
            consultation={consultation}
            timerFormatted={timer.formatted}
            timerRunning={timer.isRunning}
          />
        </div>

        {/* Video + Rating */}
        <div className="lg:col-span-1 space-y-5">
          {isVideo && started && !ended && (
            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-lg tracking-tight">Video Call</h3>
              <div className="aspect-video bg-foreground/5 rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <Video className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">Preview area</p>
                </div>
              </div>
              <Button className="w-full gap-2 font-semibold" onClick={() => window.open('https://meet.google.com', '_blank')}>
                <Video className="h-4 w-4" /> Join Video Call
              </Button>
            </div>
          )}
          {(ended || consultation.status === 'completed') && <RatingPanel />}
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
