export type ConsultationType = 'chat' | 'offline' | 'video_call';
export type ConsultationStatus = 'pending' | 'in_progress' | 'completed';
export type ServiceType = 'Layanan Konsultasi (Non-SKTM)' | 'Layanan Konsultasi (SKTM)';
export type LawType = 'Perdata' | 'Pidana' | 'Tata Usaha Negara';

export interface Consultation {
  id: string;
  no: number;
  clientName: string;
  caseName: string;
  consultationType: ConsultationType;
  serviceType: ServiceType;
  lawType: LawType;
  date: string;
  status: ConsultationStatus;
  agenda: string;
  lawyerName?: string;
  duration?: number;
  startPhoto?: string;
  endPhoto?: string;
  rating?: number;
  review?: string;
  nik?: string;
  telp?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  penyandangDisabilitas?: boolean;
  clientUserId?: string;
  lawyerUserId?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  time: string;
  isUser: boolean;
  file?: ChatFile;
}

export interface ChatFile {
  name: string;
  size: string;
  url: string;
  type: string;
}
