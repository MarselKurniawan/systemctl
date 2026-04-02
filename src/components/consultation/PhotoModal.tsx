import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export default function PhotoModal({ open, onClose, imageUrl, title }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-3xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-bold text-sm">{title}</h3>
            <button onClick={onClose} className="h-7 w-7 rounded bg-muted flex items-center justify-center hover:bg-muted/80">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <img src={imageUrl} alt={title} className="w-full rounded-lg object-contain max-h-[70vh]" />
          </div>
        </div>
      </div>
    </div>
  );
}
