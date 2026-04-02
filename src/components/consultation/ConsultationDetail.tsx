import { Consultation } from '@/types/consultation';
import { User, Calendar, Scale, FileText, Clock } from 'lucide-react';

interface Props {
  consultation: Consultation;
  timerFormatted: string;
  timerRunning: boolean;
}

const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', label: 'Pending' },
  in_progress: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', label: 'Completed' },
};

const typeLabels: Record<string, string> = {
  chat: 'Chat Online', offline: 'Offline', video_call: 'Video Call',
};

export default function ConsultationDetail({ consultation, timerFormatted, timerRunning }: Props) {
  const status = statusConfig[consultation.status];

  return (
    <div className="glass-elevated rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-muted/20">
        <h3 className="font-bold tracking-tight">Detail Konsultasi</h3>
        <div className="flex gap-2 mt-2.5 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${status.bg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary">
            {typeLabels[consultation.consultationType]}
          </span>
        </div>
      </div>

      {/* People */}
      <div className="px-5 py-4 space-y-3 border-b">
        {[
          { role: 'Pengacara', name: consultation.lawyerName || 'Lawyer', color: 'from-info/20 to-info/5 text-info' },
          { role: 'Klien', name: consultation.clientName, color: 'from-primary/15 to-primary/5 text-primary' },
        ].map((p) => (
          <div key={p.role} className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{p.role}</p>
              <p className="text-sm font-semibold truncate">{p.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info grid */}
      <div className="px-5 py-4 space-y-3">
        {[
          { icon: FileText, label: 'Nama Kasus', value: consultation.caseName },
          { icon: Scale, label: 'Jenis Hukum', value: consultation.lawType },
          { icon: Calendar, label: 'Tanggal', value: consultation.date },
          { icon: FileText, label: 'Agenda', value: consultation.agenda },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">{item.label}</p>
              <p className="text-sm font-medium truncate">{item.value}</p>
            </div>
          </div>
        ))}

        {/* Timer */}
        <div className="flex items-center gap-3 pt-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Durasi</p>
            <div className="flex items-center gap-2">
              {timerRunning && <span className="h-2 w-2 rounded-full bg-success animate-pulse-live" />}
              <span className="text-sm font-bold font-mono text-primary">{timerFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
