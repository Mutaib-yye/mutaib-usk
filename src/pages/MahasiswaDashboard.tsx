import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, TrendingUp, LogOut } from "lucide-react";
import { toast } from "sonner";

const MahasiswaDashboard = () => {
  const { signOut, profile, user } = useAuth();
  const [nilai, setNilai] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNilai();
  }, [user]);

  const fetchNilai = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("nilai")
      .select(`
        *,
        mata_kuliah:mata_kuliah(id, kode_mk, nama_mata_kuliah, sks, semester),
        dosen:profiles!nilai_dosen_id_fkey(id, nama_lengkap)
      `)
      .eq("mahasiswa_id", user.id)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      toast.error("Gagal memuat nilai");
    } else {
      setNilai(data || []);
    }
  };

  const calculateIPK = () => {
    if (nilai.length === 0) return 0;

    const bobotNilai: any = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, E: 0.0 };
    let totalBobot = 0;
    let totalSks = 0;

    nilai.forEach((n) => {
      const bobot = bobotNilai[n.nilai_huruf] || 0;
      const sks = n.mata_kuliah?.sks || 0;
      totalBobot += bobot * sks;
      totalSks += sks;
    });

    return totalSks > 0 ? (totalBobot / totalSks).toFixed(2) : 0;
  };

  const getTotalSks = () => {
    return nilai.reduce((sum, n) => sum + (n.mata_kuliah?.sks || 0), 0);
  };

  const ipk = calculateIPK();
  const totalSks = getTotalSks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-primary/5">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-success rounded-lg p-2">
              <Award className="w-6 h-6 text-success-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard Mahasiswa</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.nama_lengkap} - NIM: {profile?.nim_nip}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5 text-success" />
                IPK
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-success">{ipk}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-5 h-5 text-primary" />
                Total SKS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary">{totalSks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-5 h-5 text-accent" />
                Mata Kuliah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent">{nilai.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Nilai Section */}
        <Card>
          <CardHeader>
            <CardTitle>Transkrip Nilai</CardTitle>
            <CardDescription>Daftar nilai mata kuliah yang telah Anda ambil</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : nilai.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">Belum ada nilai</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Nilai akan muncul setelah dosen menginput nilai Anda
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Mata Kuliah</TableHead>
                    <TableHead>SKS</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Dosen</TableHead>
                    <TableHead>Nilai Angka</TableHead>
                    <TableHead>Nilai Huruf</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nilai.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-medium">
                        {n.mata_kuliah?.kode_mk}
                      </TableCell>
                      <TableCell>{n.mata_kuliah?.nama_mata_kuliah}</TableCell>
                      <TableCell>{n.mata_kuliah?.sks} SKS</TableCell>
                      <TableCell>
                        <Badge variant="outline">Semester {n.mata_kuliah?.semester}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {n.dosen?.nama_lengkap}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{n.nilai_angka}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            n.nilai_huruf === "A"
                              ? "default"
                              : n.nilai_huruf === "B"
                              ? "secondary"
                              : n.nilai_huruf === "C"
                              ? "outline"
                              : "destructive"
                          }
                          className="text-base px-3"
                        >
                          {n.nilai_huruf}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Keterangan Nilai */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Keterangan Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <Badge className="mb-2">A</Badge>
                <p className="text-sm text-muted-foreground">85 - 100</p>
              </div>
              <div className="text-center p-3 bg-secondary/10 rounded-lg">
                <Badge variant="secondary" className="mb-2">B</Badge>
                <p className="text-sm text-muted-foreground">70 - 84</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="mb-2">C</Badge>
                <p className="text-sm text-muted-foreground">55 - 69</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="mb-2">D</Badge>
                <p className="text-sm text-muted-foreground">40 - 54</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <Badge variant="destructive" className="mb-2">E</Badge>
                <p className="text-sm text-muted-foreground">0 - 39</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MahasiswaDashboard;
