import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2 } from "lucide-react";

const Index = () => {
  const { user, userRole, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else {
        // User is logged in
        if (userRole) {
          // User has a role, redirect to appropriate dashboard
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
        } else {
          // User logged in but has no role - show message
          console.log("User has no role assigned yet");
        }
      }
    }
  }, [user, userRole, loading, navigate]);

  // Show message if user has no role
  if (!loading && user && !userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto bg-destructive rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-14 h-14 text-destructive-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-secondary">{t("home.accountNotActivated")}</h1>
            <p className="text-muted-foreground">
              {t("home.accountNotActivatedDesc")}
            </p>
          </div>
          <Button onClick={() => { signOut(); }} variant="outline">
            {t("common.logout")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="text-center space-y-6">
        <div className="mx-auto bg-primary rounded-full w-24 h-24 flex items-center justify-center animate-pulse shadow-lg">
          <GraduationCap className="w-14 h-14 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">{t("university.name")}</h1>
          <h2 className="text-xl font-semibold">{t("university.system")}</h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("home.loadingApp")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
