import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Carregando...", subMessage = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#722f37' }} />
      <div className="text-center">
        <p className="text-stone-700 font-medium">{message}</p>
        {subMessage && (
          <p className="text-stone-500 text-sm mt-1">{subMessage}</p>
        )}
      </div>
    </div>
  );
}