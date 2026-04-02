
-- Create consultation type enums
CREATE TYPE public.consultation_type AS ENUM ('offline', 'chat', 'video_call');
CREATE TYPE public.consultation_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID,
  lawyer_user_id UUID,
  client_name TEXT NOT NULL,
  case_name TEXT NOT NULL,
  consultation_type public.consultation_type NOT NULL DEFAULT 'chat',
  service_type TEXT,
  law_type TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.consultation_status NOT NULL DEFAULT 'pending',
  agenda TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  start_photo TEXT,
  end_photo TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  nik TEXT,
  telp TEXT,
  tanggal_lahir DATE,
  jenis_kelamin TEXT,
  penyandang_disabilitas BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view consultations"
ON public.consultations FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create consultations"
ON public.consultations FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Superadmin can update any consultation"
ON public.consultations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admin can update any consultation"
ON public.consultations FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lawyer can update their consultations"
ON public.consultations FOR UPDATE TO authenticated
USING (lawyer_user_id = auth.uid());

CREATE POLICY "Client can update their consultations"
ON public.consultations FOR UPDATE TO authenticated
USING (client_user_id = auth.uid());

CREATE POLICY "Superadmin can delete consultations"
ON public.consultations FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

-- Timestamp trigger
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
