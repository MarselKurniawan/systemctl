import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RatingPanel() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const submit = () => {
    if (rating === 0) { toast.error('Pilih rating terlebih dahulu'); return; }
    toast.success('Rating berhasil dikirim!');
  };

  const labels = ['Buruk', 'Kurang', 'Cukup', 'Baik', 'Luar Biasa'];

  return (
    <div className="bg-card rounded-lg border">
      <div className="px-4 py-3 border-b">
        <h3 className="font-bold text-sm">Beri Rating Pengacara</h3>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star className={`h-7 w-7 ${i <= (hover || rating) ? 'fill-secondary text-secondary' : 'text-muted'}`} />
              </button>
            ))}
          </div>
          {rating > 0 && <p className="text-xs font-medium text-muted-foreground mt-1.5">{labels[rating - 1]}</p>}
        </div>

        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Ulasan</p>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tulis ulasan Anda..."
            rows={3}
            className="w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none transition"
          />
        </div>

        <Button onClick={submit} className="w-full gap-2 h-9 font-semibold text-sm">
          <Send className="h-3.5 w-3.5" /> Kirim Rating
        </Button>
      </div>
    </div>
  );
}
