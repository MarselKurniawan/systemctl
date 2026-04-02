
-- Drop the overly permissive insert policy
DROP POLICY "Authenticated users can create consultations" ON public.consultations;

-- More restrictive insert policies
CREATE POLICY "Client can create own consultations"
ON public.consultations FOR INSERT TO authenticated
WITH CHECK (client_user_id = auth.uid() OR public.has_role(auth.uid(), 'lawyer') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'superadmin'));
