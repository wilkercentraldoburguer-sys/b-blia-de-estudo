import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function SpiritualDisclaimer({ context = "geral" }) {
  const messages = {
    geral: "A Palavra de Deus é a autoridade final. Este app é um auxílio ao estudo.",
    estudo: "Este estudo é um auxílio. A Palavra de Deus é a autoridade final. Ore, consulte as Escrituras e confirme com sua comunidade de fé.",
    quiz: "O objetivo é aprendizado bíblico, não avaliação espiritual. Use este quiz para fortalecer seu conhecimento da Palavra.",
    comunidade: "Compartilhe com respeito e edificação. Discussões doutrinárias profundas devem ocorrer em comunhão com sua igreja local."
  };

  return (
    <Alert className="bg-amber-50 border-amber-300">
      <AlertCircle className="w-4 h-4 text-amber-700" />
      <AlertDescription className="text-xs text-amber-900 leading-relaxed">
        {messages[context] || messages.geral}
      </AlertDescription>
    </Alert>
  );
}