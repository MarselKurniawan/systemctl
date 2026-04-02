
-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL,
  sender_name text NOT NULL,
  message text NOT NULL DEFAULT '',
  file_url text,
  file_name text,
  file_size text,
  file_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view messages"
ON public.chat_messages FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (sender_user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Update handle_new_user to save all profile fields from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nama, email, nik, nomor_wa, tanggal_lahir, jenis_kelamin, penyandang_disabilitas)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'nik',
    NEW.raw_user_meta_data->>'nomor_wa',
    CASE WHEN NEW.raw_user_meta_data->>'tanggal_lahir' IS NOT NULL AND NEW.raw_user_meta_data->>'tanggal_lahir' != ''
      THEN (NEW.raw_user_meta_data->>'tanggal_lahir')::date ELSE NULL END,
    NEW.raw_user_meta_data->>'jenis_kelamin',
    COALESCE((NEW.raw_user_meta_data->>'penyandang_disabilitas')::boolean, false)
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;

-- Create storage bucket for consultation files
INSERT INTO storage.buckets (id, name, public) VALUES ('consultation-files', 'consultation-files', true);

CREATE POLICY "Authenticated users can upload consultation files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'consultation-files');

CREATE POLICY "Anyone authenticated can view consultation files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'consultation-files');
