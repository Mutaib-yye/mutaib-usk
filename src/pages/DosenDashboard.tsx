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
import { BookOpen, GraduationCap, Plus, Edit, LogOut } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const nilaiSchema = z.object({
  nilaiAngka: z.number().min(0).max(100),
});

const DosenDashboard = () => {
  const { signOut, profile, user } = useAuth();
  const [mataKuliah, setMataKuliah] = useState<any[]>([]);
  const [mahasiswa, setMahasiswa] = useState<any[]>([]);
  const [nilai, setNilai] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNilai, setEditingNilai] = useState<any>(null);

  // Form states
  const [selectedMahasiswa, setSelectedMahasiswa] = useState("");
  const [selectedMataKuliah, setSelectedMataKuliah] = useState("");
  const [nilaiAngka, setNilaiAngka] = useState(0);

  useEffect(() => {
    fetchMataKuliah();
    fetchMahasiswa();
    fetchNilai();
  }, []);

  const fetchMataKuliah = async () => {
    const { data, error } = await supabase
      .from("mata_kuliah")
      .select("*")
      .order("semester", { ascending: true });

    if (!error) {
      setMataKuliah(data || []);
    }
  };

  const fetchMahasiswa = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles!inner(role)
      `)
      .eq("user_roles.role", "mahasiswa");

    if (!error) {
      setMahasiswa(data || []);
    }
  };

  const fetchNilai = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("nilai")
      .select(`
        *,
        mahasiswa:profiles!nilai_mahasiswa_id_fkey(id, nama_lengkap, nim_nip),
        mata_kuliah:mata_kuliah(id, kode_mk, nama_mata_kuliah, sks),
        dosen:profiles!nilai_dosen_id_fkey(id, nama_lengkap)
      `)
      .eq("dosen_id", user.id);

    if (!error) {
      setNilai(data || []);
    }
  };

  const hitungNilaiHuruf = (angka: number): string => {
    if (angka >= 85) return "A";
    if (angka >= 70) return "B";
    if (angka >= 55) return "C";
    if (angka >= 40) return "D";
    return "E";
  };

  const handleSaveNilai = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = nilaiSchema.safeParse({ nilaiAngka });
    if (!result.success) {
      toast.error("Nilai harus antara 0-100");
      return;
    }

    if (!selectedMahasiswa || !selectedMataKuliah) {
      toast.error("Pilih mahasiswa dan mata kuliah");
      return;
    }

    setLoading(true);

    const nilaiHuruf = hitungNilaiHuruf(nilaiAngka);
    const nilaiData = {
      mahasiswa_id: selectedMahasiswa,
      mata_kuliah_id: selectedMataKuliah,
      dosen_id: user?.id,
      nilai_angka: nilaiAngka,
      nilai_huruf: nilaiHuruf,
    };

    let error;
    if (editingNilai) {
      ({ error } = await supabase
        .from("nilai")
        .update({
          nilai_angka: nilaiAngka,
          nilai_huruf: nilaiHuruf,
        })
        .eq("id", editingNilai.id));
    } else {
      ({ error } = await supabase
        .from("nilai")
        .insert([nilaiData]));
    }

    setLoading(false);

    if (error) {
      toast.error("Gagal menyimpan nilai: " + error.message);
    } else {
      toast.success(editingNilai ? "Nilai berhasil diperbarui!" : "Nilai berhasil ditambahkan!");
      setDialogOpen(false);
      resetForm();
      fetchNilai();
    }
  };

  const handleEditNilai = (nilai: any) => {
    setEditingNilai(nilai);
    setSelectedMahasiswa(nilai.mahasiswa_id);
    setSelectedMataKuliah(nilai.mata_kuliah_id);
    setNilaiAngka(nilai.nilai_angka);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingNilai(null);
    setSelectedMahasiswa("");
    setSelectedMataKuliah("");
    setNilaiAngka(0);
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
              <p className="text-sm opacity-90">Dashboard Dosen</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5 text-accent" />
                Mata Kuliah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{mataKuliah.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="w-5 h-5 text-primary" />
                Mahasiswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{mahasiswa.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Edit className="w-5 h-5 text-success" />
                Nilai Diinput
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">{nilai.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Nilai Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Daftar Nilai</CardTitle>
                <CardDescription>Input dan kelola nilai mahasiswa</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Input Nilai
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingNilai ? "Edit Nilai" : "Input Nilai"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveNilai} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mahasiswa">Mahasiswa</Label>
                      <Select 
                        value={selectedMahasiswa} 
                        onValueChange={setSelectedMahasiswa}
                        disabled={!!editingNilai}
                      >
                        <SelectTrigger id="mahasiswa">
                          <SelectValue placeholder="Pilih mahasiswa" />
                        </SelectTrigger>
                        <SelectContent>
                          {mahasiswa.map((mhs) => (
                            <SelectItem key={mhs.id} value={mhs.id}>
                              {mhs.nama_lengkap} - {mhs.nim_nip}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mata-kuliah">Mata Kuliah</Label>
                      <Select 
                        value={selectedMataKuliah} 
                        onValueChange={setSelectedMataKuliah}
                        disabled={!!editingNilai}
                      >
                        <SelectTrigger id="mata-kuliah">
                          <SelectValue placeholder="Pilih mata kuliah" />
                        </SelectTrigger>
                        <SelectContent>
                          {mataKuliah.map((mk) => (
                            <SelectItem key={mk.id} value={mk.id}>
                              {mk.kode_mk} - {mk.nama_mata_kuliah}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nilai-angka">Nilai (0-100)</Label>
                      <Input
                        id="nilai-angka"
                        type="number"
                        min="0"
                        max="100"
                        value={nilaiAngka}
                        onChange={(e) => setNilaiAngka(parseFloat(e.target.value))}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Nilai huruf: <strong>{hitungNilaiHuruf(nilaiAngka)}</strong>
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Menyimpan..." : editingNilai ? "Perbarui" : "Simpan"}
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
                  <TableHead>Mahasiswa</TableHead>
                  <TableHead>NIM</TableHead>
                  <TableHead>Mata Kuliah</TableHead>
                  <TableHead>Nilai Angka</TableHead>
                  <TableHead>Nilai Huruf</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nilai.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.mahasiswa?.nama_lengkap}</TableCell>
                    <TableCell>{n.mahasiswa?.nim_nip}</TableCell>
                    <TableCell>{n.mata_kuliah?.nama_mata_kuliah}</TableCell>
                    <TableCell>{n.nilai_angka}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          n.nilai_huruf === "A" ? "default" :
                          n.nilai_huruf === "B" ? "secondary" :
                          n.nilai_huruf === "C" ? "outline" :
                          "destructive"
                        }
                      >
                        {n.nilai_huruf}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditNilai(n)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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

export default DosenDashboard;
