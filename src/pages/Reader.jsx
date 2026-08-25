import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Loader2, Download, BookOpenCheck, StickyNote, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BookSelector, { OLD_TESTAMENT, NEW_TESTAMENT } from "../components/bible/BookSelector";
import ChapterNavigation from "../components/bible/ChapterNavigation";
import VerseCard from "../components/bible/VerseCard";
import AudioPlayer from "../components/bible/AudioPlayer";
import OfflineManager from "../components/bible/OfflineManager";
import UpdateNotificationBanner from "../components/settings/UpdateNotificationBanner";
import CommentaryPanel from "../components/bible/CommentaryPanel";
import AdvancedSearch from "../components/bible/AdvancedSearch";
import { useTheme } from "../components/personalization/ThemeProvider";
import { fetchChapterFromJSON } from "../components/bible/bibleLoader";
import EntendaCapituloDrawer from "../components/reader/EntendaCapituloDrawer";
import { getManualContexto } from "../components/reader/manualContextoData";

const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

export default function Reader() {
  const [currentBook, setCurrentBook] = useState("João");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [totalChapters, setTotalChapters] = useState(21);
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cache, setCache] = useState({});
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [verseDialogOpen, setVerseDialogOpen] = useState(false);
  const [selectedVerseData, setSelectedVerseData] = useState(null);
  const [comparisonVerses, setComparisonVerses] = useState([]);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [offlineDialogOpen, setOfflineDialogOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showVersionCompare, setShowVersionCompare] = useState(false);
  const [compareVersion, setCompareVersion] = useState("NVI");
  const [showCommentaries, setShowCommentaries] = useState(false);
  const [selectedVerseForCommentary, setSelectedVerseForCommentary] = useState(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [entendaCapituloOpen, setEntendaCapituloOpen] = useState(false);

  const queryClient = useQueryClient();
  const { theme, fontSize } = useTheme();

  const minSwipeDistance = 50;

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        return await base44.entities.Favorite.list();
      } catch (error) {
        console.error("Error loading favorites:", error);
        return [];
      }
    },
    initialData: [],
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      try {
        return await base44.entities.Note.list();
      } catch (error) {
        console.error("Error loading notes:", error);
        return [];
      }
    },
    initialData: [],
  });

  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights'],
    queryFn: async () => {
      try {
        return await base44.entities.Highlight.list();
      } catch (error) {
        console.error("Error loading highlights:", error);
        return [];
      }
    },
    initialData: [],
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (data) => base44.entities.Favorite.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNoteDialogOpen(false);
      setNoteText("");
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNoteDialogOpen(false);
      setNoteText("");
    },
  });

  const addHighlightMutation = useMutation({
    mutationFn: (data) => base44.entities.Highlight.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['highlights'] }),
  });

  const removeHighlightMutation = useMutation({
    mutationFn: (id) => base44.entities.Highlight.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['highlights'] }),
  });

  const checkOfflineAvailability = (book, chapter) => {
    const offline = localStorage.getItem('offline_bible_books');
    if (!offline) return null;
    
    const books = JSON.parse(offline);
    const bookData = books.find(b => b.book === book && b.version === "ARA");
    if (!bookData) return null;
    
    const chapterData = bookData.chapters.find(c => c.chapter === chapter);
    return chapterData ? chapterData.verses : null;
  };

  const loadChapter = async (book, chapter) => {
    const cacheKey = `${book}-${chapter}`;
    
    // Verificar cache na memória
    if (cache[cacheKey]) {
      setVerses(cache[cacheKey]);
      setIsOffline(false);
      return;
    }

    // Verificar cache offline
    const offlineData = checkOfflineAvailability(book, chapter);
    if (offlineData) {
      const formattedVerses = offlineData.map(v => ({ text: v.text }));
      setVerses(formattedVerses);
      setCache(prev => ({ ...prev, [cacheKey]: formattedVerses }));
      setIsOffline(true);
      return;
    }

    setIsLoading(true);
    setIsOffline(false);
    try {
      // Busca o texto real do capítulo (dataset -> ABíbliaDigital com token,
      // se houver -> getbible.net) em vez de pedir para uma IA "gerar" o
      // texto bíblico.
      const data = await fetchChapterFromJSON("ARA", book, chapter);

      if (data && Array.isArray(data.verses) && data.verses.length > 0) {
        const formattedVerses = data.verses.map(v => ({ text: v.text }));
        setVerses(formattedVerses);
        setCache(prev => ({ ...prev, [cacheKey]: formattedVerses }));
      } else {
        setVerses([]);
      }
    } catch (error) {
      console.error("Erro ao carregar capítulo:", error);
      const offlineFallback = checkOfflineAvailability(book, chapter);
      if (offlineFallback) {
        const formattedVerses = offlineFallback.map(v => ({ text: v.text }));
        setVerses(formattedVerses);
        setIsOffline(true);
      } else {
        setVerses([{text: "Não foi possível carregar este capítulo. Por favor, tente novamente."}]);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadChapter(currentBook, currentChapter);
  }, [currentBook, currentChapter]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadUserPreferences();
  }, [user]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadUserPreferences = async () => {
    if (!user) return;
    try {
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      if (prefs && prefs.length > 0) {
        setUserPreferences(prefs[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar preferências:", error);
    }
  };

  const handleBookSelect = (bookName, chapters) => {
    setCurrentBook(bookName);
    setTotalChapters(chapters);
    setCurrentChapter(1);
  };

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < totalChapters) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentChapter < totalChapters) {
      handleNextChapter();
    }
    if (isRightSwipe && currentChapter > 1) {
      handlePrevChapter();
    }
  };

  const isFavorite = (verseNumber) => {
    return favorites.some(
      (fav) => fav.book === currentBook && fav.chapter === currentChapter && fav.verse === verseNumber
    );
  };

  const getNote = (verseNumber) => {
    return notes.find(
      (note) => note.book === currentBook && note.chapter === currentChapter && note.verse === verseNumber
    );
  };

  const handleToggleFavorite = (verseNumber, verseText) => {
    const existing = favorites.find(
      (fav) => fav.book === currentBook && fav.chapter === currentChapter && fav.verse === verseNumber
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
    const existingNote = getNote(verseNumber);
    setNoteText(existingNote?.note_text || "");
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!selectedVerse || !noteText.trim()) return;

    const existingNote = getNote(selectedVerse.number);

    if (existingNote) {
      updateNoteMutation.mutate({
        id: existingNote.id,
        data: { note_text: noteText }
      });
    } else {
      addNoteMutation.mutate({
        book: currentBook,
        chapter: currentChapter,
        verse: selectedVerse.number,
        note_text: noteText,
        verse_text: selectedVerse.text
      });
    }
  };

  const getHighlight = (verseNumber) => {
    return highlights.find(
      h => h.book === currentBook && h.chapter === currentChapter && h.verse === verseNumber
    );
  };

  const handleVerseClick = async (verseNumber, verseText) => {
    setSelectedVerseData({ number: verseNumber, text: verseText });
    setVerseDialogOpen(true);
    loadVerseComparison(verseNumber);
  };

  const loadVerseComparison = async (verseNumber) => {
    setIsLoadingComparison(true);
    const versions = ["ARA", "NVI", "ARC"];
    const comparisons = [];

    for (const version of versions) {
      try {
        // Busca o capítulo real na versão escolhida e extrai o versículo -
        // nunca pede pra IA "lembrar" o texto de uma versão específica.
        const data = await fetchChapterFromJSON(version, currentBook, currentChapter);
        const verseData = data?.verses?.[verseNumber - 1];
        if (verseData) {
          comparisons.push({ version, text: verseData.text });
        }
      } catch (error) {
        console.error(`Erro versão ${version}:`, error);
      }
    }
    
    setComparisonVerses(comparisons);
    setIsLoadingComparison(false);
  };

  const handleHighlight = (color) => {
    if (!selectedVerseData) return;

    const existing = getHighlight(selectedVerseData.number);
    
    if (existing) {
      if (existing.color === color) {
        removeHighlightMutation.mutate(existing.id);
      } else {
        removeHighlightMutation.mutate(existing.id);
        addHighlightMutation.mutate({
          book: currentBook,
          chapter: currentChapter,
          verse: selectedVerseData.number,
          color: color,
          verse_text: selectedVerseData.text
        });
      }
    } else {
      addHighlightMutation.mutate({
        book: currentBook,
        chapter: currentChapter,
        verse: selectedVerseData.number,
        color: color,
        verse_text: selectedVerseData.text
      });
    }
  };

  return (
    <div className={`min-h-screen ${theme}`}>
      <div className={`max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 ${fontSize}`}>
        <UpdateNotificationBanner />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary">Bíblia de Estudo</h1>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Button
              variant="outline"
              className="gap-2 text-foreground hover:text-foreground"
              onClick={() => setSearchDialogOpen(true)}
            >
              <BookOpenCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-foreground hover:text-foreground"
              onClick={() => setShowCommentaries(!showCommentaries)}
            >
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">Comentários</span>
            </Button>
            {getManualContexto(currentBook, currentChapter) && (
              <Button
                variant="outline"
                className="gap-2 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setEntendaCapituloOpen(true)}
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Entenda esse capítulo</span>
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2 text-foreground hover:text-foreground"
              onClick={() => setOfflineDialogOpen(true)}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Offline</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none text-foreground hover:text-foreground">
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Livros</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Selecionar Livro</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <BookSelector onSelect={handleBookSelect} currentBook={currentBook} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div 
          className="bg-card text-card-foreground rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {isOffline && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Modo Offline</p>
                  <p className="text-xs text-green-600">Conteúdo disponível sem internet</p>
                </div>
              </div>
            </div>
          )}

          <ChapterNavigation
            book={currentBook}
            chapter={currentChapter}
            totalChapters={totalChapters}
            onPrevious={handlePrevChapter}
            onNext={handleNextChapter}
            onChapterSelect={setCurrentChapter}
          />

          <div className="border-t border-border mt-6 pt-6 space-y-4">
            {!isLoading && verses.length > 0 && (
              <>
                <AudioPlayer 
                  verses={verses} 
                  bookName={currentBook} 
                  chapter={currentChapter} 
                />

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="compare-mode"
                      checked={showVersionCompare}
                      onCheckedChange={setShowVersionCompare}
                    />
                    <Label htmlFor="compare-mode" className="cursor-pointer">
                      Comparar versões
                    </Label>
                  </div>
                  {showVersionCompare && (
                    <Select value={compareVersion} onValueChange={setCompareVersion}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NVI">NVI</SelectItem>
                        <SelectItem value="ARC">ARC</SelectItem>
                        <SelectItem value="NAA">NAA</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-0">
            <div className="md:col-span-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Carregando capítulo...</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {verses.map((verse, index) => (
                    <VerseCard
                      key={index}
                      verse={verse.text}
                      verseNumber={index + 1}
                      isFavorite={isFavorite(index + 1)}
                      hasNote={!!getNote(index + 1)}
                      notePreview={getNote(index + 1)?.note_text}
                      highlight={getHighlight(index + 1)}
                      showCompare={showVersionCompare}
                      compareVersion={compareVersion}
                      bookName={currentBook}
                      chapter={currentChapter}
                      onToggleFavorite={() => handleToggleFavorite(index + 1, verse.text)}
                      onAddNote={() => handleOpenNote(index + 1, verse.text)}
                      onVerseClick={() => {
                        handleVerseClick(index + 1, verse.text);
                        setSelectedVerseForCommentary(index + 1);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {showCommentaries && (
              <div className="md:col-span-1">
                <div className="sticky top-4">
                  <CommentaryPanel
                    book={currentBook}
                    chapter={currentChapter}
                    verse={selectedVerseForCommentary}
                    activeCommentators={userPreferences?.comentaristas_ativos || ["Ryrie"]}
                  />
                </div>
              </div>
            )}
          </div>
          </div>
          </div>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Anotação - {currentBook} {currentChapter}:{selectedVerse?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground italic font-display">"{selectedVerse?.text}"</p>
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
              <Button onClick={handleSaveNote} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Versículo com Cores e Versões */}
      <Dialog open={verseDialogOpen} onOpenChange={setVerseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentBook} {currentChapter}:{selectedVerseData?.number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Texto do Versículo */}
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-secondary-foreground leading-relaxed italic font-display">
                "{selectedVerseData?.text}"
              </p>
            </div>

            {/* Cores de Destaque */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Marcar com cor:
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { color: 'yellow', label: 'Amarelo', bg: 'bg-yellow-200', hover: 'hover:bg-yellow-300' },
                  { color: 'pink', label: 'Rosa', bg: 'bg-pink-200', hover: 'hover:bg-pink-300' },
                  { color: 'red', label: 'Vermelho', bg: 'bg-red-200', hover: 'hover:bg-red-300' },
                  { color: 'purple', label: 'Roxo', bg: 'bg-purple-200', hover: 'hover:bg-purple-300' },
                  { color: 'blue', label: 'Azul', bg: 'bg-blue-200', hover: 'hover:bg-blue-300' },
                  { color: 'green', label: 'Verde', bg: 'bg-green-200', hover: 'hover:bg-green-300' }
                ].map((item) => (
                  <Button
                    key={item.color}
                    onClick={() => handleHighlight(item.color)}
                    className={`${item.bg} ${item.hover} text-slate-800 border-2 ${
                      getHighlight(selectedVerseData?.number)?.color === item.color 
                        ? 'border-slate-800' 
                        : 'border-transparent'
                    }`}
                    variant="outline"
                  >
                    {item.label}
                  </Button>
                ))}
                {getHighlight(selectedVerseData?.number) && (
                  <Button
                    onClick={() => removeHighlightMutation.mutate(getHighlight(selectedVerseData?.number).id)}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Remover Destaque
                  </Button>
                )}
              </div>
            </div>

            {/* Outras Versões */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Outras versões:
              </h3>
              {isLoadingComparison ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3">
                  {comparisonVerses.map((v, idx) => (
                    <div key={idx} className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                      <p className="text-xs font-bold text-primary mb-1">{v.version}</p>
                      <p className="text-sm text-foreground font-display">"{v.text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerenciamento Offline */}
      <Dialog open={offlineDialogOpen} onOpenChange={setOfflineDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Downloads Offline</DialogTitle>
          </DialogHeader>
          <OfflineManager 
            selectedVersion="ARA" 
            onClose={() => setOfflineDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de Busca Avançada */}
      <AdvancedSearch
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onSelectVerse={(book, chapter, verse) => {
          setCurrentBook(book);
          setCurrentChapter(chapter);
          setSelectedVerseForCommentary(verse);
          setShowCommentaries(true);
        }}
      />

      {/* Painel "Entenda esse capítulo" */}
      <EntendaCapituloDrawer
        open={entendaCapituloOpen}
        onOpenChange={setEntendaCapituloOpen}
        livro={currentBook}
        capitulo={currentChapter}
      />
      </div>
      );
      }