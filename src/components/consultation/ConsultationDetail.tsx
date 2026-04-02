import { Consultation } from '@/types/consultation';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ConsultationTimer from './ConsultationTimer';

interface Props {
  consultation: Consultation;
  timerFormatted: string;
  timerRunning: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  in_progress: 'bg-info/15 text-info border-info/30',
  completed: 'bg-success/15 text-success border-success/30',
};
const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};
const typeLabels: Record<string, string> = {
  chat: 'Chat Online',
  offline: 'Offline',
  video_call: 'Video Call',
};

export default function ConsultationDetail({ consultation, timerFormatted, timerRunning }: Props) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-5">
      <div>
        <h3 className="font-bold text-lg tracking-tight">Detail Konsultasi</h3>
        <div className="flex gap-2 mt-2.5">
          <Badge variant="outline" className={statusColors[consultation.status]}>
            <span className="mr-1 text-[8px]">●</span>{statusLabels[consultation.status]}
          </Badge>
          <Badge variant="outline" className="bg-info/10 text-info border-info/30">
            💬 {typeLabels[consultation.consultationType]}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {[{ label: 'Pengacara', name: consultation.lawyerName || 'Lawyer' }, { label: 'Klien', name: consultation.clientName }].map((person) => (
          <div key={person.label} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{person.label}</p>
              <p className="text-sm font-medium">{person.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h4 className="font-bold text-sm tracking-tight">Informasi Konsultasi</h4>
        {[
          { label: 'Nama Kasus', value: consultation.caseName },
          { label: 'Jenis Hukum', value: consultation.lawType },
          { label: 'Tanggal', value: consultation.date },
          { label: 'Agenda', value: consultation.agenda },
        ].map((item) => (
          <div key={item.label} className="flex justify-between items-baseline">
            <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
            <span className="text-xs font-medium text-right max-w-[60%]">{item.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs font-semibold text-muted-foreground">Durasi</span>
          <ConsultationTimer formatted={timerFormatted} isRunning={timerRunning} />
        </div>
      </div>
    </div>
  );
}
