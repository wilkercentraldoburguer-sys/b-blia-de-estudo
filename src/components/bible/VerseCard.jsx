import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, BookOpenCheck, StickyNote } from "lucide-react";
import { motion } from "framer-motion";
import { fetchChapterFromJSON } from "./bibleLoader";

export default function VerseCard({ 
  verse, 
  verseNumber, 
  isFavorite, 
  hasNote,
  notePreview,
  highlight,
  showCompare,
  compareVersion,
  bookName,
  chapter,
  onToggleFavorite, 
  onAddNote,
  onVerseClick
}) {
  const [compareText, setCompareText] = useState(null);
  const [loadingCompare, setLoadingCompare] = useState(false);

  useEffect(() => {
    if (showCompare && compareVersion) {
      loadCompareVerse();
    }
  }, [showCompare, compareVersion]);

  const loadCompareVerse = async () => {
    setLoadingCompare(true);
    try {
      // Busca o texto real do versículo na versão escolhida em vez de
      // pedir para uma IA "lembrar" o texto.
      const data = await fetchChapterFromJSON(compareVersion, bookName, chapter);
      const verseData = data?.verses?.[verseNumber - 1];
      setCompareText(verseData?.text || null);
    } catch (error) {
      console.error("Erro ao carregar comparação:", error);
    }
    setLoadingCompare(false);
  };
  const colorClasses = {
    yellow: 'bg-yellow-100 border-l-4 border-yellow-400',
    pink: 'bg-pink-100 border-l-4 border-pink-400',
    red: 'bg-red-100 border-l-4 border-red-400',
    purple: 'bg-purple-100 border-l-4 border-purple-400',
    blue: 'bg-blue-100 border-l-4 border-blue-400',
    green: 'bg-green-100 border-l-4 border-green-400'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative py-3 px-3 sm:py-4 sm:px-6 hover:shadow-sm rounded-lg transition-all duration-200 cursor-pointer ${
        highlight ? colorClasses[highlight.color] : 'hover:bg-secondary'
      }`}
      onClick={onVerseClick}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-amber-600 font-bold text-base sm:text-lg flex-shrink-0 select-none">
            {verseNumber}
          </span>
          {hasNote && (
            <StickyNote className="w-3 h-3 text-primary fill-primary/10" />
          )}
          {isFavorite && (
            <Heart className="w-3 h-3 text-red-500 fill-current" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground text-base sm:text-lg leading-relaxed break-words">
            {verse}
          </p>
          
          {hasNote && notePreview && (
            <div className="mt-2 p-2 bg-primary/10 border-l-2 border-primary/30 rounded text-sm">
              <p className="text-primary italic line-clamp-2">💭 {notePreview}</p>
            </div>
          )}

          {showCompare && compareText && (
            <div className="mt-2 p-2 bg-secondary border-l-2 border-border rounded text-sm">
              <div className="flex items-center gap-1 mb-1">
                <BookOpenCheck className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">{compareVersion}</span>
              </div>
              <p className="text-foreground italic">{compareText}</p>
            </div>
          )}
          {showCompare && loadingCompare && (
            <div className="mt-2 p-2 bg-secondary rounded text-sm">
              <p className="text-muted-foreground text-xs">Carregando...</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={`gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                isFavorite
                  ? "text-red-500 hover:text-red-600"
                  : "text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? "fill-current" : ""}`} />
              <span>Favorito</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddNote();
              }}
              className={`gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 ${
                hasNote
                  ? "text-primary hover:text-primary/80"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <MessageSquare className={`w-3 h-3 sm:w-4 sm:h-4 ${hasNote ? "fill-current" : ""}`} />
              <span>Anotação</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}