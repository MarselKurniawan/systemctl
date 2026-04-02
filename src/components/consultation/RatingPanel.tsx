import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function RatingPanel() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  const submit = () => {
    if (rating === 0) { toast.error('Silakan pilih rating terlebih dahulu'); return; }
    toast.success('Rating berhasil dikirim!');
  };

  const stickers = ['😞', '😐', '🙂', '😊', '🤩'];

  return (
    <div className="glass-card rounded-xl p-5 space-y-5">
      <h3 className="font-bold text-lg tracking-tight">Beri Rating Pengacara</h3>

      <div>
        <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Rating</p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="transition-all duration-150 hover:scale-125 active:scale-95"
            >
              <Star className={`h-8 w-8 ${i <= (hover || rating) ? 'fill-secondary text-secondary' : 'text-border'}`} />
            </button>
          ))}
        </div>
      </div>

      {rating > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/50">
          <span className="text-3xl">{stickers[rating - 1]}</span>
          <span className="text-sm font-medium text-accent-foreground">
            {['Kurang', 'Cukup', 'Baik', 'Bagus', 'Luar Biasa'][rating - 1]}
          </span>
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Ulasan</p>
        <Textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Bagaimana pengalaman Anda?"
          rows={3}
          className="resize-none bg-muted/50 border-0"
        />
      </div>

      <Button onClick={submit} className="w-full gap-2 font-semibold">
        <Send className="h-4 w-4" /> Kirim Rating
      </Button>
    </div>
  );
}
