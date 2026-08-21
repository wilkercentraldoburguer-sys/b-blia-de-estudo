import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChapterNavigation({ 
  book, 
  chapter, 
  totalChapters, 
  onPrevious, 
  onNext, 
  onChapterSelect 
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 py-4 sm:py-6">
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={chapter === 1}
        className="flex items-center gap-2 text-primary hover:bg-primary/10 w-full sm:w-auto order-2 sm:order-1"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Anterior</span>
      </Button>

      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-wrap justify-center order-1 sm:order-2 w-full sm:w-auto">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center">{book}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">Cap.</span>
          <select
            value={chapter}
            onChange={(e) => onChapterSelect(parseInt(e.target.value))}
            className="px-2 py-1 sm:px-3 sm:py-2 border border-border rounded-lg bg-card text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={onNext}
        disabled={chapter === totalChapters}
        className="flex items-center gap-2 text-primary hover:bg-primary/10 w-full sm:w-auto order-3"
      >
        <span className="text-sm sm:text-base">Próximo</span>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
}