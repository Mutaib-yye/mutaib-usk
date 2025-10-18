import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
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
import { Watermark } from "@/components/Watermark";

const mataKuliahSchema = z.object({
  kodeMk: z.string().trim().min(2, "Kode MK minimal 2 karakter"),
  namaMataKuliah: z.string().trim().min(3, "Nama mata kuliah minimal 3 karakter"),
  sks: z.number().min(1).max(6),
  semester: z.number().min(1).max(8),
});

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const { t } = useLanguage();
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
      toast.error(t("admin.saveFailed"));
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
      toast.error(t("admin.saveFailed"));
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
      toast.error(t("admin.saveFailed") + ": " + error.message);
    } else {
      toast.success(t("admin.saveSuccess"));
      setDialogOpen(false);
      resetForm();
      fetchMataKuliah();
    }
  };

  const handleDeleteMataKuliah = async (id: string) => {
    if (!confirm(t("admin.deleteConfirm"))) return;

    const { error } = await supabase
      .from("mata_kuliah")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(t("admin.deleteFailed"));
    } else {
      toast.success(t("admin.deleteSuccess"));
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
      toast.error(t("admin.saveFailed"));
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
      toast.error(t("admin.saveFailed") + ": " + error.message);
    } else {
      toast.success(t("admin.saveSuccess"));
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
    <div className="min-h-screen gradient-bg relative">
      {/* Header */}
      <header className="glass-header sticky top-0 z-20 text-secondary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">{t("university.name")}</h1>
              <p className="text-sm opacity-90">{t("admin.dashboard")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button onClick={signOut} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-hover border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {t("admin.totalCourses")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{mataKuliah.length}</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                {t("admin.totalUsers")}
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
                <CardTitle>{t("admin.courseList")}</CardTitle>
                <CardDescription>{t("admin.manageCoursesList")}</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("admin.addCourse")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card z-50">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMk ? t("admin.editCourse") : t("admin.addCourse")}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveMataKuliah} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="kode-mk">{t("admin.courseCode")}</Label>
                      <Input
                        id="kode-mk"
                        value={kodeMk}
                        onChange={(e) => setKodeMk(e.target.value)}
                        placeholder="TIF101"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nama-mk">{t("admin.courseName")}</Label>
                      <Input
                        id="nama-mk"
                        value={namaMataKuliah}
                        onChange={(e) => setNamaMataKuliah(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sks">{t("admin.credits")}</Label>
                        <Select value={sks.toString()} onValueChange={(val) => setSks(parseInt(val))}>
                          <SelectTrigger id="sks">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card z-50">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n} {t("admin.credits")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">{t("admin.semester")}</Label>
                        <Select value={semester.toString()} onValueChange={(val) => setSemester(parseInt(val))}>
                          <SelectTrigger id="semester">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card z-50">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {t("admin.semester")} {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t("admin.saving") : editingMk ? t("admin.update") : t("common.save")}
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
                  <TableHead>{t("mahasiswa.code")}</TableHead>
                  <TableHead>{t("admin.courseName")}</TableHead>
                  <TableHead>{t("admin.credits")}</TableHead>
                  <TableHead>{t("admin.semester")}</TableHead>
                  <TableHead className="text-right">{t("admin.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mataKuliah.map((mk) => (
                  <TableRow key={mk.id}>
                    <TableCell className="font-medium">{mk.kode_mk}</TableCell>
                    <TableCell>{mk.nama_mata_kuliah}</TableCell>
                    <TableCell>{mk.sks} {t("admin.credits")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t("admin.semester")} {mk.semester}</Badge>
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
                <CardTitle>{t("admin.userList")}</CardTitle>
                <CardDescription>{t("admin.manageUserRoles")}</CardDescription>
              </div>
              <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    {t("admin.assignRole")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card z-50">
                  <DialogHeader>
                    <DialogTitle>{t("admin.assignUserRole")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAssignRole} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-select">{t("admin.selectUser")}</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger id="user-select">
                          <SelectValue placeholder={t("admin.selectUserPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="bg-card z-50">
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nama_lengkap} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-select">{t("admin.selectRole")}</Label>
                      <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as "admin" | "dosen" | "mahasiswa")}>
                        <SelectTrigger id="role-select">
                          <SelectValue placeholder={t("admin.selectRolePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent className="bg-card z-50">
                          <SelectItem value="admin">{t("admin.roleAdmin")}</SelectItem>
                          <SelectItem value="dosen">{t("admin.roleDosen")}</SelectItem>
                          <SelectItem value="mahasiswa">{t("admin.roleMahasiswa")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? t("admin.saving") : t("admin.assignRole")}
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
                  <TableHead>{t("admin.name")}</TableHead>
                  <TableHead>{t("auth.email")}</TableHead>
                  <TableHead>{t("auth.nimNip")}</TableHead>
                  <TableHead>{t("admin.role")}</TableHead>
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
                          {user.user_roles[0].role === "admin" && t("admin.roleAdmin")}
                          {user.user_roles[0].role === "dosen" && t("admin.roleDosen")}
                          {user.user_roles[0].role === "mahasiswa" && t("admin.roleMahasiswa")}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">{t("admin.noRole")}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Watermark />
    </div>
  );
};

export default AdminDashboard;
