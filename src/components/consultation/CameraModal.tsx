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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      alert('Tidak dapat mengakses kamera. Silakan gunakan upload foto.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setCaptured(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  }, [stopCamera]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCaptured(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (captured) { onCapture(captured); setCaptured(null); onClose(); }
  };

  const handleClose = () => { stopCamera(); setCaptured(null); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-in">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold tracking-tight">{title}</h3>
          <button onClick={handleClose} className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {captured ? (
            <div className="space-y-4">
              <img src={captured} alt="Captured" className="w-full rounded-xl" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-10 rounded-xl" onClick={() => setCaptured(null)}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Ulangi
                </Button>
                <Button className="flex-1 h-10 rounded-xl" onClick={handleConfirm}>
                  <Check className="h-4 w-4 mr-2" /> Konfirmasi
                </Button>
              </div>
            </div>
          ) : cameraActive ? (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-foreground" />
              <Button className="w-full h-11 rounded-xl" onClick={takePhoto}>
                <Camera className="h-4 w-4 mr-2" /> Ambil Foto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-10">
                <div className="h-20 w-20 rounded-3xl bg-muted/60 flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground text-center max-w-[240px]">
                  Ambil foto atau upload gambar sebagai bukti konsultasi
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-11 rounded-xl" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" /> Buka Kamera
                </Button>
                <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Upload
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
