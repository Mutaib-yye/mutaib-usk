import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Plus, Edit, Trash2, LogOut, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const mataKuliahSchema = z.object({
  kodeMk: z.string().trim().min(2, "Kode MK minimal 2 karakter"),
  namaMataKuliah: z.string().trim().min(3, "Nama mata kuliah minimal 3 karakter"),
  sks: z.number().min(1).max(6),
  semester: z.number().min(1).max(8),
});

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const [mataKuliah, setMataKuliah] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingMk, setEditingMk] = useState<any>(null);

  // Form states for mata kuliah
  const [kodeMk, setKodeMk] = useState("");
  const [namaMataKuliah, setNamaMataKuliah] = useState("");
  const [sks, setSks] = useState(3);
  const [semester, setSemester] = useState(1);

  // Form states for user role
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "dosen" | "mahasiswa" | "">("");

  useEffect(() => {
    fetchMataKuliah();
    fetchUsers();
  }, []);

  const fetchMataKuliah = async () => {
    const { data, error } = await supabase
      .from("mata_kuliah")
      .select("*")
      .order("semester", { ascending: true });

    if (error) {
      toast.error("Gagal memuat data mata kuliah");
    } else {
      setMataKuliah(data || []);
    }
  };

  const fetchUsers = async () => {
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (role)
      `);

    if (error) {
      toast.error("Gagal memuat data pengguna");
    } else {
      setUsers(profilesData || []);
    }
  };

  const handleSaveMataKuliah = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = mataKuliahSchema.safeParse({
      kodeMk,
      namaMataKuliah,
      sks,
      semester,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    const mkData = {
      kode_mk: kodeMk,
      nama_mata_kuliah: namaMataKuliah,
      sks,
      semester,
    };

    let error;
    if (editingMk) {
      ({ error } = await supabase
        .from("mata_kuliah")
        .update(mkData)
        .eq("id", editingMk.id));
    } else {
      ({ error } = await supabase
        .from("mata_kuliah")
        .insert([mkData]));
    }

    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan mata kuliah: " + error.message);
    } else {
      toast.success(editingMk ? "Mata kuliah berhasil diperbarui!" : "Mata kuliah berhasil ditambahkan!");
      setDialogOpen(false);
      resetForm();
      fetchMataKuliah();
    }
  };

  const handleDeleteMataKuliah = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mata kuliah ini?")) return;

    const { error } = await supabase
      .from("mata_kuliah")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus mata kuliah");
    } else {
      toast.success("Mata kuliah berhasil dihapus!");
      fetchMataKuliah();
    }
  };

  const handleEditMataKuliah = (mk: any) => {
    setEditingMk(mk);
    setKodeMk(mk.kode_mk);
    setNamaMataKuliah(mk.nama_mata_kuliah);
    setSks(mk.sks);
    setSemester(mk.semester);
    setDialogOpen(true);
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedRole) {
      toast.error("Pilih pengguna dan role");
      return;
    }

    setLoading(true);

    // Check if user already has a role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", selectedUserId)
      .single();

    let error;
    if (existingRole) {
      ({ error } = await supabase
        .from("user_roles")
        .update({ role: selectedRole as "admin" | "dosen" | "mahasiswa" })
        .eq("user_id", selectedUserId));
    } else {
      ({ error } = await supabase
        .from("user_roles")
        .insert([{ user_id: selectedUserId, role: selectedRole as "admin" | "dosen" | "mahasiswa" }]));
    }

    setLoading(false);

    if (error) {
      toast.error("Gagal menetapkan role: " + error.message);
    } else {
      toast.success("Role berhasil ditetapkan!");
      setUserDialogOpen(false);
      setSelectedUserId("");
      setSelectedRole("");
      fetchUsers();
    }
  };

  const resetForm = () => {
    setEditingMk(null);
    setKodeMk("");
    setNamaMataKuliah("");
    setSks(3);
    setSemester(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Universitas Syiah Kuala</h1>
              <p className="text-sm opacity-90">Dashboard Admin</p>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Total Mata Kuliah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{mataKuliah.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Total Pengguna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{users.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Mata Kuliah Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daftar Mata Kuliah</CardTitle>
                <CardDescription>Kelola mata kuliah yang tersedia</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Mata Kuliah
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingMk ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveMataKuliah} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kode-mk">Kode Mata Kuliah</Label>
                      <Input
                        id="kode-mk"
                        value={kodeMk}
                        onChange={(e) => setKodeMk(e.target.value)}
                        placeholder="contoh: TIF101"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nama-mk">Nama Mata Kuliah</Label>
                      <Input
                        id="nama-mk"
                        value={namaMataKuliah}
                        onChange={(e) => setNamaMataKuliah(e.target.value)}
                        placeholder="contoh: Pemrograman Web"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sks">SKS</Label>
                        <Select value={sks.toString()} onValueChange={(val) => setSks(parseInt(val))}>
                          <SelectTrigger id="sks">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} SKS
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Select value={semester.toString()} onValueChange={(val) => setSemester(parseInt(val))}>
                          <SelectTrigger id="semester">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                Semester {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Menyimpan..." : editingMk ? "Perbarui" : "Simpan"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Mata Kuliah</TableHead>
                  <TableHead>SKS</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mataKuliah.map((mk) => (
                  <TableRow key={mk.id}>
                    <TableCell className="font-medium">{mk.kode_mk}</TableCell>
                    <TableCell>{mk.nama_mata_kuliah}</TableCell>
                    <TableCell>{mk.sks} SKS</TableCell>
                    <TableCell>
                      <Badge variant="outline">Semester {mk.semester}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditMataKuliah(mk)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMataKuliah(mk.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Users Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daftar Pengguna</CardTitle>
                <CardDescription>Kelola role pengguna</CardDescription>
              </div>
              <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Tetapkan Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tetapkan Role Pengguna</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAssignRole} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-select">Pilih Pengguna</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger id="user-select">
                          <SelectValue placeholder="Pilih pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nama_lengkap} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-select">Pilih Role</Label>
                      <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as "admin" | "dosen" | "mahasiswa")}>
                        <SelectTrigger id="role-select">
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="dosen">Dosen</SelectItem>
                          <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Menyimpan..." : "Tetapkan Role"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>NIM/NIP</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nama_lengkap}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.nim_nip || "-"}</TableCell>
                    <TableCell>
                      {user.user_roles?.[0]?.role ? (
                        <Badge
                          variant={
                            user.user_roles[0].role === "admin"
                              ? "default"
                              : user.user_roles[0].role === "dosen"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.user_roles[0].role}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Belum ada role</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
