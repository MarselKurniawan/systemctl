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
  const emojis = ['😞', '😐', '🙂', '😊', '🤩'];

  return (
    <div className="glass-elevated rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b bg-muted/20">
        <h3 className="font-bold tracking-tight">Beri Rating</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bagikan pengalaman Anda</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Stars */}
        <div className="flex items-center gap-2 justify-center py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="transition-all duration-150 hover:scale-125 active:scale-95"
            >
              <Star className={`h-8 w-8 transition-colors ${i <= (hover || rating) ? 'fill-secondary text-secondary' : 'text-border'}`} />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/60 justify-center animate-slide-in">
            <span className="text-2xl">{emojis[rating - 1]}</span>
            <span className="text-sm font-semibold text-accent-foreground">{labels[rating - 1]}</span>
          </div>
        )}

        {/* Review */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tulis ulasan Anda..."
          rows={3}
          className="w-full rounded-xl bg-muted/40 border-0 p-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
        />

        <Button onClick={submit} className="w-full gap-2 h-11 rounded-xl font-semibold">
          <Send className="h-4 w-4" /> Kirim Rating
        </Button>
      </div>
    </div>
  );
}
