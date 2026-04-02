
-- Add new fields to profiles
ALTER TABLE public.profiles ADD COLUMN jenis_kelamin TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN penyandang_disabilitas BOOLEAN DEFAULT false;

-- Master Data: Jenis Layanan
CREATE TABLE public.master_jenis_layanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.master_jenis_layanan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view jenis layanan"
ON public.master_jenis_layanan FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage jenis layanan"
ON public.master_jenis_layanan FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Master Data: Jenis Hukum
CREATE TABLE public.master_jenis_hukum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.master_jenis_hukum ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view jenis hukum"
ON public.master_jenis_hukum FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage jenis hukum"
ON public.master_jenis_hukum FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));

-- Seed default data
INSERT INTO public.master_jenis_layanan (nama) VALUES 
  ('Layanan Konsultasi (SKTM)'),
  ('Layanan Konsultasi (Non-SKTM)');

INSERT INTO public.master_jenis_hukum (nama) VALUES 
  ('Pidana'),
  ('Perdata'),
  ('Tata Usaha Negara');

-- Triggers for updated_at
CREATE TRIGGER update_master_jenis_layanan_updated_at
BEFORE UPDATE ON public.master_jenis_layanan
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_master_jenis_hukum_updated_at
BEFORE UPDATE ON public.master_jenis_hukum
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
