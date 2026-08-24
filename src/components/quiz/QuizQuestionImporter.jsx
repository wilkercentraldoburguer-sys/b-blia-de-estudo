import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { QUIZ_SEED_DATA } from "./quizSeedData";

const LEVEL_LABELS = {
  facil: "Fácil",
  intermediario: "Intermediário",
  dificil: "Difícil",
  expert: "Expert",
};

/**
 * Importador único do banco de 200 perguntas do Quiz Bíblico (ver
 * quizSeedData.jsx) para a entidade QuizQuestion do Base44. Não roda
 * automaticamente - precisa ser clicado por um administrador autenticado
 * no app publicado, já que este ambiente de edição não tem acesso ao
 * banco de dados ao vivo.
 *
 * Evita duplicar perguntas: antes de criar, busca as perguntas já
 * existentes e pula qualquer combinação (nivel + numero) que já esteja
 * cadastrada.
 */
export default function QuizQuestionImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }
  const [result, setResult] = useState(null); // { created, skipped, failed: [] }

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);
    setProgress({ done: 0, total: QUIZ_SEED_DATA.length });

    let existing = [];
    try {
      existing = await base44.entities.QuizQuestion.list();
    } catch (error) {
      setResult({
        created: 0,
        skipped: 0,
        failed: [{ pergunta: "(carregar perguntas existentes)", message: error.message }],
      });
      setIsImporting(false);
      setProgress(null);
      return;
    }

    const existingKeys = new Set(
      existing.map((q) => `${q.nivel}::${q.numero}`)
    );

    let created = 0;
    let skipped = 0;
    const failed = [];

    for (let i = 0; i < QUIZ_SEED_DATA.length; i++) {
      const item = QUIZ_SEED_DATA[i];
      const key = `${item.nivel}::${item.numero}`;

      if (existingKeys.has(key)) {
        skipped++;
      } else {
        try {
          await base44.entities.QuizQuestion.create(item);
          existingKeys.add(key);
          created++;
        } catch (error) {
          failed.push({ pergunta: item.pergunta, message: error.message });
        }
      }

      setProgress({ done: i + 1, total: QUIZ_SEED_DATA.length });
    }

    setResult({ created, skipped, failed });
    setIsImporting(false);
    setProgress(null);
  };

  const countsByLevel = QUIZ_SEED_DATA.reduce((acc, q) => {
    acc[q.nivel] = (acc[q.nivel] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Importa as 200 perguntas do banco licenciado (
        {Object.entries(countsByLevel)
          .map(([nivel, count]) => `${count} ${LEVEL_LABELS[nivel] || nivel}`)
          .join(", ")}
        ) para a aba Quiz. Pode ser clicado com segurança mais de uma vez -
        perguntas já importadas (mesmo nível + número) são puladas
        automaticamente, nunca duplicadas.
      </p>

      <Button onClick={handleImport} disabled={isImporting} className="w-full">
        {isImporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Importando{progress ? ` (${progress.done}/${progress.total})` : "..."}
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 mr-2" />
            Importar 200 Perguntas do Quiz
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-2">
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>
                {result.created} pergunta(s) criada(s), {result.skipped} já
                existiam e foram puladas.
              </span>
            </AlertDescription>
          </Alert>

          {result.failed.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{result.failed.length} pergunta(s) falharam:</span>
                </div>
                <ul className="text-xs space-y-1 pl-6 list-disc">
                  {result.failed.slice(0, 10).map((f, idx) => (
                    <li key={idx}>
                      {f.pergunta}: {f.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
