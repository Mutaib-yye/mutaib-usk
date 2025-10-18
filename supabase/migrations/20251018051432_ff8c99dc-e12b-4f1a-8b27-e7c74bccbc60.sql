-- Fix RLS policies for dosen to view all mahasiswa profiles
DROP POLICY IF EXISTS "Dosen can view mahasiswa profiles" ON public.profiles;
CREATE POLICY "Dosen can view mahasiswa profiles" 
ON public.profiles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'dosen'::app_role)
  OR auth.uid() = id
);

-- Ensure dosen can view user roles to filter mahasiswa
DROP POLICY IF EXISTS "Dosen can view user roles" ON public.user_roles;
CREATE POLICY "Dosen can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'dosen'::app_role)
  OR auth.uid() = user_id
);