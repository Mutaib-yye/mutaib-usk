-- Ensure trigger to create profile and assign admin role on user creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END
$$;

-- Backfill profiles for existing users
INSERT INTO public.profiles (id, email, nama_lengkap)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'nama_lengkap', 'User')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Backfill admin role for the specified admin email if missing
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'admin'::app_role
WHERE u.email = 'rathermutaib333@gmail.com' AND ur.user_id IS NULL;