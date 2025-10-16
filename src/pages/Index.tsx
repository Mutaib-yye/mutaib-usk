import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Loader2 } from "lucide-react";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole) {
        switch (userRole) {
          case "admin":
            navigate("/admin");
            break;
          case "dosen":
            navigate("/dosen");
            break;
          case "mahasiswa":
            navigate("/mahasiswa");
            break;
          default:
            navigate("/auth");
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="text-center space-y-6">
        <div className="mx-auto bg-primary rounded-full w-24 h-24 flex items-center justify-center animate-pulse">
          <GraduationCap className="w-14 h-14 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sistem Informasi Perkuliahan</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat aplikasi...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
