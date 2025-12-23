import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, BookOpenCheck, StickyNote } from "lucide-react";
import { motion } from "framer-motion";

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
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Retorne APENAS o texto de ${bookName} ${chapter}:${verseNumber} na versão ${compareVersion}.
JSON: {"text": "texto do versículo"}`,
        response_json_schema: {
          type: "object",
          properties: { text: { type: "string" } },
          required: ["text"]
        }
      });
      setCompareText(response.text);
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
        highlight ? colorClasses[highlight.color] : 'hover:bg-slate-50'
      }`}
      onClick={onVerseClick}
    >
      <div className="flex gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-amber-600 font-bold text-base sm:text-lg flex-shrink-0 select-none">
            {verseNumber}
          </span>
          {hasNote && (
            <StickyNote className="w-3 h-3 text-blue-500 fill-blue-100" />
          )}
          {isFavorite && (
            <Heart className="w-3 h-3 text-red-500 fill-current" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-700 text-base sm:text-lg leading-relaxed break-words">
            {verse}
          </p>
          
          {hasNote && notePreview && (
            <div className="mt-2 p-2 bg-blue-50 border-l-2 border-blue-300 rounded text-sm">
              <p className="text-blue-900 italic line-clamp-2">💭 {notePreview}</p>
            </div>
          )}
          
          {showCompare && compareText && (
            <div className="mt-2 p-2 bg-slate-100 border-l-2 border-slate-400 rounded text-sm">
              <div className="flex items-center gap-1 mb-1">
                <BookOpenCheck className="w-3 h-3 text-slate-600" />
                <span className="text-xs font-semibold text-slate-600">{compareVersion}</span>
              </div>
              <p className="text-slate-700 italic">{compareText}</p>
            </div>
          )}
          {showCompare && loadingCompare && (
            <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
              <p className="text-slate-500 text-xs">Carregando...</p>
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
                  : "text-slate-400 hover:text-red-500"
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
                  ? "text-blue-600 hover:text-blue-700" 
                  : "text-slate-400 hover:text-blue-600"
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