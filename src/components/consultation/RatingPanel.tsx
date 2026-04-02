import { useState } from 'react';
import { Star, Send, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  clientName?: string;
  consultationId?: string;
  existingRating?: number;
  existingReview?: string;
}

export default function RatingPanel({ clientName, consultationId, existingRating, existingReview }: Props) {
  const { role } = useAuth();
  const [rating, setRating] = useState(existingRating || 0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState(existingReview || '');
  const [editing, setEditing] = useState(!existingRating);
  const [saving, setSaving] = useState(false);

  const canRate = role === 'client' || role === 'admin' || role === 'superadmin';
  const canEdit = role === 'admin' || role === 'superadmin';
  const isViewOnly = !canRate;

  const submit = async () => {
    if (rating === 0) { toast.error('Pilih rating terlebih dahulu'); return; }
    if (!consultationId) { toast.success('Rating berhasil dikirim!'); setEditing(false); return; }
    
    setSaving(true);
    const { error } = await supabase.from('consultations').update({
      rating,
      review: review || null,
    }).eq('id', consultationId);
    setSaving(false);

    if (error) {
      toast.error('Gagal menyimpan rating: ' + error.message);
    } else {
      toast.success('Rating berhasil dikirim!');
      setEditing(false);
    }
  };

  const labels = ['Buruk', 'Kurang', 'Cukup', 'Baik', 'Luar Biasa'];

  return (
    <div className="bg-card rounded-lg border">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-bold text-sm">Beri Rating Pengacara</h3>
        {canEdit && !editing && existingRating && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditing(true)}>
            <Edit2 className="h-3 w-3" /> Edit
          </Button>
        )}
      </div>
      <div className="p-4 space-y-4">
        {(role === 'admin' || role === 'superadmin') && clientName && (
          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border">
            Rating atas nama: <strong className="text-foreground">{clientName}</strong>
          </p>
        )}

        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => editing && canRate && setRating(i)}
                onMouseEnter={() => editing && canRate && setHover(i)}
                onMouseLeave={() => setHover(0)}
                className={`transition-transform ${editing && canRate ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                disabled={isViewOnly || !editing}
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
            disabled={isViewOnly || !editing}
            className="w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none transition disabled:opacity-50"
          />
        </div>

        {editing && canRate && (
          <Button onClick={submit} className="w-full gap-2 h-9 font-semibold text-sm" disabled={saving}>
            <Send className="h-3.5 w-3.5" /> {saving ? 'Menyimpan...' : 'Kirim Rating'}
          </Button>
        )}

        {isViewOnly && (
          <p className="text-xs text-muted-foreground text-center">Hanya client yang dapat memberikan rating</p>
        )}
      </div>
    </div>
  );
}
