import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles } from "lucide-react";
import LoadingState from "../common/LoadingState";

export default function StudyGenerator({ 
  open, 
  onClose, 
  initialBook, 
  initialChapter, 
  initialVerse,
  onStudyGenerated 
}) {
  const [livro, setLivro] = useState(initialBook || "");
  const [capitulo, setCapitulo] = useState(initialChapter || 1);
  const [versiculoInicio, setVersiculoInicio] = useState(initialVerse || 1);
  const [versiculoFim, setVersiculoFim] = useState(initialVerse || 1);
  const [versao, setVersao] = useState("ARA");
  const [profundidade, setProfundidade] = useState("medio");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStudy = async () => {
    if (!livro || !capitulo || !versiculoInicio || !versiculoFim) return;

    setIsGenerating(true);
    try {
      const referencia = versiculoInicio === versiculoFim 
        ? `${livro} ${capitulo}:${versiculoInicio}`
        : `${livro} ${capitulo}:${versiculoInicio}-${versiculoFim}`;

      // Verificar se estudo já existe
      const existing = await base44.entities.BiblicalStudy.filter({
        livro,
        capitulo,
        versiculo_inicio: versiculoInicio,
        versiculo_fim: versiculoFim,
        profundidade
      });

      if (existing && existing.length > 0) {
        onStudyGenerated(existing[0]);
        onClose();
        return;
      }

      // Gerar novo estudo
      const nivelDescricao = {
        basico: "linguagem simples e direta, foco em entendimento básico, exemplos práticos",
        medio: "conexões bíblicas, temas relacionados, aplicação prática detalhada",
        avancado: "análise literária, contexto histórico profundo, teologia sistemática"
      };

      const prompt = `Gere um estudo bíblico completo para ${referencia} na versão ${versao}.
Nível de profundidade: ${profundidade} (${nivelDescricao[profundidade]})

═══════════════════════════════════════════
DIRETRIZES EDITORIAIS OBRIGATÓRIAS
═══════════════════════════════════════════

TOM DA ESCRITA:
- Linguagem clara, reverente e bíblica
- Sem jargões excessivos ou motivacional vazio
- Sem frases clichê ou promessas irreais
- Tom maduro, respeitoso e fundamentado

POSTURA TEOLÓGICA:
- Cristocêntrica (toda Escritura aponta para Cristo)
- Baseada rigorosamente no texto bíblico
- Humilde (não dogmática fora do que o texto diz)
- Respeitosa às diferentes tradições cristãs históricas

LIMITES ESPIRITUAIS:
- NÃO gerar profecias pessoais
- NÃO usar linguagem imperativa ("Deus está dizendo…")
- NÃO substituir o papel do pastor ou Espírito Santo
- SEMPRE incentivar confrontação com a igreja local

ESTRUTURA OBRIGATÓRIA:
- Começar sempre no texto bíblico
- Explicar antes de aplicar
- Aplicar sem distorcer o texto
- Concluir apontando para Deus, não para o usuário

═══════════════════════════════════════════
JSON DE RESPOSTA:
═══════════════════════════════════════════
{
  "contexto": "Contexto histórico, literário e teológico BASEADO NO TEXTO. Quem escreveu, quando, para quem, contexto da época.",
  "explicacao": "Explicação detalhada verso a verso ou por blocos. O QUE O TEXTO DIZ, não o que você acha que ele significa.",
  "aplicacao_pratica": "Aplicação nos dias de hoje com 3-5 exemplos REAIS e ATUAIS. Como viver este texto hoje SEM distorcê-lo.",
  "comparacao_visoes": "Contraste honesto entre a visão bíblica do texto e a visão cultural/secular atual. Sem arrogância.",
  "comparacao_versoes": [
    {"versao": "ARA", "diferenca_chave": "ênfase ou palavra única desta versão"},
    {"versao": "NVI", "diferenca_chave": "diferença principal"},
    {"versao": "ARC", "diferenca_chave": "diferença principal"}
  ],
  "referencias_estudo": [
    {"referencia": "Livro cap:vers", "relacao": "como se conecta com o texto estudado"},
    {"referencia": "Livro cap:vers", "relacao": "relação temática ou teológica"}
  ],
  "quiz": [
    {
      "pergunta": "Pergunta sobre o texto",
      "opcoes": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
      "resposta_correta": 0,
      "explicacao": "Por que esta é a resposta correta"
    }
  ],
  "reflexao": "Reflexão pessoal guiada com PERGUNTAS PRÁTICAS. Como este texto me desafia? O que Deus está ensinando através dele?",
  "oracao": "Oração DEPENDENTE de Deus, baseada no texto. Sem declarações de posse. Centrada na vontade do Senhor."
}

REGRAS FINAIS:
✓ Mínimo 5 perguntas no quiz
✓ Aplicação prática DEVE ter exemplos reais e concretos
✓ Reflexão DEVE incluir perguntas práticas para vida
✓ Não impor interpretações além do texto
✓ Sempre apontar para Cristo
✓ Incentivar leitura bíblica e comunhão na igreja local
✓ Linguagem clara, sem triunfalismo vazio

NUNCA FAÇA:
✗ Profecias pessoais
✗ "Deus está mandando você..."
✗ Aconselhamento direto para decisões críticas
✗ Substituir o papel do Espírito Santo ou pastor`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            contexto: { type: "string" },
            explicacao: { type: "string" },
            aplicacao_pratica: { type: "string" },
            comparacao_visoes: { type: "string" },
            comparacao_versoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  versao: { type: "string" },
                  diferenca_chave: { type: "string" }
                }
              }
            },
            referencias_estudo: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  referencia: { type: "string" },
                  relacao: { type: "string" }
                }
              }
            },
            quiz: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pergunta: { type: "string" },
                  opcoes: {
                    type: "array",
                    items: { type: "string" }
                  },
                  resposta_correta: { type: "integer" },
                  explicacao: { type: "string" }
                }
              }
            },
            reflexao: { type: "string" },
            oracao: { type: "string" }
          },
          required: ["contexto", "explicacao", "aplicacao_pratica", "comparacao_visoes", "comparacao_versoes", "referencias_estudo", "quiz", "reflexao", "oracao"]
        }
      });

      // Salvar estudo
      const study = await base44.entities.BiblicalStudy.create({
        referencia,
        livro,
        capitulo,
        versiculo_inicio: versiculoInicio,
        versiculo_fim: versiculoFim,
        versao,
        profundidade,
        ...response,
        concluido: false,
        progresso: 0
      });

      onStudyGenerated(study);
      onClose();
    } catch (error) {
      console.error("Erro ao gerar estudo:", error);
      alert("Erro ao gerar estudo. Tente novamente.");
    }
    setIsGenerating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            Gerar Estudo Bíblico
          </DialogTitle>
        </DialogHeader>

        {isGenerating ? (
          <LoadingState 
            message="Gerando estudo bíblico completo..." 
            subMessage="Isso pode levar alguns segundos"
          />
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Livro</Label>
              <Input
                value={livro}
                onChange={(e) => setLivro(e.target.value)}
                placeholder="Ex: João"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Capítulo</Label>
                <Input
                  type="number"
                  value={capitulo}
                  onChange={(e) => setCapitulo(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label>Vers. Início</Label>
                <Input
                  type="number"
                  value={versiculoInicio}
                  onChange={(e) => setVersiculoInicio(parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label>Vers. Fim</Label>
                <Input
                  type="number"
                  value={versiculoFim}
                  onChange={(e) => setVersiculoFim(parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label>Versão da Bíblia</Label>
              <Select value={versao} onValueChange={setVersao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARA">ARA</SelectItem>
                  <SelectItem value="ARC">ARC</SelectItem>
                  <SelectItem value="NVI">NVI</SelectItem>
                  <SelectItem value="NAA">NAA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Profundidade</Label>
              <RadioGroup value={profundidade} onValueChange={setProfundidade}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="basico" id="basico" />
                  <Label htmlFor="basico" className="cursor-pointer">
                    Básico - Linguagem simples, foco em entendimento
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medio" id="medio" />
                  <Label htmlFor="medio" className="cursor-pointer">
                    Médio - Conexões bíblicas e aplicação prática
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="avancado" id="avancado" />
                  <Label htmlFor="avancado" className="cursor-pointer">
                    Avançado - Análise literária e histórica
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={generateStudy}
                className="bg-primary text-primary-foreground"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Estudo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}