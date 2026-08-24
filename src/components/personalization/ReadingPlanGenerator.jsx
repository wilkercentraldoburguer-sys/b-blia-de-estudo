import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";

export default function ReadingPlanGenerator({ user, onPlanCreated }) {
  const [generating, setGenerating] = useState(false);
  const [objetivo, setObjetivo] = useState("conhecimento_geral");
  const [tempoDisponivel, setTempoDisponivel] = useState("15_min");
  const [interesses, setInteresses] = useState([]);

  const objetivos = [
    { value: "conhecimento_geral", label: "Conhecimento Geral", desc: "Visão ampla da Bíblia" },
    { value: "devocional_diario", label: "Devocional Diário", desc: "Reflexões espirituais" },
    { value: "estudo_profundo", label: "Estudo Profundo", desc: "Análise detalhada" },
    { value: "leitura_completa", label: "Leitura Completa", desc: "Toda a Bíblia em sequência" }
  ];

  const tempos = [
    { value: "5_min", label: "5 minutos", passagens: "1-2 passagens" },
    { value: "15_min", label: "15 minutos", passagens: "3-5 passagens" },
    { value: "30_min", label: "30 minutos", passagens: "1 capítulo" },
    { value: "1_hora", label: "1 hora", passagens: "2-3 capítulos" }
  ];

  const temas = [
    "Fé e Confiança",
    "Amor e Relacionamentos",
    "Sabedoria e Discernimento",
    "Oração e Intimidade",
    "Batalha Espiritual",
    "Promessas de Deus",
    "Família",
    "Liderança"
  ];

  const toggleInteresse = (tema) => {
    setInteresses(prev => 
      prev.includes(tema) 
        ? prev.filter(t => t !== tema)
        : [...prev, tema]
    );
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Crie um plano de leitura bíblico personalizado com as seguintes características:

Objetivo: ${objetivo}
Tempo disponível: ${tempoDisponivel}
Interesses: ${interesses.join(", ") || "Geral"}

Retorne um plano de 7 dias com passagens específicas da Bíblia.

JSON:
{
  "nome": "nome do plano",
  "descricao": "breve descrição",
  "tipo": "diario",
  "passagens": [
    {
      "livro": "nome do livro",
      "capitulo": número,
      "versiculo_inicio": número,
      "versiculo_fim": número,
      "concluido": false,
      "data_leitura": "data no formato YYYY-MM-DD"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            nome: { type: "string" },
            descricao: { type: "string" },
            tipo: { type: "string" },
            passagens: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  livro: { type: "string" },
                  capitulo: { type: "integer" },
                  versiculo_inicio: { type: "integer" },
                  versiculo_fim: { type: "integer" },
                  concluido: { type: "boolean" },
                  data_leitura: { type: "string" }
                },
                required: ["livro", "capitulo", "versiculo_inicio", "versiculo_fim"]
              }
            }
          },
          required: ["nome", "descricao", "tipo", "passagens"]
        }
      });

      const today = new Date();
      const planData = {
        ...response,
        data_inicio: today.toISOString().split('T')[0],
        data_fim: new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0],
        progresso: 0,
        ativo: true
      };

      await base44.entities.ReadingPlan.create(planData);

      // Save preferences
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      if (prefs.length > 0) {
        await base44.entities.UserPreferences.update(prefs[0].id, {
          objetivo_leitura: objetivo,
          tempo_disponivel: tempoDisponivel,
          interesses: interesses
        });
      } else {
        await base44.entities.UserPreferences.create({
          objetivo_leitura: objetivo,
          tempo_disponivel: tempoDisponivel,
          interesses: interesses
        });
      }

      onPlanCreated?.();
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
    }
    setGenerating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Gerar Plano Personalizado
        </CardTitle>
        <CardDescription>
          Crie um plano de leitura baseado nos seus interesses e disponibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">Qual seu objetivo?</Label>
          <RadioGroup value={objetivo} onValueChange={setObjetivo}>
            <div className="space-y-2">
              {objetivos.map((obj) => (
                <div key={obj.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={obj.value} id={obj.value} />
                  <Label htmlFor={obj.value} className="cursor-pointer">
                    <span className="font-medium">{obj.label}</span>
                    <span className="text-sm text-muted-foreground"> - {obj.desc}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Quanto tempo você tem por dia?</Label>
          <RadioGroup value={tempoDisponivel} onValueChange={setTempoDisponivel}>
            <div className="space-y-2">
              {tempos.map((tempo) => (
                <div key={tempo.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={tempo.value} id={tempo.value} />
                  <Label htmlFor={tempo.value} className="cursor-pointer">
                    <span className="font-medium">{tempo.label}</span>
                    <span className="text-sm text-muted-foreground"> - {tempo.passagens}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Temas de interesse (opcional)</Label>
          <div className="grid grid-cols-2 gap-2">
            {temas.map((tema) => (
              <div key={tema} className="flex items-center space-x-2">
                <Checkbox
                  id={tema}
                  checked={interesses.includes(tema)}
                  onCheckedChange={() => toggleInteresse(tema)}
                />
                <Label htmlFor={tema} className="cursor-pointer text-sm">
                  {tema}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={generatePlan}
          disabled={generating}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando plano personalizado...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Plano Personalizado
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}