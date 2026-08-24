import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const BIBLE_BOOKS = [
  // Antigo Testamento
  { name: "Gênesis", chapters: 50, testament: "AT" },
  { name: "Êxodo", chapters: 40, testament: "AT" },
  { name: "Levítico", chapters: 27, testament: "AT" },
  { name: "Números", chapters: 36, testament: "AT" },
  { name: "Deuteronômio", chapters: 34, testament: "AT" },
  // Novo Testamento
  { name: "Mateus", chapters: 28, testament: "NT" },
  { name: "Marcos", chapters: 16, testament: "NT" },
  { name: "Lucas", chapters: 24, testament: "NT" },
  { name: "João", chapters: 21, testament: "NT" },
  { name: "Atos", chapters: 28, testament: "NT" },
  { name: "Romanos", chapters: 16, testament: "NT" },
  { name: "1 Coríntios", chapters: 16, testament: "NT" },
  { name: "2 Coríntios", chapters: 13, testament: "NT" },
  { name: "Gálatas", chapters: 6, testament: "NT" },
  { name: "Efésios", chapters: 6, testament: "NT" },
  { name: "Filipenses", chapters: 4, testament: "NT" },
  { name: "Colossenses", chapters: 4, testament: "NT" },
  { name: "1 Tessalonicenses", chapters: 5, testament: "NT" },
  { name: "2 Tessalonicenses", chapters: 3, testament: "NT" },
  { name: "Apocalipse", chapters: 22, testament: "NT" }
];

export default function ReadingProgressByBook({ highlights, notes }) {
  const getBookProgress = (bookName) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    if (!book) return 0;

    const readChapters = new Set();
    
    highlights.forEach(h => {
      if (h.book === bookName) readChapters.add(h.chapter);
    });
    
    notes.forEach(n => {
      if (n.book === bookName) readChapters.add(n.chapter);
    });

    return Math.round((readChapters.size / book.chapters) * 100);
  };

  const booksWithProgress = BIBLE_BOOKS.map(book => ({
    ...book,
    progress: getBookProgress(book.name)
  })).filter(book => book.progress > 0).sort((a, b) => b.progress - a.progress);

  const totalProgress = booksWithProgress.length > 0
    ? Math.round(booksWithProgress.reduce((acc, b) => acc + b.progress, 0) / BIBLE_BOOKS.length)
    : 0;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Progresso por Livro
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {totalProgress}%
            </p>
            <p className="text-xs text-muted-foreground">Bíblia Total</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {booksWithProgress.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Comece a ler para ver seu progresso
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4 pr-4">
              {booksWithProgress.map((book) => (
                <div key={book.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-card-foreground">{book.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          book.testament === 'AT'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {book.testament}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {book.progress}%
                    </span>
                  </div>
                  <Progress value={book.progress} className="h-2" />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}