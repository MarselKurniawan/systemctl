CREATE POLICY "Admin can delete consultations"
ON public.consultations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));