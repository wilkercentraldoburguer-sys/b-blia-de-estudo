import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

export default function DailyVerseRecommendation({ user }) {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyVerse();
  }, [user]);

  const loadDailyVerse = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      const userPrefs = prefs[0];

      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have today's recommendation
      if (userPrefs?.ultima_recomendacao === today) {
        // Use cached verse (could be stored in preferences)
        setLoading(false);
        return;
      }

      // Get user's reading history and interests
      const highlights = await base44.entities.Highlight.filter({ created_by: user.email });
      const favorites = await base44.entities.Favorite.filter({ created_by: user.email });
      const notes = await base44.entities.Note.filter({ created_by: user.email });

      const interesses = userPrefs?.interesses || [];
      const objetivo = userPrefs?.objetivo_leitura || "conhecimento_geral";

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Recomende um versículo bíblico personalizado para hoje baseado no seguinte perfil:

Interesses: ${interesses.join(", ") || "Geral"}
Objetivo de leitura: ${objetivo}
Atividade recente: ${highlights.length} destaques, ${favorites.length} favoritos, ${notes.length} anotações

Escolha um versículo relevante, edificante e apropriado para o momento.

JSON:
{
  "referencia": "Livro Capítulo:Versículo",
  "texto": "texto completo do versículo",
  "razao": "breve explicação de por que este versículo é relevante para o usuário hoje",
  "tema": "tema principal"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            referencia: { type: "string" },
            texto: { type: "string" },
            razao: { type: "string" },
            tema: { type: "string" }
          },
          required: ["referencia", "texto", "razao", "tema"]
        }
      });

      setVerse(response);

      // Update last recommendation date
      if (userPrefs) {
        await base44.entities.UserPreferences.update(userPrefs.id, {
          ultima_recomendacao: today
        });
      }
    } catch (error) {
      console.error("Erro ao carregar recomendação:", error);
    }
    setLoading(false);
  };

  const refreshVerse = () => {
    loadDailyVerse();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (!verse) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-5 h-5" />
            Versículo do Dia para Você
          </span>
          <Button size="sm" variant="ghost" onClick={refreshVerse}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-purple-700 mb-2">{verse.referencia}</p>
          <p className="text-lg leading-relaxed text-slate-800 italic mb-3">
            "{verse.texto}"
          </p>
          <div className="p-3 bg-white/50 rounded-lg">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Por que este versículo hoje:</span> {verse.razao}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {verse.tema}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}