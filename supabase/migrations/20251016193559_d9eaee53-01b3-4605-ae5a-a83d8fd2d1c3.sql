-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'dosen', 'mahasiswa');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nama_lengkap TEXT NOT NULL,
  nim_nip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (CRITICAL: roles must be in separate table for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create mata_kuliah (courses) table
CREATE TABLE public.mata_kuliah (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_mk TEXT NOT NULL UNIQUE,
  nama_mata_kuliah TEXT NOT NULL,
  sks INTEGER NOT NULL CHECK (sks > 0 AND sks <= 6),
  semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on mata_kuliah
ALTER TABLE public.mata_kuliah ENABLE ROW LEVEL SECURITY;

-- Create nilai (grades) table
CREATE TABLE public.nilai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mahasiswa_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mata_kuliah_id UUID NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
  dosen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nilai_angka DECIMAL(5,2) CHECK (nilai_angka >= 0 AND nilai_angka <= 100),
  nilai_huruf TEXT CHECK (nilai_huruf IN ('A', 'B', 'C', 'D', 'E')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mahasiswa_id, mata_kuliah_id)
);

-- Enable RLS on nilai
ALTER TABLE public.nilai ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama_lengkap)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', 'User')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mata_kuliah_updated_at
  BEFORE UPDATE ON public.mata_kuliah
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nilai_updated_at
  BEFORE UPDATE ON public.nilai
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for mata_kuliah
CREATE POLICY "Everyone can view mata kuliah"
  ON public.mata_kuliah FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mata kuliah"
  ON public.mata_kuliah FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for nilai
CREATE POLICY "Mahasiswa can view their own grades"
  ON public.nilai FOR SELECT
  USING (
    auth.uid() = mahasiswa_id OR
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'dosen')
  );

CREATE POLICY "Dosen can insert grades"
  ON public.nilai FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'dosen') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Dosen can update grades they created"
  ON public.nilai FOR UPDATE
  USING (
    auth.uid() = dosen_id OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete grades"
  ON public.nilai FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert admin user role for rathermutaib333@gmail.com
-- Note: This will be executed after the user signs up
-- We'll handle this in the application code