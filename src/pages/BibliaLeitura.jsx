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
  
  // Cache em memória (LRU - últimos 3 capítulos mais acessados)
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
  const timeoutRef = useRef(null);
  const isLoadingRef = useRef(false);
  
  // Estado de erro
  const [loadError, setLoadError] = useState(null);
  const [hasCache, setHasCache] = useState(false);

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

  const loadChapterOptimizedRef = useRef(null);
  
  loadChapterOptimizedRef.current = async (book, chapter, version) => {
    const t0 = performance.now();
    console.log(`🔵 [t0=${t0.toFixed(0)}ms] CLIQUE: ${book} ${chapter} (${version})`);
    
    const cacheKey = `${version}|${book}|${chapter}`;
    
    // CACHE-FIRST: Verificar cache em memória (instantâneo)
    if (chapterCache[cacheKey]) {
      const t_cache = performance.now();
      console.log(`✅ [t=${(t_cache - t0).toFixed(0)}ms] CACHE HIT - Renderizando do cache`);
      setVerses(chapterCache[cacheKey]);
      setIsLoading(false);
      setLoadError(null);
      setHasCache(true);
      // Prefetch em background
      schedulePrefetch(book, chapter, version);
      console.log(`🏁 [TOTAL=${(performance.now() - t0).toFixed(0)}ms] Carregamento completo (cache)`);
      return;
    }
    
    console.log(`⚠️ Cache miss - Buscando da rede`);
    setHasCache(false);

    // Criar novo AbortController para cancelamento
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadError(null);
    
    // TIMEOUT DE 15 SEGUNDOS (LLM pode demorar)
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.error(`❌ TIMEOUT após 15000ms - ${book} ${chapter}`);
        controller.abort();
        setIsLoading(false);
        isLoadingRef.current = false;
        setLoadError({
          message: `Tempo limite excedido ao carregar ${book} ${chapter}. A geração do texto bíblico está demorando muito.`,
          canRetry: true,
          hasCache: false
        });
      }
    }, 15000);
    timeoutRef.current = timeoutId;

    try {
      const t1 = performance.now();
      console.log(`🔵 [t1=${(t1 - t0).toFixed(0)}ms] Iniciando fetch LLM`);
      console.log(`📋 FONTE DE DADOS: base44.integrations.Core.InvokeLLM (Geração de texto com IA)`);
      console.log(`🔍 QUERY: book="${book}", chapter=${chapter}, version="${version}"`);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Retorne APENAS o texto bíblico de ${book} capítulo ${chapter} na versão ${version} em português.

IMPORTANTE: Este é ${book} capítulo ${chapter}. Retorne TODOS os versículos deste capítulo específico.

JSON:
{
  "verses": [
    {"text": "texto completo do versículo 1"},
    {"text": "texto completo do versículo 2"}
  ]
}

SEM números de versículos no texto, SEM comentários, APENAS o texto bíblico puro.`,
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
      
      const t2 = performance.now();
      console.log(`🔵 [t2=${(t2 - t0).toFixed(0)}ms] Payload recebido`);
      console.log(`📊 RESULTADO BRUTO:`, response);
      console.log(`📈 Quantidade de versículos: ${response?.verses?.length || 0}`);
      if (response?.verses && response.verses.length > 0) {
        console.log(`📝 Exemplo do primeiro versículo:`, response.verses[0]);
      } else {
        console.error(`❌ PROBLEMA: Response vazia ou sem verses`);
      }
      
      // Verificar se não foi cancelado
      if (controller.signal.aborted) {
        console.log('⚠️ Carregamento cancelado');
        return;
      }
      
      // Limpar timeout
      clearTimeout(timeoutId);
      
      const t3 = performance.now();
      console.log(`🔵 [t3=${(t3 - t0).toFixed(0)}ms] Preparando dados`);
      
      if (response?.verses && response.verses.length > 0) {
        setVerses(response.verses);
        saveToCache(cacheKey, response.verses);
        setLoadError(null);
        
        const t4 = performance.now();
        console.log(`✅ [t4=${(t4 - t0).toFixed(0)}ms] Primeiro conteúdo renderizado`);
        console.log(`🏁 [TOTAL=${(t4 - t0).toFixed(0)}ms] Carregamento completo - ${response.verses.length} versículos`);
        
        // Prefetch próximos capítulos
        schedulePrefetch(book, chapter, version);
      } else {
        console.error(`❌ Nenhum versículo retornado para ${book} ${chapter} (${version})`);
        throw new Error(`Não foi encontrado conteúdo para ${book} ${chapter} (${version}). A IA não gerou o texto esperado.`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.log('⚠️ Carregamento cancelado pelo usuário');
        return;
      }
      
      console.error(`❌ Erro ao carregar capítulo:`, error);
      console.error(`❌ Tipo de erro:`, error.name);
      console.error(`❌ Stack:`, error.stack);
      
      setLoadError({
        message: error.message || `Erro ao carregar ${book} ${chapter}`,
        canRetry: true,
        hasCache: false
      });
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  useEffect(() => {
    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Limpar debounce e timeout anteriores
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Resetar erro
    setLoadError(null);
    
    // Debounce de 250ms
    debounceTimerRef.current = setTimeout(() => {
      loadChapterOptimizedRef.current?.(currentBook, currentChapter, selectedVersion);
    }, 250);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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



  const saveToCache = useCallback((key, data) => {
    setChapterCache(prev => {
      const newCache = { ...prev, [key]: data };
      
      // LRU: manter apenas últimos 3 em memória
      const keys = Object.keys(newCache);
      if (keys.length > 3) {
        const recentKeys = keys.slice(-3);
        const limitedCache = {};
        recentKeys.forEach(k => limitedCache[k] = newCache[k]);
        
        // Persistir no localStorage (100 capítulos)
        try {
          const storageData = JSON.parse(localStorage.getItem('biblia_leitura_cache') || '{}');
          const allKeys = Object.keys(storageData);
          if (allKeys.length > 100) {
            const storageKeys = allKeys.slice(-100);
            const storageCache = {};
            storageKeys.forEach(k => storageCache[k] = storageData[k]);
            storageCache[key] = data;
            localStorage.setItem('biblia_leitura_cache', JSON.stringify(storageCache));
          } else {
            localStorage.setItem('biblia_leitura_cache', JSON.stringify({ ...storageData, [key]: data }));
          }
        } catch (e) {
          console.error('💾 Erro ao salvar cache no localStorage:', e);
        }
        
        return limitedCache;
      }
      
      // Salvar no localStorage
      try {
        const storageData = JSON.parse(localStorage.getItem('biblia_leitura_cache') || '{}');
        localStorage.setItem('biblia_leitura_cache', JSON.stringify({ ...storageData, [key]: data }));
      } catch (e) {
        console.error('💾 Erro ao salvar cache no localStorage:', e);
      }
      
      return newCache;
    });
  }, []);

  const schedulePrefetch = useCallback((book, chapter, version) => {
    // Prefetch em background (não bloquear UI)
    setTimeout(() => {
      console.log(`🔄 Iniciando prefetch: ${book} ${chapter+1}, ${chapter+2}`);
      if (chapter < totalChapters) {
        prefetchChapter(book, chapter + 1, version);
        if (chapter + 1 < totalChapters) {
          prefetchChapter(book, chapter + 2, version);
        }
      }
    }, 500);
  }, [totalChapters]);

  const prefetchChapter = useCallback(async (book, chapter, version) => {
    const cacheKey = `${version}|${book}|${chapter}`;
    
    // Só carregar se não estiver em cache
    if (chapterCache[cacheKey]) {
      console.log(`⚡ Prefetch skip (cache): ${book} ${chapter}`);
      return;
    }

    try {
      console.log(`⚡ Prefetch start: ${book} ${chapter}`);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Retorne APENAS o texto bíblico de ${book} capítulo ${chapter} na versão ${version} em português.
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
      
      if (response?.verses && response.verses.length > 0) {
        saveToCache(cacheKey, response.verses);
        console.log(`✅ Prefetch complete: ${book} ${chapter} (${response.verses.length} vs)`);
      }
    } catch (error) {
      console.log(`⚠️ Prefetch failed: ${book} ${chapter}`);
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

  const handleRetry = () => {
    console.log('🔄 Retry manual');
    setLoadError(null);
    loadChapterOptimizedRef.current?.(currentBook, currentChapter, selectedVersion);
  };

  const handleLoadFromCache = () => {
    console.log('💾 Tentando carregar do cache persistente');
    const cacheKey = `${selectedVersion}|${currentBook}|${currentChapter}`;
    try {
      const storageData = JSON.parse(localStorage.getItem('biblia_leitura_cache') || '{}');
      if (storageData[cacheKey]) {
        setVerses(storageData[cacheKey]);
        setChapterCache(prev => ({ ...prev, [cacheKey]: storageData[cacheKey] }));
        setLoadError(null);
        setIsLoading(false);
        console.log('✅ Carregado do cache persistente');
      } else {
        setLoadError({
          message: 'Nenhum cache encontrado para este capítulo',
          canRetry: true,
          hasCache: false
        });
      }
    } catch (e) {
      console.error('Erro ao carregar cache:', e);
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
          {loadError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-2">
                  Erro ao Carregar Capítulo
                </h3>
                <p className="text-stone-600 mb-6">
                  {loadError.message}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleRetry}
                    className="text-white"
                    style={{ backgroundColor: '#722f37' }}
                  >
                    🔄 Tentar Novamente
                  </Button>
                  <Button
                    onClick={handleLoadFromCache}
                    variant="outline"
                    style={{ borderColor: '#722f37', color: '#722f37' }}
                  >
                    💾 Abrir do Cache
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
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
              <Button
                onClick={handleRetry}
                variant="outline"
                style={{ borderColor: '#722f37', color: '#722f37' }}
              >
                Carregar Capítulo
              </Button>
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