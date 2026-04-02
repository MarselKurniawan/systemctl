import { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  title: string;
}

export default function CameraModal({ open, onClose, onCapture, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = ms;
      setStream(ms);
      setCameraActive(true);
    } catch { alert('Tidak dapat mengakses kamera.'); }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const c = canvasRef.current;
      c.width = videoRef.current.videoWidth;
      c.height = videoRef.current.videoHeight;
      c.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setCaptured(c.toDataURL('image/jpeg'));
      stopCamera();
    }
  }, [stopCamera]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onloadend = () => setCaptured(r.result as string); r.readAsDataURL(f); }
  };

  const handleConfirm = () => { if (captured) { onCapture(captured); setCaptured(null); onClose(); } };
  const handleClose = () => { stopCamera(); setCaptured(null); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={handleClose} className="h-7 w-7 rounded bg-muted flex items-center justify-center hover:bg-muted/80">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {captured ? (
            <>
              <img src={captured} alt="Captured" className="w-full rounded-lg" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-9" onClick={() => setCaptured(null)}>
                  <RotateCcw className="h-3.5 w-3.5 mr-2" /> Ulangi
                </Button>
                <Button className="flex-1 h-9" onClick={handleConfirm}>
                  <Check className="h-3.5 w-3.5 mr-2" /> Konfirmasi
                </Button>
              </div>
            </>
          ) : cameraActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-foreground" />
              <Button className="w-full h-9" onClick={takePhoto}><Camera className="h-3.5 w-3.5 mr-2" /> Ambil Foto</Button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center py-8">
                <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <Camera className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground text-center">Ambil foto atau upload sebagai bukti</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-9" onClick={startCamera}><Camera className="h-3.5 w-3.5 mr-2" /> Buka Kamera</Button>
                <Button variant="outline" className="flex-1 h-9" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-2" /> Upload
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
