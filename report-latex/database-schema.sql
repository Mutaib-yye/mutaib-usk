-- =====================================================
-- SISTEM INFORMASI PERKULIAHAN - DATABASE SCHEMA
-- PostgreSQL 15+
-- =====================================================

-- =====================================================
-- 1. ENUM TYPES
-- =====================================================

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'dosen', 'mahasiswa');

-- =====================================================
-- 2. TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: profiles
-- Description: Stores user profile information
-- -----------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nama_lengkap TEXT NOT NULL,
    nim_nip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT profiles_email_key UNIQUE (email)
);

-- Add table comment
COMMENT ON TABLE public.profiles IS 'Stores extended user profile information';
COMMENT ON COLUMN public.profiles.nim_nip IS 'NIM for students (mahasiswa), NIP for lecturers (dosen)';

-- -----------------------------------------------------
-- Table: user_roles
-- Description: Stores user role assignments
-- -----------------------------------------------------
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- Add table comment
COMMENT ON TABLE public.user_roles IS 'Maps users to their roles (admin, dosen, mahasiswa)';

-- Create index for faster role lookups
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- -----------------------------------------------------
-- Table: mata_kuliah
-- Description: Stores course information
-- -----------------------------------------------------
CREATE TABLE public.mata_kuliah (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_mk TEXT NOT NULL,
    nama_mata_kuliah TEXT NOT NULL,
    sks INTEGER NOT NULL CHECK (sks > 0 AND sks <= 6),
    semester INTEGER NOT NULL CHECK (semester > 0 AND semester <= 14),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mata_kuliah_kode_mk_key UNIQUE (kode_mk)
);

-- Add table comment
COMMENT ON TABLE public.mata_kuliah IS 'Stores course/subject information';
COMMENT ON COLUMN public.mata_kuliah.kode_mk IS 'Unique course code (e.g., IF101, MTK201)';
COMMENT ON COLUMN public.mata_kuliah.sks IS 'Credit hours (SKS - Satuan Kredit Semester)';

-- Create index for faster searches
CREATE INDEX idx_mata_kuliah_semester ON public.mata_kuliah(semester);
CREATE INDEX idx_mata_kuliah_kode_mk ON public.mata_kuliah(kode_mk);

-- -----------------------------------------------------
-- Table: nilai
-- Description: Stores student grades
-- -----------------------------------------------------
CREATE TABLE public.nilai (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mahasiswa_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mata_kuliah_id UUID NOT NULL REFERENCES public.mata_kuliah(id) ON DELETE CASCADE,
    dosen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nilai_angka NUMERIC CHECK (nilai_angka >= 0 AND nilai_angka <= 100),
    nilai_huruf TEXT CHECK (nilai_huruf IN ('A', 'B', 'C', 'D', 'E')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT nilai_mahasiswa_id_mata_kuliah_id_key UNIQUE (mahasiswa_id, mata_kuliah_id)
);

-- Add table comment
COMMENT ON TABLE public.nilai IS 'Stores student grades for courses';
COMMENT ON COLUMN public.nilai.mahasiswa_id IS 'Student ID receiving the grade';
COMMENT ON COLUMN public.nilai.mata_kuliah_id IS 'Course ID for which grade is given';
COMMENT ON COLUMN public.nilai.dosen_id IS 'Lecturer ID who gave the grade';
COMMENT ON COLUMN public.nilai.nilai_angka IS 'Numeric grade (0-100)';
COMMENT ON COLUMN public.nilai.nilai_huruf IS 'Letter grade (A, B, C, D, E)';

-- Create indexes for faster queries
CREATE INDEX idx_nilai_mahasiswa_id ON public.nilai(mahasiswa_id);
CREATE INDEX idx_nilai_mata_kuliah_id ON public.nilai(mata_kuliah_id);
CREATE INDEX idx_nilai_dosen_id ON public.nilai(dosen_id);

-- =====================================================
-- 3. FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Function: has_role
-- Description: Check if user has specific role
-- Security: SECURITY DEFINER (runs with owner privileges)
-- -----------------------------------------------------
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

COMMENT ON FUNCTION public.has_role IS 'Check if user has specific role (used in RLS policies)';

-- -----------------------------------------------------
-- Function: update_updated_at_column
-- Description: Automatically update updated_at timestamp
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column IS 'Trigger function to auto-update updated_at column';

-- -----------------------------------------------------
-- Function: handle_new_user
-- Description: Create profile and assign role on user signup
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, nama_lengkap)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', 'User')
  );
  
  -- Auto-assign admin role for specific email
  IF NEW.email = 'rathermutaib333@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically create profile and assign roles on user signup';

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for mata_kuliah updated_at
CREATE TRIGGER update_mata_kuliah_updated_at
  BEFORE UPDATE ON public.mata_kuliah
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for nilai updated_at
CREATE TRIGGER update_nilai_updated_at
  BEFORE UPDATE ON public.nilai
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mata_kuliah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nilai ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS Policies: profiles
-- -----------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Dosen can view mahasiswa profiles
CREATE POLICY "Dosen can view mahasiswa profiles"
ON public.profiles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'dosen') OR 
  auth.uid() = id
);

