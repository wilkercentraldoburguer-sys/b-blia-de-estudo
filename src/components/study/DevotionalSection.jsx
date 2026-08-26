import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, BookOpen, Loader2, Plus, Edit2, CheckCircle2 } from "lucide-react";
import { fetchChapterFromJSON } from "@/components/bible/bibleLoader";
import { DEFAULT_BIBLE_VERSION } from "@/components/bible/bibleVersions";

const BIBLE_BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
  "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras",
  "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares",
  "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oséias", "Joel",
  "Amós", "Obadias", "Jonas", "Miquéias", "Naum", "Habacuque", "Sofonias",
  "Ageu", "Zacarias", "Malaquias", "Mateus", "Marcos", "Lucas", "João", "Atos",
  "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios", "Filipenses",
  "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo",
  "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João",
  "3 João", "Judas", "Apocalipse"
];

export default function DevotionalSection({ user }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState("tema");
  const [tema, setTema] = useState("");
  const [livro, setLivro] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDevotional, setSelectedDevotional] = useState(null);
  const [personalNote, setPersonalNote] = useState("");

  const queryClient = useQueryClient();

  const { data: devotionals = [] } = useQuery({
    queryKey: ['devotionals'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Devotional.filter(
        { created_by: user.email },
        '-created_date'
      );
    },
    enabled: !!user,
  });

  const createDevotionalMutation = useMutation({
    mutationFn: (data) => base44.entities.Devotional.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotionals'] });
      setDialogOpen(false);
      setTema("");
      setLivro("");
    },
  });

  const updateDevotionalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Devotional.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devotionals'] });
      setViewDialogOpen(false);
    },
  });

  const handleGenerateDevotional = async () => {
    if (requestType === "tema" && !tema.trim()) return;
    if (requestType === "livro" && !livro) return;

    setIsGenerating(true);
    try {
      const prompt = requestType === "tema"
        ? `Crie um devocional cristão edificante sobre o tema "${tema}".`
        : `Crie um devocional cristão edificante baseado no livro bíblico ${livro}.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompt}

Retorne um JSON com:
{
  "titulo": "título inspirador do devocional",
  "tema": "tema principal",
  "livro_referencia": "livro bíblico usado",
  "versiculo_principal": "Livro cap:vers",
  "conteudo": "conteúdo do devocional (2-3 parágrafos edificantes e práticos)",
  "reflexao": "pergunta ou ponto de reflexão pessoal",
  "oracao_sugerida": "oração curta e significativa"
}

IMPORTANTE:
- NÃO escreva o texto do versículo - apenas a referência (ele será buscado de uma fonte bíblica real)
- Seja prático e aplicável à vida diária
- Use linguagem acessível e inspiradora
- Mantenha fidelidade bíblica
- Foco em edificação espiritual`,
        response_json_schema: {
          type: "object",
          properties: {
            titulo: { type: "string" },
            tema: { type: "string" },
            livro_referencia: { type: "string" },
            versiculo_principal: { type: "string" },
            conteudo: { type: "string" },
            reflexao: { type: "string" },
            oracao_sugerida: { type: "string" }
          },
          required: ["titulo", "conteudo", "versiculo_principal"]
        }
      });

      // Busca o texto REAL do versículo principal escolhido pela IA - o
      // texto sagrado nunca é gerado, apenas a referência é sugerida.
      let textoVersiculo = "";
      const match = response.versiculo_principal?.match(/^(.+?)\s+(\d+):(\d+)$/);
      if (match) {
        const [, refBook, refChapterStr, refVerseStr] = match;
        try {
          const data = await fetchChapterFromJSON(DEFAULT_BIBLE_VERSION, refBook.trim(), parseInt(refChapterStr, 10));
          textoVersiculo = data?.verses?.[parseInt(refVerseStr, 10) - 1]?.text || "";
        } catch (fetchError) {
          console.error("Erro ao buscar texto real do versículo do devocional:", fetchError);
        }
      }

      createDevotionalMutation.mutate({
        ...response,
        texto_versiculo: textoVersiculo,
        data_devocional: new Date().toISOString().split('T')[0],
        lido: false
      });
    } catch (error) {
      console.error("Erro ao gerar devocional:", error);
    }
    setIsGenerating(false);
  };

  const handleViewDevotional = (devotional) => {
    setSelectedDevotional(devotional);
    setPersonalNote(devotional.anotacao_pessoal || "");
    setViewDialogOpen(true);
    
    if (!devotional.lido) {
      updateDevotionalMutation.mutate({
        id: devotional.id,
        data: { lido: true }
      });
    }
  };

  const handleSaveNote = () => {
    if (!selectedDevotional) return;
    
    updateDevotionalMutation.mutate({
      id: selectedDevotional.id,
      data: { anotacao_pessoal: personalNote }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-rose-600" />
          <h2 className="text-2xl font-bold text-slate-800">Devocionais</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-rose-600 hover:bg-rose-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Devocional
        </Button>
      </div>

      {/* Lista de Devocionais */}
      {devotionals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              Nenhum devocional ainda. Gere seu primeiro devocional!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {devotionals.map((devotional) => (
            <Card
              key={devotional.id}
              className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-rose-400"
              onClick={() => handleViewDevotional(devotional)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{devotional.titulo}</span>
                  {devotional.lido && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <strong>Tema:</strong> {devotional.tema}
                  </p>
                  <p className="text-sm text-primary font-semibold">
                    {devotional.versiculo_principal}
                  </p>
                  <p className="text-sm text-slate-500 italic">
                    "{devotional.texto_versiculo?.substring(0, 100)}..."
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(devotional.created_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para Gerar Devocional */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Devocional</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Tipo de Devocional
              </label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tema">Por Tema</SelectItem>
                  <SelectItem value="livro">Por Livro Bíblico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {requestType === "tema" ? (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Tema
                </label>
                <Input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Fé, Amor, Perdão, Gratidão..."
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Livro Bíblico
                </label>
                <Select value={livro} onValueChange={setLivro}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {BIBLE_BOOKS.map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleGenerateDevotional}
                disabled={isGenerating}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  "Gerar Devocional"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Ver Devocional */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDevotional?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedDevotional && (
            <div className="space-y-6">
              {/* Versículo Principal */}
              <Card className="bg-card text-card-foreground border-none">
                <CardContent className="p-6">
                  <p className="text-lg leading-relaxed mb-3">
                    "{selectedDevotional.texto_versiculo}"
                  </p>
                  <p className="font-semibold">{selectedDevotional.versiculo_principal}</p>
                </CardContent>
              </Card>

              {/* Conteúdo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-rose-600" />
                    Reflexão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedDevotional.conteudo}
                  </p>
                </CardContent>
              </Card>

              {/* Ponto de Reflexão */}
              {selectedDevotional.reflexao && (
                <Card className="border-l-4 border-amber-400 bg-amber-50/30">
                  <CardContent className="p-4">
                    <p className="font-semibold text-amber-900 mb-2">
                      Para Refletir:
                    </p>
                    <p className="text-slate-700 italic">
                      {selectedDevotional.reflexao}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Oração Sugerida */}
              {selectedDevotional.oracao_sugerida && (
                <Card className="border-l-4 border-primary bg-primary/5">
                  <CardContent className="p-4">
                    <p className="font-semibold text-primary mb-2">
                      Oração:
                    </p>
                    <p className="text-slate-700 italic">
                      {selectedDevotional.oracao_sugerida}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Anotação Pessoal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-primary" />
                    Minha Reflexão Pessoal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="Escreva suas reflexões e aprendizados pessoais..."
                    className="min-h-32"
                  />
                  <Button
                    onClick={handleSaveNote}
                    className="mt-3 bg-primary hover:bg-primary/90"
                  >
                    Salvar Reflexão
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}