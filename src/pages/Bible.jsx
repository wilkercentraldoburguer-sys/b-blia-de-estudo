import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Loader2, Moon, Sun, MessageSquare, Search, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import BookSelector, { OLD_TESTAMENT, NEW_TESTAMENT } from "../components/bible/BookSelector";
import ChapterNavigation from "../components/bible/ChapterNavigation";

const BIBLE_VERSIONS = [
  { sigla: "ARA", nome: "Almeida Revista e Atualizada" },
  { sigla: "ARC", nome: "Almeida Revista e Corrigida" },
  { sigla: "NVI", nome: "Nova Versão Internacional" },
  { sigla: "NVT", nome: "Nova Versão Transformadora" },
  { sigla: "ACF", nome: "Almeida Corrigida Fiel" },
  { sigla: "KJV", nome: "King James Version" },
  { sigla: "NAA", nome: "Nova Almeida Atualizada" }
];

export default function Bible() {
  const [currentBook, setCurrentBook] = useState("João");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [totalChapters, setTotalChapters] = useState(21);
  const [selectedVersion, setSelectedVersion] = useState("ARA");
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("media");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState("all");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadChapter();
  }, [currentBook, currentChapter, selectedVersion]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Favorite.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Note.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (data) => base44.entities.Favorite.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const saveNoteMutation = useMutation({
    mutationFn: async (data) => {
      const existingNote = notes.find(
        n => n.book === data.book && n.chapter === data.chapter && n.verse === data.verse
      );
      if (existingNote) {
        return await base44.entities.Note.update(existingNote.id, { note_text: data.note_text });
      }
      return await base44.entities.Note.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNoteDialogOpen(false);
      setNoteText("");
    },
  });

  const loadChapter = async () => {
    setIsLoading(true);
    try {
      const versionName = BIBLE_VERSIONS.find(v => v.sigla === selectedVersion)?.nome || "Almeida Revista e Atualizada";
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Retorne o texto completo de ${currentBook} capítulo ${currentChapter} da Bíblia em português, versão ${versionName}.

Formato JSON:
{
  "verses": [
    {"number": 1, "text": "texto do versículo 1"},
    {"number": 2, "text": "texto do versículo 2"}
  ]
}

IMPORTANTE:
- Retorne TODOS os versículos do capítulo
- Não inclua comentários ou explicações
- Apenas o texto bíblico puro`,
        response_json_schema: {
          type: "object",
          properties: {
            verses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  number: { type: "integer" },
                  text: { type: "string" }
                },
                required: ["number", "text"]
              }
            }
          },
          required: ["verses"]
        }
      });
      
      if (response?.verses) {
        setVerses(response.verses);
      }
    } catch (error) {
      console.error("Erro ao carregar capítulo:", error);
    }
    setIsLoading(false);
  };

  const handleBookSelect = (bookName, chapters) => {
    setCurrentBook(bookName);
    setTotalChapters(chapters);
    setCurrentChapter(1);
  };

  const parseReference = (term) => {
    const regex = /^([1-3]?\s?[A-Za-zã]+)\s+(\d+):(\d+)$/i;
    const match = term.match(regex);
    if (match) {
      return {
        book: match[1].trim(),
        chapter: parseInt(match[2]),
        verse: parseInt(match[3])
      };
    }
    return null;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    const reference = parseReference(searchTerm);
    
    if (reference) {
      const bookData = [...OLD_TESTAMENT, ...NEW_TESTAMENT].find(
        b => b.name.toLowerCase() === reference.book.toLowerCase()
      );
      if (bookData) {
        setCurrentBook(bookData.name);
        setTotalChapters(bookData.chapters);
        setCurrentChapter(reference.chapter);
        setSearchTerm("");
        setTimeout(() => {
          const verseElement = document.getElementById(`verse-${reference.verse}`);
          verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        return;
      }
    }
    
    setIsSearching(true);
    try {
      let filterText = "";
      if (searchFilter === "ot") {
        filterText = " APENAS no Antigo Testamento";
      } else if (searchFilter === "nt") {
        filterText = " APENAS no Novo Testamento";
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Busque na Bíblia (versão ${BIBLE_VERSIONS.find(v => v.sigla === selectedVersion)?.nome}) todos os versículos que contêm "${searchTerm}"${filterText}.

Retorne até 20 resultados mais relevantes:
{
  "results": [
    {
      "book": "nome do livro",
      "chapter": número,
      "verse": número,
      "text": "texto do versículo"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  book: { type: "string" },
                  chapter: { type: "integer" },
                  verse: { type: "integer" },
                  text: { type: "string" }
                },
                required: ["book", "chapter", "verse", "text"]
              }
            }
          },
          required: ["results"]
        }
      });
      
      setSearchResults(response.results || []);
      setSearchDialogOpen(false);
    } catch (error) {
      console.error("Erro ao buscar:", error);
    }
    setIsSearching(false);
  };

  const navigateToVerse = (book, chapter, verse) => {
    const bookData = [...OLD_TESTAMENT, ...NEW_TESTAMENT].find(b => b.name === book);
    if (bookData) {
      setCurrentBook(book);
      setTotalChapters(bookData.chapters);
      setCurrentChapter(chapter);
      setSearchResults([]);
      setSearchTerm("");
      
      setTimeout(() => {
        const verseElement = document.getElementById(`verse-${verse}`);
        verseElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        verseElement?.classList.add('bg-yellow-100');
        setTimeout(() => verseElement?.classList.remove('bg-yellow-100'), 2000);
      }, 500);
    }
  };

  const handlePrevVerse = (verseNumber) => {
    if (verseNumber > 1) {
      const targetVerse = document.getElementById(`verse-${verseNumber - 1}`);
      targetVerse?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextVerse = (verseNumber) => {
    if (verseNumber < verses.length) {
      const targetVerse = document.getElementById(`verse-${verseNumber + 1}`);
      targetVerse?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (currentChapter < totalChapters) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const isFavorite = (verseNumber) => {
    return favorites.some(
      f => f.book === currentBook && f.chapter === currentChapter && f.verse === verseNumber
    );
  };

  const hasNote = (verseNumber) => {
    return notes.some(
      n => n.book === currentBook && n.chapter === currentChapter && n.verse === verseNumber
    );
  };

  const handleToggleFavorite = (verseNumber, verseText) => {
    const existing = favorites.find(
      f => f.book === currentBook && f.chapter === currentChapter && f.verse === verseNumber
    );
    
    if (existing) {
      removeFavoriteMutation.mutate(existing.id);
    } else {
      addFavoriteMutation.mutate({
        book: currentBook,
        chapter: currentChapter,
        verse: verseNumber,
        text: verseText
      });
    }
  };

  const handleOpenNote = (verseNumber, verseText) => {
    setSelectedVerse({ number: verseNumber, text: verseText });
    const existingNote = notes.find(
      n => n.book === currentBook && n.chapter === currentChapter && n.verse === verseNumber
    );
    setNoteText(existingNote?.note_text || "");
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedVerse || !noteText.trim()) return;
    
    saveNoteMutation.mutate({
      book: currentBook,
      chapter: currentChapter,
      verse: selectedVerse.number,
      note_text: noteText,
      verse_text: selectedVerse.text
    });
  };

  const fontSizeClasses = {
    pequena: "text-sm",
    media: "text-base",
    grande: "text-lg"
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
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

            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_VERSIONS.map(version => (
                  <SelectItem key={version.sigla} value={version.sigla}>
                    {version.sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSearchDialogOpen(true)}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <Card className={darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}>
          <CardContent className="p-6">
            <ChapterNavigation
              book={currentBook}
              chapter={currentChapter}
              totalChapters={totalChapters}
              onPrevious={() => currentChapter > 1 && setCurrentChapter(currentChapter - 1)}
              onNext={() => currentChapter < totalChapters && setCurrentChapter(currentChapter + 1)}
              onChapterSelect={setCurrentChapter}
            />

            <div className="border-t border-slate-200 mt-6 pt-6">
              {/* Resultados de Busca */}
              {searchResults.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">
                        {searchResults.length} resultado(s)
                      </h3>
                      <p className="text-sm text-slate-600">
                        {searchFilter === "ot" && "Antigo Testamento • "}
                        {searchFilter === "nt" && "Novo Testamento • "}
                        Versão {selectedVersion}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchResults([]);
                        setSearchTerm("");
                      }}
                    >
                      Fechar
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-blue-400"
                        onClick={() => navigateToVerse(result.book, result.chapter, result.verse)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-blue-900">
                            {result.book} {result.chapter}:{result.verse}
                          </p>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Ir para versículo →
                          </Button>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{result.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-900 mr-2" />
                  <span className="text-slate-600">Buscando...</span>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Carregando capítulo...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {verses.map((verse) => (
                    <div key={verse.number} id={`verse-${verse.number}`} className="group relative">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => handlePrevVerse(verse.number)}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className={`font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0 ${fontSizeClasses[fontSize]}`}>
                            {verse.number}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => handleNextVerse(verse.number)}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <p className={`leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-700'} ${fontSizeClasses[fontSize]}`}>
                            {verse.text}
                          </p>
                          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 ${isFavorite(verse.number) ? 'text-red-500' : ''}`}
                              onClick={() => handleToggleFavorite(verse.number, verse.text)}
                            >
                              <Heart className={`w-3 h-3 mr-1 ${isFavorite(verse.number) ? 'fill-current' : ''}`} />
                              {isFavorite(verse.number) ? 'Favoritado' : 'Favoritar'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 ${hasNote(verse.number) ? 'text-blue-600' : ''}`}
                              onClick={() => handleOpenNote(verse.number, verse.text)}
                            >
                              <MessageSquare className={`w-3 h-3 mr-1 ${hasNote(verse.number) ? 'fill-current' : ''}`} />
                              {hasNote(verse.number) ? 'Ver Nota' : 'Anotar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controles de Fonte */}
        <Card className={`mt-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Tamanho da Fonte:
              </span>
              <div className="flex gap-2">
                <Button
                  variant={fontSize === 'pequena' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontSize('pequena')}
                >
                  A
                </Button>
                <Button
                  variant={fontSize === 'media' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontSize('media')}
                  className="text-base"
                >
                  A
                </Button>
                <Button
                  variant={fontSize === 'grande' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontSize('grande')}
                  className="text-lg"
                >
                  A
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Busca Avançada */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Busca Avançada na Bíblia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Termo de Busca
              </label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder='Ex: "amor" ou "João 3:16"'
                className="text-base"
              />
              <p className="text-xs text-slate-500 mt-1">
                Dica: Digite uma referência (Ex: João 3:16) para ir direto ao versículo
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Filtrar por:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={searchFilter === "all" ? "default" : "outline"}
                  onClick={() => setSearchFilter("all")}
                  className="w-full"
                >
                  Toda a Bíblia
                </Button>
                <Button
                  variant={searchFilter === "ot" ? "default" : "outline"}
                  onClick={() => setSearchFilter("ot")}
                  className="w-full"
                >
                  Antigo Testamento
                </Button>
                <Button
                  variant={searchFilter === "nt" ? "default" : "outline"}
                  onClick={() => setSearchFilter("nt")}
                  className="w-full"
                >
                  Novo Testamento
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2 text-sm">Exemplos de busca:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• <strong>Palavra:</strong> "amor", "fé", "esperança"</li>
                <li>• <strong>Referência:</strong> "João 3:16", "Salmos 23:1"</li>
                <li>• <strong>Frase:</strong> "Deus amou o mundo"</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSearchDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSearch}
                disabled={!searchTerm.trim() || isSearching}
                className="bg-blue-900 hover:bg-blue-800"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Anotação */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Anotação - {currentBook} {currentChapter}:{selectedVerse?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 italic">"{selectedVerse?.text}"</p>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escreva sua anotação aqui..."
              className="min-h-32"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNote} className="bg-blue-900 hover:bg-blue-800">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}