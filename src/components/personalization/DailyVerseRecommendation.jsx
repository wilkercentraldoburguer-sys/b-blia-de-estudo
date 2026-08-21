import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { fetchChapterFromJSON } from "@/components/bible/bibleLoader";
import { fetchRandomVerse } from "@/components/bible/abibliaBibleProvider";

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

      // A IA escolhe APENAS a referência e o comentário personalizado - o
      // texto do versículo em si nunca é gerado por ela, é sempre buscado
      // de uma fonte bíblica real (evita qualquer risco de imprecisão no
      // texto sagrado).
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Recomende a REFERÊNCIA de um versículo bíblico personalizado para hoje baseado no seguinte perfil:

Interesses: ${interesses.join(", ") || "Geral"}
Objetivo de leitura: ${objetivo}
Atividade recente: ${highlights.length} destaques, ${favorites.length} favoritos, ${notes.length} anotações

Escolha um versículo relevante, edificante e apropriado para o momento.
NÃO escreva o texto do versículo - apenas a referência exata, o motivo da recomendação e o tema.

JSON:
{
  "referencia": "Livro Capítulo:Versículo",
  "razao": "breve explicação de por que este versículo é relevante para o usuário hoje",
  "tema": "tema principal"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            referencia: { type: "string" },
            razao: { type: "string" },
            tema: { type: "string" }
          },
          required: ["referencia", "razao", "tema"]
        }
      });

      // Busca o texto REAL do versículo recomendado.
      let texto = null;
      let referenciaFinal = response.referencia;
      const match = response.referencia?.match(/^(.+?)\s+(\d+):(\d+)$/);
      if (match) {
        const [, book, chapterStr, verseStr] = match;
        try {
          const data = await fetchChapterFromJSON("ARA", book.trim(), parseInt(chapterStr, 10));
          const verseData = data?.verses?.[parseInt(verseStr, 10) - 1];
          texto = verseData?.text || null;
        } catch (fetchError) {
          console.error("Erro ao buscar texto real do versículo recomendado:", fetchError);
        }
      }

      if (!texto) {
        // Não foi possível confirmar o texto real da referência sugerida -
        // em vez de arriscar mostrar um texto impreciso, usa um versículo
        // real aleatório como alternativa segura.
        const fallback = await fetchRandomVerse("ARA");
        texto = fallback.text;
        referenciaFinal = `${fallback.book} ${fallback.chapter}:${fallback.verse}`;
      }

      setVerse({
        referencia: referenciaFinal,
        texto,
        razao: response.razao,
        tema: response.tema
      });

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
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  if (!verse) return null;

  return (
    <Card className="bg-primary border-primary">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-primary-foreground">
            <Sparkles className="w-5 h-5 text-brand-amber" />
            Versículo do Dia para Você
          </span>
          <Button size="sm" variant="ghost" onClick={refreshVerse} className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-brand-amber mb-2">{verse.referencia}</p>
          <p className="font-display text-lg leading-relaxed text-primary-foreground italic mb-3">
            "{verse.texto}"
          </p>
          <div className="p-3 bg-white/[0.06] border border-white/10 rounded-lg">
            <p className="text-sm text-primary-foreground/80">
              <span className="font-semibold text-primary-foreground">Por que este versículo hoje:</span> {verse.razao}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-brand-amber/15 text-brand-amber border border-brand-amber/30 rounded-full">
            {verse.tema}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}