-- -----------------------------------------------------
-- RLS Policies: user_roles
-- -----------------------------------------------------

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Dosen can view user roles (needed for fetching mahasiswa)
CREATE POLICY "Dosen can view user roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'dosen') OR 
  auth.uid() = user_id
);

-- -----------------------------------------------------
-- RLS Policies: mata_kuliah
-- -----------------------------------------------------

-- Everyone can view mata kuliah
CREATE POLICY "Everyone can view mata kuliah"
ON public.mata_kuliah
FOR SELECT
USING (true);

-- Admins can manage mata kuliah
CREATE POLICY "Admins can manage mata kuliah"
ON public.mata_kuliah
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------
-- RLS Policies: nilai
-- -----------------------------------------------------

-- Mahasiswa can view their own grades
CREATE POLICY "Mahasiswa can view their own grades"
ON public.nilai
FOR SELECT
USING (
  auth.uid() = mahasiswa_id OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'dosen')
);

-- Dosen can insert grades
CREATE POLICY "Dosen can insert grades"
ON public.nilai
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'dosen') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Dosen can update grades they created
CREATE POLICY "Dosen can update grades they created"
ON public.nilai
FOR UPDATE
USING (
  auth.uid() = dosen_id OR 
  public.has_role(auth.uid(), 'admin')
);

-- Admins can delete grades
CREATE POLICY "Admins can delete grades"
ON public.nilai
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 6. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: Uncomment this section if you want to insert sample data

/*
-- Insert sample mata kuliah
INSERT INTO public.mata_kuliah (kode_mk, nama_mata_kuliah, sks, semester) VALUES
('IF101', 'Pengantar Teknologi Informasi', 3, 1),
('IF102', 'Algoritma dan Pemrograman', 4, 1),
('IF201', 'Struktur Data', 3, 2),
('IF202', 'Basis Data', 3, 2),
('IF301', 'Pemrograman Web', 3, 3),
('IF302', 'Manajemen Proyek Perangkat Lunak', 3, 3);

-- Note: User profiles will be created automatically via trigger when users sign up
*/

-- =====================================================
-- 7. USEFUL QUERIES FOR REFERENCE
-- =====================================================

-- Query to get all students with their roles
/*
SELECT 
    p.id,
    p.email,
    p.nama_lengkap,
    p.nim_nip,
    ur.role
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'mahasiswa';
*/

-- Query to get student grades with course and lecturer info
/*
SELECT 
    n.id,
    n.nilai_angka,
    n.nilai_huruf,
    m.nama_lengkap AS mahasiswa_nama,
    m.nim_nip,
    mk.kode_mk,
    mk.nama_mata_kuliah,
    mk.sks,
    d.nama_lengkap AS dosen_nama
FROM nilai n
JOIN profiles m ON n.mahasiswa_id = m.id
JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
JOIN profiles d ON n.dosen_id = d.id
WHERE m.id = 'student-uuid-here'
ORDER BY mk.semester;
*/

-- Query to calculate student GPA
/*
SELECT 
    p.nama_lengkap,
    p.nim_nip,
    ROUND(
        SUM(
            CASE n.nilai_huruf
                WHEN 'A' THEN 4.0 * mk.sks
                WHEN 'B' THEN 3.0 * mk.sks
                WHEN 'C' THEN 2.0 * mk.sks
                WHEN 'D' THEN 1.0 * mk.sks
                ELSE 0
            END
        ) / NULLIF(SUM(mk.sks), 0),
        2
    ) AS ipk,
    SUM(mk.sks) AS total_sks
FROM profiles p
LEFT JOIN nilai n ON p.id = n.mahasiswa_id
LEFT JOIN mata_kuliah mk ON n.mata_kuliah_id = mk.id
WHERE p.id = 'student-uuid-here'
GROUP BY p.id, p.nama_lengkap, p.nim_nip;
*/

-- =====================================================
-- END OF SCHEMA
-- =====================================================