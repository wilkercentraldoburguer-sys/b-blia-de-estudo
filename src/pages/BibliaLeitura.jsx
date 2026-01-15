import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Settings, Maximize2, Share2, BookOpen } from "lucide-react";
import VerseSelector from "../components/reader/VerseSelector";
import VerseActions from "../components/reader/VerseActions";
import ImmersiveMode from "../components/reader/ImmersiveMode";
import ShareCard from "../components/reader/ShareCard";
import ReadingSettings from "../components/reader/ReadingSettings";
import StudyGenerator from "../components/study/StudyGenerator";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function BibliaLeitura() {
  const [currentBook, setCurrentBook] = useState("João");
  const [currentChapter, setCurrentChapter] = useState(3);
  const [totalChapters, setTotalChapters] = useState(21);
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [showVerseActions, setShowVerseActions] = useState(false);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("ARA");
  const [touchTimer, setTouchTimer] = useState(null);
  const [studyGeneratorOpen, setStudyGeneratorOpen] = useState(false);
  
  const navigate = useNavigate();
  
  // Configurações de leitura
  const [fontSize, setFontSize] = useState("medium");
  const [lineSpacing, setLineSpacing] = useState("normal");
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  
  // Cache em memória (LRU - últimos 30 capítulos)
  const [chapterCache, setChapterCache] = useState(() => {
    try {
      const saved = localStorage.getItem('biblia_leitura_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // Controle de cancelamento e debounce
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isLoadingRef = useRef(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
    loadSettings();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('reading_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setFontSize(settings.fontSize || "medium");
      setLineSpacing(settings.lineSpacing || "normal");
      setTheme(settings.theme || "light");
    }
  };

  const saveSettings = (newSettings) => {
    localStorage.setItem('reading_settings', JSON.stringify(newSettings));
  };

  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Highlight.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Note.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const addHighlightMutation = useMutation({
    mutationFn: (data) => base44.entities.Highlight.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['highlights'] }),
  });

  const removeHighlightMutation = useMutation({
    mutationFn: (id) => base44.entities.Highlight.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['highlights'] }),
  });

  const addNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  useEffect(() => {
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Limpar debounce anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce de 250ms
    debounceTimerRef.current = setTimeout(() => {
      loadChapterOptimized(currentBook, currentChapter, selectedVersion);
    }, 250);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentBook, currentChapter, selectedVersion]);

  useEffect(() => {
    // Salvar progresso de leitura
    if (currentBook && currentChapter) {
      localStorage.setItem('last_reading', JSON.stringify({
        book: currentBook,
        chapter: currentChapter,
        timestamp: new Date().toISOString()
      }));
    }
  }, [currentBook, currentChapter]);

  const loadChapterOptimized = async (book, chapter, version) => {
    const cacheKey = `${book}-${chapter}-${version}`;
    
    // 1. Verificar cache em memória (instantâneo)
    if (chapterCache[cacheKey]) {
      setVerses(chapterCache[cacheKey]);
      setIsLoading(false);
      // Prefetch em background
      schedulePrefetch(book, chapter);
      return;
    }

    // 2. Criar novo AbortController para cancelamento
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Retorne APENAS o texto bíblico de ${book} ${chapter} na versão ${version} em português.
JSON:
{
  "verses": [
    {"text": "verso 1"},
    {"text": "verso 2"}
  ]
}
SEM números, SEM comentários, APENAS texto.`,
        response_json_schema: {
          type: "object",
          properties: {
            verses: {
              type: "array",
              items: {
                type: "object",
                properties: { text: { type: "string" } },
                required: ["text"]
              }
            }
          },
          required: ["verses"]
        }
      });
      
      // Verificar se não foi cancelado
      if (controller.signal.aborted) return;
      
      if (response?.verses) {
        setVerses(response.verses);
        saveToCache(cacheKey, response.verses);
        // Prefetch próximos capítulos
        schedulePrefetch(book, chapter);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Carregamento cancelado');
        return;
      }
      console.error("Erro ao carregar capítulo:", error);
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  const saveToCache = useCallback((key, data) => {
    setChapterCache(prev => {
      const newCache = { ...prev, [key]: data };
      
      // LRU: manter apenas últimos 30 em memória
      const keys = Object.keys(newCache);
      if (keys.length > 30) {
        const recentKeys = keys.slice(-30);
        const limitedCache = {};
        recentKeys.forEach(k => limitedCache[k] = newCache[k]);
        
        // Persistir no localStorage (50 capítulos)
        try {
          const allKeys = Object.keys(prev);
          if (allKeys.length > 50) {
            const storageKeys = allKeys.slice(-50);
            const storageCache = {};
            storageKeys.forEach(k => storageCache[k] = prev[k]);
            storageCache[key] = data;
            localStorage.setItem('biblia_leitura_cache', JSON.stringify(storageCache));
          } else {
            localStorage.setItem('biblia_leitura_cache', JSON.stringify({ ...prev, [key]: data }));
          }
        } catch (e) {
          console.error('Erro ao salvar cache:', e);
        }
        
        return limitedCache;
      }
      
      // Salvar no localStorage
      try {
        localStorage.setItem('biblia_leitura_cache', JSON.stringify(newCache));
      } catch (e) {
        console.error('Erro ao salvar cache:', e);
      }
      
      return newCache;
    });
  }, []);

  const schedulePrefetch = useCallback((book, chapter) => {
    // Prefetch em background (não bloquear UI)
    setTimeout(() => {
      if (chapter < totalChapters) {
        prefetchChapter(book, chapter + 1, selectedVersion);
        if (chapter + 1 < totalChapters) {
          prefetchChapter(book, chapter + 2, selectedVersion);
        }
      }
      if (chapter > 1) {
        prefetchChapter(book, chapter - 1, selectedVersion);
      }
    }, 100);
  }, [totalChapters, selectedVersion]);

  const prefetchChapter = useCallback(async (book, chapter, version) => {
    const cacheKey = `${book}-${chapter}-${version}`;
    
    // Só carregar se não estiver em cache
    if (chapterCache[cacheKey]) return;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Retorne APENAS o texto bíblico de ${book} ${chapter} na versão ${version} em português.
JSON:
{
  "verses": [
    {"text": "verso 1"},
    {"text": "verso 2"}
  ]
}
SEM números, SEM comentários, APENAS texto.`,
        response_json_schema: {
          type: "object",
          properties: {
            verses: {
              type: "array",
              items: {
                type: "object",
                properties: { text: { type: "string" } },
                required: ["text"]
              }
            }
          },
          required: ["verses"]
        }
      });
      
      if (response?.verses) {
        saveToCache(cacheKey, response.verses);
      }
    } catch (error) {
      // Silenciar erros de prefetch
    }
  }, [chapterCache, saveToCache]);

  // Invalidar cache ao trocar versão
  useEffect(() => {
    const cacheVersion = localStorage.getItem('biblia_leitura_cache_version');
    if (cacheVersion !== selectedVersion) {
      setChapterCache({});
      localStorage.removeItem('biblia_leitura_cache');
      localStorage.setItem('biblia_leitura_cache_version', selectedVersion);
    }
  }, [selectedVersion]);

  const handleVerseClick = (verseNumber, verseText, event) => {
    setSelectedVerse({ number: verseNumber, text: verseText });
    setActionPosition({ x: event.clientX, y: event.clientY });
    setShowVerseActions(true);
  };

  const handleVerseLongPress = (verseNumber, verseText, event) => {
    event.preventDefault();
    handleVerseClick(verseNumber, verseText, event);
  };

  const handleTouchStart = (verseNumber, verseText, event) => {
    const timer = setTimeout(() => {
      handleVerseLongPress(verseNumber, verseText, event.touches[0]);
    }, 500);
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const getHighlight = (verseNumber) => {
    return highlights.find(
      h => h.book === currentBook && h.chapter === currentChapter && h.verse === verseNumber
    );
  };

  const getNote = (verseNumber) => {
    return notes.find(
      n => n.book === currentBook && n.chapter === currentChapter && n.verse === verseNumber
    );
  };

  const handleHighlight = (color) => {
    if (!selectedVerse) return;
    
    const existing = getHighlight(selectedVerse.number);
    
    if (existing) {
      removeHighlightMutation.mutate(existing.id);
    }
    
    addHighlightMutation.mutate({
      book: currentBook,
      chapter: currentChapter,
      verse: selectedVerse.number,
      color: color,
      verse_text: selectedVerse.text
    });
    
    setShowVerseActions(false);
  };

  const handleRemoveHighlight = () => {
    const existing = getHighlight(selectedVerse.number);
    if (existing) {
      removeHighlightMutation.mutate(existing.id);
    }
    setShowVerseActions(false);
  };

  const handleAddNote = (noteText) => {
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
    
    setShowVerseActions(false);
  };

  const handleShare = () => {
    setShowVerseActions(false);
    setShareCardOpen(true);
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

  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-xl"
  };

  const lineSpacingClasses = {
    compact: "leading-relaxed",
    normal: "leading-loose",
    spacious: "leading-loose"
  };

  const themeClasses = {
    light: "bg-amber-50 text-stone-900",
    dark: "bg-stone-900 text-amber-50",
    sepia: "bg-amber-100 text-stone-800"
  };

  if (immersiveMode) {
    return (
      <ImmersiveMode
        verses={verses}
        currentBook={currentBook}
        currentChapter={currentChapter}
        onExit={() => setImmersiveMode(false)}
        fontSize={fontSize}
        theme={theme}
      />
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses[theme]} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header com Seletores */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-stone-800" style={{ color: '#722f37' }}>
              Leitura Bíblica
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setStudyGeneratorOpen(true)}
                size="sm"
                className="text-white"
                style={{ backgroundColor: '#722f37' }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Estudo do Texto
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setImmersiveMode(true)}
                className="hover:bg-stone-200"
              >
                <Maximize2 className="w-5 h-5" style={{ color: '#722f37' }} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="hover:bg-stone-200"
              >
                <Settings className="w-5 h-5" style={{ color: '#722f37' }} />
              </Button>
            </div>
          </div>

          <VerseSelector
            currentBook={currentBook}
            currentChapter={currentChapter}
            totalChapters={totalChapters}
            selectedVersion={selectedVersion}
            onBookChange={(book, chapters) => {
              setCurrentBook(book);
              setTotalChapters(chapters);
              setCurrentChapter(1);
            }}
            onChapterChange={setCurrentChapter}
            onVersionChange={setSelectedVersion}
          />
        </div>

        {/* Navegação de Capítulos */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2" style={{ borderColor: '#722f37' }}>
          <Button
            variant="outline"
            onClick={handlePrevChapter}
            disabled={currentChapter === 1}
            className="gap-2"
            style={{ borderColor: '#722f37', color: '#722f37' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          <span className="text-lg font-semibold" style={{ color: '#722f37' }}>
            {currentBook} {currentChapter}
          </span>
          <Button
            variant="outline"
            onClick={handleNextChapter}
            disabled={currentChapter === totalChapters}
            className="gap-2"
            style={{ borderColor: '#722f37', color: '#722f37' }}
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Versículos */}
        <div className={`space-y-4 ${fontSizeClasses[fontSize]} ${lineSpacingClasses[lineSpacing]}`}>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 animate-spin rounded-full border-4 border-stone-200" style={{ borderTopColor: '#722f37' }}></div>
                <p className="text-stone-700 font-medium">
                  Preparando {currentBook} {currentChapter}...
                </p>
              </div>
              {/* Skeleton Loading */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="p-4 rounded-lg">
                  <div className="flex gap-3">
                    <Skeleton className="w-8 h-6 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : verses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-stone-600">Nenhum versículo carregado</p>
            </div>
          ) : (
            verses.map((verse, index) => {
              const verseNumber = index + 1;
              const highlight = getHighlight(verseNumber);
              const note = getNote(verseNumber);
              
              const highlightColors = {
                yellow: 'bg-yellow-200',
                orange: 'bg-orange-200',
                red: 'bg-red-200',
                blue: 'bg-blue-200',
                green: 'bg-green-200',
                purple: 'bg-purple-200',
                pink: 'bg-pink-200'
              };

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    highlight ? highlightColors[highlight.color] : 'hover:bg-stone-100'
                  }`}
                  onClick={(e) => handleVerseClick(verseNumber, verse.text, e)}
                  onTouchStart={(e) => handleTouchStart(verseNumber, verse.text, e)}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="flex gap-3">
                    <span 
                      className="font-bold text-lg flex-shrink-0 select-none"
                      style={{ color: '#722f37' }}
                    >
                      {verseNumber}
                    </span>
                    <p className="text-stone-800 flex-1">
                      {verse.text}
                      {note && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full bg-stone-300 text-stone-700">
                          📝
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Menu de Ações do Versículo */}
        {showVerseActions && (
          <VerseActions
            position={actionPosition}
            verse={selectedVerse}
            existingHighlight={getHighlight(selectedVerse?.number)}
            existingNote={getNote(selectedVerse?.number)}
            onClose={() => setShowVerseActions(false)}
            onHighlight={handleHighlight}
            onRemoveHighlight={handleRemoveHighlight}
            onAddNote={handleAddNote}
            onShare={handleShare}
          />
        )}

        {/* Card de Compartilhamento */}
        {shareCardOpen && selectedVerse && (
          <ShareCard
            verse={selectedVerse}
            book={currentBook}
            chapter={currentChapter}
            onClose={() => setShareCardOpen(false)}
          />
        )}

        {/* Configurações de Leitura */}
        {settingsOpen && (
          <ReadingSettings
            fontSize={fontSize}
            lineSpacing={lineSpacing}
            theme={theme}
            onFontSizeChange={(size) => {
              setFontSize(size);
              saveSettings({ fontSize: size, lineSpacing, theme });
            }}
            onLineSpacingChange={(spacing) => {
              setLineSpacing(spacing);
              saveSettings({ fontSize, lineSpacing: spacing, theme });
            }}
            onThemeChange={(newTheme) => {
              setTheme(newTheme);
              saveSettings({ fontSize, lineSpacing, theme: newTheme });
            }}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* Gerador de Estudos */}
        <StudyGenerator
          open={studyGeneratorOpen}
          onClose={() => setStudyGeneratorOpen(false)}
          initialBook={currentBook}
          initialChapter={currentChapter}
          initialVerse={1}
          onStudyGenerated={(study) => {
            window.location.href = `${createPageUrl('Study')}?study=${study.id}`;
          }}
        />
      </div>
    </div>
  );
}