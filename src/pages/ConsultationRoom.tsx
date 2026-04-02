import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ChevronRight, Home, Camera, MessageCircle, Video, StopCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { consultations } from '@/data/mockData';
import { useTimer } from '@/hooks/useTimer';
import ChatRoom from '@/components/consultation/ChatRoom';
import ConsultationDetail from '@/components/consultation/ConsultationDetail';
import RatingPanel from '@/components/consultation/RatingPanel';
import CameraModal from '@/components/consultation/CameraModal';
import ConsultationTimer from '@/components/consultation/ConsultationTimer';

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
      <div className="flex flex-col items-center justify-center py-24 animate-slide-in">
        <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="font-bold text-lg mb-1">Konsultasi tidak ditemukan</p>
        <p className="text-sm text-muted-foreground mb-5">Data yang Anda cari tidak tersedia</p>
        <Link to="/">
          <Button variant="outline" className="gap-2 rounded-xl"><ArrowLeft className="h-4 w-4" /> Kembali</Button>
        </Link>
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

  const showStartButton = () => {
    if (isOffline && !started) return (
      <Button onClick={handleStartOffline} className="gap-2 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20">
        <Camera className="h-4 w-4" /> Mulai Konsultasi
      </Button>
    );
    if (isChat && !chatOpen && !ended) return (
      <Button onClick={handleStartChat} className="gap-2 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20">
        <MessageCircle className="h-4 w-4" /> Buka Chat
      </Button>
    );
    if (isVideo && !started) return (
      <Button onClick={handleStartVideo} className="gap-2 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20">
        <Video className="h-4 w-4" /> Mulai Video
      </Button>
    );
    return null;
  };

  const showEndButton = () => {
    if (ended) return null;
    if (isOffline && started) return (
      <Button variant="destructive" onClick={handleEndOffline} className="gap-2 h-10 rounded-xl font-semibold">
        <StopCircle className="h-4 w-4" /> Akhiri
      </Button>
    );
    if (isChat && chatOpen) return (
      <Button variant="destructive" onClick={handleEndChat} className="gap-2 h-10 rounded-xl font-semibold">
        <StopCircle className="h-4 w-4" /> Akhiri
      </Button>
    );
    if (isVideo && started) return (
      <Button variant="destructive" onClick={handleEndVideo} className="gap-2 h-10 rounded-xl font-semibold">
        <StopCircle className="h-4 w-4" /> Akhiri
      </Button>
    );
    return null;
  };

  return (
    <div className="space-y-5 animate-slide-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <Link to="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
          <Home className="h-3.5 w-3.5" /> Home
        </Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <Link to="/" className="hover:text-foreground transition-colors">Konsultasi</Link>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-semibold">Detail</span>
      </nav>

      {/* Header bar */}
      <div className="glass-elevated rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Ruang Konsultasi</h1>
            <p className="text-xs text-muted-foreground">{consultation.clientName} — {consultation.caseName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {(started || ended) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/70">
              <ConsultationTimer formatted={timer.formatted} isRunning={timer.isRunning} />
            </div>
          )}
          {showStartButton()}
          {showEndButton()}
        </div>
      </div>

      {/* Main grid - responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Chat / Main area */}
        <div className={`${isVideo && started && !ended ? 'lg:col-span-4' : 'lg:col-span-5'} glass-elevated rounded-2xl overflow-hidden flex flex-col min-h-[420px] lg:min-h-[520px]`}>
          {(isChat || isVideo) && chatOpen ? (
            <ChatRoom clientName={consultation.clientName} disabled={ended} />
          ) : isOffline && started ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-5">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Camera className="h-10 w-10 text-primary/60" />
              </div>
              {ended ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <span className="text-success text-xl">✓</span>
                  </div>
                  <p className="font-semibold text-success">Konsultasi Selesai</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">Konsultasi Offline Berlangsung</p>
                  <p className="text-xs text-muted-foreground text-center max-w-[220px]">Sesi konsultasi sedang berjalan. Klik "Akhiri" untuk mengakhiri sesi.</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="h-20 w-20 rounded-3xl bg-muted/60 flex items-center justify-center mb-4">
                {isOffline ? <Camera className="h-8 w-8 text-muted-foreground/40" /> : isChat ? <MessageCircle className="h-8 w-8 text-muted-foreground/40" /> : <Video className="h-8 w-8 text-muted-foreground/40" />}
              </div>
              <p className="text-sm font-semibold text-muted-foreground">Belum dimulai</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Klik tombol di atas untuk memulai sesi</p>
            </div>
          )}
        </div>

        {/* Middle: Details */}
        <div className={`${isVideo && started && !ended ? 'lg:col-span-4' : 'lg:col-span-4'}`}>
          <ConsultationDetail
            consultation={consultation}
            timerFormatted={timer.formatted}
            timerRunning={timer.isRunning}
          />
        </div>

        {/* Right: Video / Rating */}
        <div className={`${isVideo && started && !ended ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-5`}>
          {isVideo && started && !ended && (
            <div className="glass-elevated rounded-2xl p-5 space-y-4">
              <h3 className="font-bold tracking-tight">Video Call</h3>
              <div className="aspect-video rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/[0.02] flex items-center justify-center border border-dashed border-border">
                <div className="text-center">
                  <Video className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-[11px] text-muted-foreground/50 font-medium">Preview Area</p>
                </div>
              </div>
              <Button className="w-full gap-2 h-11 rounded-xl font-semibold" onClick={() => window.open('https://meet.google.com', '_blank')}>
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
