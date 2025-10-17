import { createContext, useContext, useState, ReactNode } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Common
    "common.logout": "Keluar",
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.edit": "Edit",
    "common.delete": "Hapus",
    "common.add": "Tambah",
    "common.search": "Cari",
    "common.loading": "Memuat...",
    "common.noData": "Tidak ada data",
    "common.confirm": "Konfirmasi",
    "common.yes": "Ya",
    "common.no": "Tidak",
    
    // University
    "university.name": "Universitas Syiah Kuala",
    "university.system": "Sistem Informasi Perkuliahan",
    
    // Auth
    "auth.login": "Masuk",
    "auth.signup": "Daftar",
    "auth.loginToAccount": "Masuk ke akun Anda",
    "auth.createAccount": "Daftar akun baru",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Nama Lengkap",
    "auth.nimNip": "NIM/NIP",
    "auth.loginSuccess": "Login berhasil!",
    "auth.loginFailed": "Login gagal",
    "auth.signupSuccess": "Pendaftaran berhasil! Silakan login.",
    "auth.signupFailed": "Pendaftaran gagal",
    "auth.emailExists": "Email sudah terdaftar. Silakan login.",
    "auth.processing": "Memproses...",
    
    // Index/Home
    "home.accountNotActivated": "Akun Belum Diaktifkan",
    "home.accountNotActivatedDesc": "Akun Anda sudah terdaftar, tetapi belum diberi role oleh admin. Silakan hubungi admin untuk mengaktifkan akun Anda.",
    "home.loadingApp": "Memuat aplikasi...",
    
    // Admin Dashboard
    "admin.dashboard": "Dashboard Admin",
    "admin.manageCourses": "Kelola mata kuliah dan pengguna",
    "admin.totalCourses": "Total Mata Kuliah",
    "admin.totalUsers": "Total Pengguna",
    "admin.courseList": "Daftar Mata Kuliah",
    "admin.manageCoursesList": "Kelola mata kuliah yang tersedia",
    "admin.addCourse": "Tambah Mata Kuliah",
    "admin.editCourse": "Edit Mata Kuliah",
    "admin.courseCode": "Kode Mata Kuliah",
    "admin.courseName": "Nama Mata Kuliah",
    "admin.credits": "SKS",
    "admin.semester": "Semester",
    "admin.actions": "Aksi",
    "admin.userList": "Daftar Pengguna",
    "admin.manageUserRoles": "Kelola role pengguna",
    "admin.assignRole": "Tetapkan Role",
    "admin.assignUserRole": "Tetapkan Role Pengguna",
    "admin.selectUser": "Pilih Pengguna",
    "admin.selectUserPlaceholder": "Pilih pengguna",
    "admin.selectRole": "Pilih Role",
    "admin.selectRolePlaceholder": "Pilih role",
    "admin.roleAdmin": "Admin",
    "admin.roleDosen": "Dosen",
    "admin.roleMahasiswa": "Mahasiswa",
    "admin.name": "Nama",
    "admin.role": "Role",
    "admin.noRole": "Belum ada role",
    "admin.deleteConfirm": "Apakah Anda yakin ingin menghapus mata kuliah ini?",
    "admin.saveSuccess": "Berhasil menyimpan!",
    "admin.saveFailed": "Gagal menyimpan",
    "admin.deleteSuccess": "Berhasil menghapus!",
    "admin.deleteFailed": "Gagal menghapus",
    "admin.update": "Perbarui",
    "admin.updating": "Memperbarui...",
    "admin.saving": "Menyimpan...",
    
    // Dosen Dashboard
    "dosen.dashboard": "Dashboard Dosen",
    "dosen.manageGrades": "Kelola nilai mahasiswa",
    "dosen.courses": "Mata Kuliah",
    "dosen.students": "Mahasiswa",
    "dosen.gradesEntered": "Nilai Diinput",
    "dosen.gradeList": "Daftar Nilai",
    "dosen.manageStudentGrades": "Input dan kelola nilai mahasiswa",
    "dosen.inputGrade": "Input Nilai",
    "dosen.editGrade": "Edit Nilai",
    "dosen.student": "Mahasiswa",
    "dosen.selectStudent": "Pilih mahasiswa",
    "dosen.course": "Mata Kuliah",
    "dosen.selectCourse": "Pilih mata kuliah",
    "dosen.gradeNumber": "Nilai (0-100)",
    "dosen.gradeLetter": "Nilai huruf",
    "dosen.nim": "NIM",
    
    // Mahasiswa Dashboard
    "mahasiswa.dashboard": "Dashboard Mahasiswa",
    "mahasiswa.welcome": "Selamat datang",
    "mahasiswa.ipk": "IPK",
    "mahasiswa.totalCredits": "Total SKS",
    "mahasiswa.courses": "Mata Kuliah",
    "mahasiswa.transcript": "Transkrip Nilai",
    "mahasiswa.transcriptDesc": "Daftar nilai mata kuliah yang telah Anda ambil",
    "mahasiswa.noGrades": "Belum ada nilai",
    "mahasiswa.noGradesDesc": "Nilai akan muncul setelah dosen menginput nilai Anda",
    "mahasiswa.code": "Kode",
    "mahasiswa.courseName": "Mata Kuliah",
    "mahasiswa.credits": "SKS",
    "mahasiswa.semester": "Semester",
    "mahasiswa.lecturer": "Dosen",
    "mahasiswa.gradeNumber": "Nilai Angka",
    "mahasiswa.gradeLetter": "Nilai Huruf",
    "mahasiswa.gradeInfo": "Keterangan Nilai",
  },
  en: {
    // Common
    "common.logout": "Logout",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.add": "Add",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.noData": "No data",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    
    // University
    "university.name": "Syiah Kuala University",
    "university.system": "Academic Information System",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.loginToAccount": "Login to your account",
    "auth.createAccount": "Create new account",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.nimNip": "Student/Staff ID",
    "auth.loginSuccess": "Login successful!",
    "auth.loginFailed": "Login failed",
    "auth.signupSuccess": "Registration successful! Please login.",
    "auth.signupFailed": "Registration failed",
    "auth.emailExists": "Email already registered. Please login.",
    "auth.processing": "Processing...",
    
    // Index/Home
    "home.accountNotActivated": "Account Not Activated",
    "home.accountNotActivatedDesc": "Your account is registered but has not been assigned a role by admin. Please contact admin to activate your account.",
    "home.loadingApp": "Loading application...",
    
    // Admin Dashboard
    "admin.dashboard": "Admin Dashboard",
    "admin.manageCourses": "Manage courses and users",
    "admin.totalCourses": "Total Courses",
    "admin.totalUsers": "Total Users",
    "admin.courseList": "Course List",
    "admin.manageCoursesList": "Manage available courses",
    "admin.addCourse": "Add Course",
    "admin.editCourse": "Edit Course",
    "admin.courseCode": "Course Code",
    "admin.courseName": "Course Name",
    "admin.credits": "Credits",
    "admin.semester": "Semester",
    "admin.actions": "Actions",
    "admin.userList": "User List",
    "admin.manageUserRoles": "Manage user roles",
    "admin.assignRole": "Assign Role",
    "admin.assignUserRole": "Assign User Role",
    "admin.selectUser": "Select User",
    "admin.selectUserPlaceholder": "Select user",
    "admin.selectRole": "Select Role",
    "admin.selectRolePlaceholder": "Select role",
    "admin.roleAdmin": "Admin",
    "admin.roleDosen": "Lecturer",
    "admin.roleMahasiswa": "Student",
    "admin.name": "Name",
    "admin.role": "Role",
    "admin.noRole": "No role assigned",
    "admin.deleteConfirm": "Are you sure you want to delete this course?",
    "admin.saveSuccess": "Successfully saved!",
    "admin.saveFailed": "Failed to save",
    "admin.deleteSuccess": "Successfully deleted!",
    "admin.deleteFailed": "Failed to delete",
    "admin.update": "Update",
    "admin.updating": "Updating...",
    "admin.saving": "Saving...",
    
    // Dosen Dashboard
    "dosen.dashboard": "Lecturer Dashboard",
    "dosen.manageGrades": "Manage student grades",
    "dosen.courses": "Courses",
    "dosen.students": "Students",
    "dosen.gradesEntered": "Grades Entered",
    "dosen.gradeList": "Grade List",
    "dosen.manageStudentGrades": "Input and manage student grades",
    "dosen.inputGrade": "Input Grade",
    "dosen.editGrade": "Edit Grade",
    "dosen.student": "Student",
    "dosen.selectStudent": "Select student",
    "dosen.course": "Course",
    "dosen.selectCourse": "Select course",
    "dosen.gradeNumber": "Grade (0-100)",
    "dosen.gradeLetter": "Letter grade",
    "dosen.nim": "Student ID",
    
    // Mahasiswa Dashboard
    "mahasiswa.dashboard": "Student Dashboard",
    "mahasiswa.welcome": "Welcome",
    "mahasiswa.ipk": "GPA",
    "mahasiswa.totalCredits": "Total Credits",
    "mahasiswa.courses": "Courses",
    "mahasiswa.transcript": "Transcript",
    "mahasiswa.transcriptDesc": "List of course grades you have taken",
    "mahasiswa.noGrades": "No grades yet",
    "mahasiswa.noGradesDesc": "Grades will appear after your lecturer inputs them",
    "mahasiswa.code": "Code",
    "mahasiswa.courseName": "Course Name",
    "mahasiswa.credits": "Credits",
    "mahasiswa.semester": "Semester",
    "mahasiswa.lecturer": "Lecturer",
    "mahasiswa.gradeNumber": "Numeric Grade",
    "mahasiswa.gradeLetter": "Letter Grade",
    "mahasiswa.gradeInfo": "Grade Information",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("id");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
