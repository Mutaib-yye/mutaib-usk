import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "id" ? "en" : "id")}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-medium">
        {language === "id" ? "EN" : "ID"}
      </span>
    </Button>
  );
};
