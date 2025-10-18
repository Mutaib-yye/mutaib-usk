import { Heart } from "lucide-react";

export const Watermark = () => {
  return (
    <div className="fixed bottom-4 right-4 watermark flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity">
      <span>Made with</span>
      <Heart className="w-3 h-3 fill-current" />
      <span>by <span className="font-semibold">Mutaib</span></span>
    </div>
  );
};
