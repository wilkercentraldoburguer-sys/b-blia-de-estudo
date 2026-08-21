import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookMarked, Menu, Loader2, MapPin, Clock, Key, AlertCircle, Link2, User, MessageSquare, Edit, GitCompare, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BookSelector from "../components/bible/BookSelector";
import ChapterNavigation from "../components/bible/ChapterNavigation";
import DevotionalSection from "../components/study/DevotionalSection";
import StudyGenerator from "../components/study/StudyGenerator";
import StudyViewer from "../components/study/StudyViewer";
import { fetchChapterFromJSON } from "../components/bible/bibleLoader";
import { fetchMatthewHenryCommentary } from "../components/bible/matthewHenryProvider";

export default function Study() {
  const [currentBook, setCurrentBook] = useState("João");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [totalChapters, setTotalChapters] = useState(21);
  const [selectedVerse, setSelectedVerse] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [optionalCommentaries, setOptionalCommentaries] = useState([]);
  const [crossReferences, setCrossReferences] = useState([]);
  const [user, setUser] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState(["ARA", "NVI", "ARC"]);
  const [comparisonData, setComparisonData] = useState([]);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [activeTab, setActiveTab] = useState("estudo");
  const [studyGeneratorOpen, setStudyGeneratorOpen] = useState(false);
  const [currentStudy, setCurrentStudy] = useState(null);
  const [myStudies, setMyStudies] = useState([]);

  const BIBLE_VERSIONS = [
    { sigla: "ARA", nome: "Almeida Revista e Atualizada" },
    { sigla: "ARC", nome: "Almeida Revista e Corrigida" },
    { sigla: "NVI", nome: "Nova Versão Internacional" },
    { sigla: "NVT", nome: "Nova Versão Transformadora" },
    { sigla: "ACF", nome: "Almeida Corrigida Fiel" },
    { sigla: "KJV", nome: "King James Version" },
    { sigla: "NAA", nome: "Nova Almeida Atualizada" }
  ];

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
    loadStudies();
    checkUrlParams();
  }, []);

  const checkUrlParams = async () => {
    const params = new URLSearchParams(window.location.search);
    const studyId = params.get('study');
    if (studyId) {
      const study = await base44.entities.BiblicalStudy.filter({ id: studyId });
      if (study && study.length > 0) {
        setCurrentStudy(study[0]);
      }
    }
  };

  const loadStudies = async () => {
    try {
      const studies = await base44.entities.BiblicalStudy.list('-created_date', 50);
      setMyStudies(studies);
    } catch (error) {
      console.error("Erro ao carregar estudos:", error);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      if (!user) return null;
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0] || null;
    },
    enabled: !!user,
  });

  const { data: existingNote } = useQuery({
    queryKey: ['note', currentBook, currentChapter, selectedVerse],
    queryFn: async () => {
      if (!user) return null;
      const notes = await base44.entities.Note.filter({
        book: currentBook,
        chapter: currentChapter,
        verse: selectedVerse,
        created_by: user.email
      });
      return notes[0] || null;
    },
    enabled: !!user && !!currentBook && !!currentChapter && !!selectedVerse,
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data) => {
      if (existingNote?.id) {
        return await base44.entities.Note.update(existingNote.id, data);
      } else {
        return await base44.entities.Note.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note'] });
      setNoteDialogOpen(false);
      setNoteText("");
    },
  });

  const handleOpenNoteDialog = () => {
    setNoteText(existingNote?.note_text || "");
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteText.trim() || !studyData) return;
    
    saveNoteMutation.mutate({
      book: currentBook,
      chapter: currentChapter,
      verse: selectedVerse,
      note_text: noteText,
      verse_text: studyData.versiculo_texto
    });
  };

  const loadComparison = async () => {
    setIsLoadingComparison(true);
    setCompareDialogOpen(true);
    
    const comparisons = [];
    
    for (const versionSigla of selectedVersions) {
      const version = BIBLE_VERSIONS.find(v => v.sigla === versionSigla);
      if (!version) continue;

      try {
        // Busca o texto real do versículo nessa versão em vez de pedir
        // pra uma IA "lembrar" o texto.
        const data = await fetchChapterFromJSON(versionSigla, currentBook, currentChapter);
        const verseData = data?.verses?.[selectedVerse - 1];

        if (verseData) {
          comparisons.push({
            sigla: versionSigla,
            nome: version.nome,
            texto: verseData.text
          });
        }
      } catch (error) {
        console.error(`Erro ao carregar versão ${versionSigla}:`, error);
      }
    }
    
    setComparisonData(comparisons);
    setIsLoadingComparison(false);
  };

  const toggleVersion = (sigla) => {
    if (selectedVersions.includes(sigla)) {
      if (selectedVersions.length > 1) {
        setSelectedVersions(selectedVersions.filter(v => v !== sigla));
      }
    } else {
      setSelectedVersions([...selectedVersions, sigla]);
    }
  };

  useEffect(() => {
    loadStudy();
  }, [currentBook, currentChapter, selectedVerse]);

  const loadStudy = async () => {
    setIsLoading(true);
    try {
      // 1) Busca o texto REAL do versículo primeiro - nunca é gerado por IA.
      const chapterData = await fetchChapterFromJSON("ARA", currentBook, currentChapter);
      const versiculoTexto = chapterData?.verses?.[selectedVerse - 1]?.text || "";

      // 2) A IA só é usada para o material interpretativo (contexto,
      // palavras-chave, comentário e sugestão de referências cruzadas) -
      // nunca para "gerar" o texto bíblico em si.
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Considere ${currentBook} ${currentChapter}:${selectedVerse}, cujo texto bíblico real (ARA) é:
"${versiculoTexto}"

Crie o material de apoio para o estudo deste versículo.

Retorne um JSON com esta estrutura:

{
  "explicacao_basica": {
    "contexto_historico": "breve contexto histórico da passagem",
    "palavras_chave": ["palavra1", "palavra2", "palavra3"],
    "mapa_contexto": "descrição geográfica se aplicável, senão null"
  },
  "comentario_principal": {
    "texto": "comentário devocional próprio, simples, teológico, objetivo e fiel ao texto acima"
  },
  "referencias_cruzadas": [
    {"referencia": "Livro cap:vers", "explicacao": "breve explicação da conexão"},
    {"referencia": "Livro cap:vers", "explicacao": "breve explicação da conexão"}
  ]
}

IMPORTANTE:
- NÃO invente ou reescreva o texto do versículo, use apenas o texto fornecido acima como base
- Nas referências cruzadas, retorne SOMENTE a referência e a explicação da conexão - NÃO escreva o texto do versículo referenciado (ele será buscado de uma fonte real depois)
- Explique o significado literal e teológico
- Evite especulações
- Seja fiel ao texto bíblico
- Linguagem clara e acessível

Referências cruzadas devem incluir 3-5 versículos relevantes e relacionados`,
        response_json_schema: {
          type: "object",
          properties: {
            explicacao_basica: {
              type: "object",
              properties: {
                contexto_historico: { type: "string" },
                palavras_chave: {
                  type: "array",
                  items: { type: "string" }
                },
                mapa_contexto: {
                  type: ["string", "null"]
                }
              },
              required: ["contexto_historico", "palavras_chave"]
            },
            comentario_principal: {
              type: "object",
              properties: {
                texto: { type: "string" }
              },
              required: ["texto"]
            },
            referencias_cruzadas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  referencia: { type: "string" },
                  explicacao: { type: "string" }
                },
                required: ["referencia", "explicacao"]
              }
            }
          },
          required: ["explicacao_basica", "comentario_principal", "referencias_cruzadas"]
        }
      });

      // 3) Busca o texto REAL de cada referência cruzada sugerida pela IA
      // (a IA só escolhe QUAIS referências são relevantes, o texto vem
      // sempre de uma fonte bíblica real).
      const referenciasComTexto = await Promise.all(
        (response.referencias_cruzadas || []).map(async (ref) => {
          const match = ref.referencia?.match(/^(.+?)\s+(\d+):(\d+)$/);
          if (!match) return null;
          const [, refBook, refChapterStr, refVerseStr] = match;
          try {
            const refData = await fetchChapterFromJSON("ARA", refBook.trim(), parseInt(refChapterStr, 10));
            const refVerseData = refData?.verses?.[parseInt(refVerseStr, 10) - 1];
            if (!refVerseData) return null;
            return { ...ref, texto: refVerseData.text };
          } catch (refError) {
            console.error(`Erro ao buscar referência cruzada ${ref.referencia}:`, refError);
            return null;
          }
        })
      );
      const referenciasValidas = referenciasComTexto.filter(Boolean);

      const fullStudyData = {
        ...response,
        versiculo_texto: versiculoTexto,
        referencias_cruzadas: referenciasValidas
      };

      setStudyData(fullStudyData);
      setCrossReferences(referenciasValidas);

      // Carregar comentários opcionais se usuário tem preferências
      if (preferences?.comentaristas_ativos) {
        loadOptionalCommentaries(preferences.comentaristas_ativos);
      }
    } catch (error) {
      console.error("Erro ao carregar estudo:", error);
    }
    setIsLoading(false);
  };

  const loadOptionalCommentaries = async (activeCommentators) => {
    // Remove o comentário principal da lista (já é obrigatório e carregado em loadStudy)
    const optionalCommentators = activeCommentators.filter(c => c !== "Ryrie");

    if (optionalCommentators.length === 0) {
      setOptionalCommentaries([]);
      return;
    }

    const commentaries = [];

    for (const commentator of optionalCommentators) {
      try {
        // Matthew Henry: comentário REAL e literal (domínio público), busca
        // direta na fonte - nunca passa pela IA. Se não houver comentário
        // exato pra esse versículo, simplesmente não mostra nada pra ele
        // (não cai pra IA "preencher a lacuna").
        if (commentator === "Matthew Henry") {
          const real = await fetchMatthewHenryCommentary(currentBook, currentChapter, selectedVerse);
          if (real) {
            commentaries.push({
              name: commentator,
              text: real.texto,
              isReal: true,
              fonte: real.fonte,
              fonteUrl: real.url,
              versiculoInicioBloco: real.versiculoInicioBloco
            });
          }
          continue;
        }

        const styleGuide = getCommentatorStyle(commentator);
        // Deixamos claro pra IA (e depois pro usuário, via badge na tela)
        // que isto é uma reflexão ORIGINAL gerada por IA "inspirada no
        // estilo" do nome indicado - nunca uma citação literal de algo que
        // essa pessoa (viva, falecida, ou uma obra protegida por direitos
        // autorais) realmente escreveu.
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Escreva uma reflexão bíblica ORIGINAL para ${currentBook} ${currentChapter}:${selectedVerse}, inspirada no estilo teológico de ${commentator}, descrito abaixo.

${styleGuide}

IMPORTANTE: esta é uma reflexão nova, escrita por você agora, apenas INSPIRADA no estilo de ${commentator} - NÃO é uma citação de nenhuma obra ou texto que ${commentator} realmente escreveu. Nunca afirme ou sugira que é uma citação literal.

Retorne apenas um JSON:
{
  "texto": "reflexão original inspirada nesse estilo"
}`,
          response_json_schema: {
            type: "object",
            properties: {
              texto: { type: "string" }
            },
            required: ["texto"]
          }
        });

        commentaries.push({
          name: commentator,
          text: response.texto,
          isReal: false
        });
      } catch (error) {
        console.error(`Erro ao carregar comentário de ${commentator}:`, error);
      }
    }

    setOptionalCommentaries(commentaries);
  };

  // Linhas teológicas usadas para variar o "tom" da reflexão gerada por IA
  // para os comentaristas que AINDA não têm fonte real integrada. Matthew
  // Henry não usa mais isso - ele já busca comentário real e literal (ver
  // fetchMatthewHenryCommentary acima). IMPORTANTE: pros nomes abaixo, o
  // texto gerado é sempre uma reflexão NOVA "inspirada no estilo" - nunca
  // uma citação literal de algo que a pessoa realmente escreveu (isso é
  // reforçado no prompt da IA e sinalizado na tela via badge de aviso).
  // Spurgeon segue nesse grupo por enquanto porque ele não escreveu um
  // comentário verso-a-verso da Bíblia inteira (só Salmos, no "Tesouro
  // de Davi", e sermões avulsos) - integrar uma fonte real pra ele exige
  // mais trabalho e fica como próximo passo.
  const getCommentatorStyle = (commentator) => {
    const styles = {
      "Hernandes Dias Lopes": "Estilo: pastoral, prático, aplicação contemporânea, linguagem brasileira acessível, foco em transformação de vida",
      "Spurgeon": "Estilo inspirado na tradição de pregação clássica: eloquente, cristocêntrico, evangelístico, rico em ilustrações, apaixonado pela pregação do evangelho",
      "John Stott": "Estilo: equilibrado, exegético, apologético, claro, focado na relevância contemporânea com solidez bíblica",
      "MacArthur": "Estilo: expositivo, teologicamente preciso, doutrinal, direto, fiel ao texto original, sem concessões"
    };
    return styles[commentator] || "Estilo teológico equilibrado";
  };

  const handleBookSelect = (bookName, chapters) => {
    setCurrentBook(bookName);
    setTotalChapters(chapters);
    setCurrentChapter(1);
    setSelectedVerse(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookMarked className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Estudo & Devocionais</h1>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Menu className="w-5 h-5" />
                Livros
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-96 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Selecionar Livro</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <BookSelector onSelect={handleBookSelect} currentBook={currentBook} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 transition-colors ${
              activeTab === "estudo"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("estudo")}
          >
            <BookMarked className="w-4 h-4 mr-2" />
            Estudo Bíblico
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 transition-colors ${
              activeTab === "devocionais"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("devocionais")}
          >
            <Heart className="w-4 h-4 mr-2" />
            Devocionais
          </Button>
        </div>

        {/* Conteúdo baseado na aba ativa */}
        {activeTab === "devocionais" ? (
          <DevotionalSection user={user} />
        ) : currentStudy ? (
          <StudyViewer
            study={currentStudy}
            onUpdateProgress={async (progress) => {
              await base44.entities.BiblicalStudy.update(currentStudy.id, { progresso: progress });
              loadStudies();
            }}
            onComplete={async () => {
              await base44.entities.BiblicalStudy.update(currentStudy.id, { concluido: true, progresso: 100 });
              loadStudies();
            }}
          />
        ) : (
          <>
        {/* Navegação */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <ChapterNavigation
              book={currentBook}
              chapter={currentChapter}
              totalChapters={totalChapters}
              onPrevious={() => currentChapter > 1 && setCurrentChapter(currentChapter - 1)}
              onNext={() => currentChapter < totalChapters && setCurrentChapter(currentChapter + 1)}
              onChapterSelect={setCurrentChapter}
            />
            
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Versículo:</span>
              <input
                type="number"
                min="1"
                value={selectedVerse}
                onChange={(e) => setSelectedVerse(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-border rounded-lg text-center"
              />
              <Button onClick={loadStudy} size="sm" className="bg-primary hover:bg-primary/90">
                Estudar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo do Estudo */}
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-primary animate-spin"></div>
              <div className="text-center">
                <p className="text-stone-700 font-medium">Gerando estudo bíblico...</p>
                <p className="text-stone-500 text-sm mt-1">{currentBook} {currentChapter}:{selectedVerse}</p>
              </div>
            </CardContent>
          </Card>
        ) : studyData ? (
          <div className="space-y-6">
            {/* Versículo */}
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed mb-3">"{studyData.versiculo_texto}"</p>
                    <p className="font-semibold">
                      {currentBook} {currentChapter}:{selectedVerse}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleOpenNoteDialog}
                      variant="secondary"
                      className="gap-2"
                    >
                      {existingNote ? <Edit className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      {existingNote ? "Editar Anotação" : "Adicionar Anotação"}
                    </Button>
                    <Button
                      onClick={loadComparison}
                      variant="secondary"
                      className="gap-2"
                    >
                      <GitCompare className="w-4 h-4" />
                      Comparar Versões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exibir Anotação Existente */}
            {existingNote && (
              <Card className="border-l-4 border-accent bg-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    Minha Anotação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {existingNote.note_text}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Explicação Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Explicação Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contexto Histórico */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Contexto Histórico</h3>
                  </div>
                  <p className="text-foreground leading-relaxed">
                    {studyData.explicacao_basica.contexto_historico}
                  </p>
                </div>

                {/* Palavras-Chave */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Palavras-Chave</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {studyData.explicacao_basica.palavras_chave.map((palavra, idx) => (
                      <span
                        key={idx}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {palavra}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mapa/Contexto Geográfico */}
                {studyData.explicacao_basica.mapa_contexto && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-foreground">Contexto Geográfico</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">
                      {studyData.explicacao_basica.mapa_contexto}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comentário principal - FIXO E OBRIGATÓRIO */}
            <Card className="border-2 border-brand-clay/40 bg-brand-clay/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-brand-clay" />
                  Inspirado em Ryrie
                  <span className="ml-auto text-xs bg-brand-clay text-white px-3 py-1 rounded-full">
                    Base Principal
                  </span>
                </CardTitle>
                <p className="text-xs text-brand-clay/70 flex items-center gap-1">
                  ✦ Reflexão gerada por IA inspirada no estilo de Ryrie - não é uma citação da Bíblia de Estudo Ryrie nem de nenhuma outra obra
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {studyData.comentario_principal.texto}
                </p>
              </CardContent>
            </Card>

            {/* Comentários Opcionais */}
            {optionalCommentaries.map((commentary, idx) => (
              <Card
                key={idx}
                className={commentary.isReal
                  ? "border-l-4 border-emerald-400 bg-emerald-50/30"
                  : "border-l-4 border-brand-clay/40 bg-brand-clay/10"}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className={commentary.isReal ? "w-5 h-5 text-emerald-700" : "w-5 h-5 text-brand-clay"} />
                    {commentary.isReal ? commentary.name : `Inspirado em ${commentary.name}`}
                    <span className={commentary.isReal
                      ? "ml-auto text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full"
                      : "ml-auto text-xs bg-brand-clay/20 text-brand-clay px-3 py-1 rounded-full"}
                    >
                      {commentary.isReal ? "Citação Real" : "Opcional"}
                    </span>
                  </CardTitle>
                  {commentary.isReal ? (
                    <p className="text-xs text-emerald-700/70 flex items-center gap-1">
                      ✦ Citação literal, fonte: {commentary.fonte}
                      {commentary.versiculoInicioBloco != null && commentary.versiculoInicioBloco !== selectedVerse &&
                        ` (comentário cobre o trecho a partir do v. ${commentary.versiculoInicioBloco})`}
                    </p>
                  ) : (
                    <p className="text-xs text-brand-clay/70 flex items-center gap-1">
                      ✦ Reflexão original gerada por IA no estilo de {commentary.name} - não é uma citação literal do que essa pessoa escreveu
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {commentary.text}
                  </p>
                </CardContent>
              </Card>
            ))}

            {/* Referências Cruzadas */}
            {crossReferences.length > 0 && (
              <Card className="border-l-4 border-primary/40 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-primary" />
                    Referências Cruzadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crossReferences.map((ref, idx) => (
                      <div key={idx} className="bg-card p-4 rounded-lg border border-primary/20">
                        <p className="font-semibold text-primary mb-2">{ref.referencia}</p>
                        <p className="text-foreground italic mb-2">"{ref.texto}"</p>
                        <p className="text-muted-foreground text-sm">{ref.explicacao}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rodapé Espiritual Obrigatório */}
            <Card className="bg-accent/10 border-l-4 border-accent">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-foreground leading-relaxed italic font-display">
                      "Ore, consulte a Palavra e confirme com seu pastor.
                    </p>
                    <p className="text-foreground leading-relaxed italic font-display">
                      O Espírito Santo é o Mestre de toda verdade."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : myStudies.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BookMarked className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-4">
                Nenhum estudo gerado ainda
              </p>
              <Button
                onClick={() => setStudyGeneratorOpen(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Gerar Primeiro Estudo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myStudies.map((study) => (
              <Card 
                key={study.id}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setCurrentStudy(study)}
              >
                <CardHeader>
                  <CardTitle className="text-lg text-primary">
                    {study.referencia}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {study.versao}
                      </Badge>
                      <Badge variant="outline" className="capitalize text-xs">
                        {study.profundidade}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-stone-600 mb-1">
                        Progresso: {study.progresso}%
                      </div>
                      <Progress value={study.progresso} className="h-1" />
                    </div>
                    {study.concluido && (
                      <Badge className="bg-green-600 text-xs">
                        Concluído
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-dashed border-accent"
              onClick={() => setStudyGeneratorOpen(true)}
            >
              <CardContent className="py-16 text-center">
                <BookMarked className="w-12 h-12 mx-auto mb-3 text-accent" />
                <p className="text-stone-600 font-semibold">
                  Gerar Novo Estudo
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog de Anotação */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Anotação - {currentBook} {currentChapter}:{selectedVerse}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {studyData && (
                <p className="text-sm text-muted-foreground italic">"{studyData.versiculo_texto}"</p>
              )}
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Escreva sua anotação pessoal aqui..."
                className="min-h-32"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNote} className="bg-primary hover:bg-primary/90">
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Comparação de Versões */}
        <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Comparar Versões - {currentBook} {currentChapter}:{selectedVerse}
              </DialogTitle>
            </DialogHeader>
            
            {/* Seleção de Versões */}
            <div className="border-b pb-4 mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Selecione as versões para comparar:</p>
              <div className="flex flex-wrap gap-2">
                {BIBLE_VERSIONS.map(version => (
                  <Button
                    key={version.sigla}
                    variant={selectedVersions.includes(version.sigla) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleVersion(version.sigla)}
                    className="text-xs"
                  >
                    {version.sigla}
                  </Button>
                ))}
              </div>
              <Button
                onClick={loadComparison}
                className="mt-3 bg-primary hover:bg-primary/90"
                size="sm"
              >
                Atualizar Comparação
              </Button>
            </div>

            {/* Comparação */}
            {isLoadingComparison ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando versões...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comparisonData.map((version, idx) => (
                  <Card key={idx} className="border-l-4 border-primary/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                          {version.sigla}
                        </span>
                        <span className="text-sm text-muted-foreground font-normal">
                          {version.nome}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">
                        "{version.texto}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
          </>
        )}

        {/* Gerador de Estudos */}
        <StudyGenerator
          open={studyGeneratorOpen}
          onClose={() => setStudyGeneratorOpen(false)}
          initialBook={currentBook}
          initialChapter={currentChapter}
          initialVerse={selectedVerse}
          onStudyGenerated={(study) => {
            setCurrentStudy(study);
            loadStudies();
          }}
        />
      </div>
    </div>
  );
}