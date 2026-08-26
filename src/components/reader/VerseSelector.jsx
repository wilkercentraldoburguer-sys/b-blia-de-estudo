import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "../bible/BookSelector";
import { BIBLE_VERSIONS } from "../bible/bibleVersions";

const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

export default function VerseSelector({
  currentBook,
  currentChapter,
  totalChapters,
  selectedVersion,
  onBookChange,
  onChapterChange,
  onVersionChange
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Seletor de Livro */}
      <Select 
        value={currentBook} 
        onValueChange={(book) => {
          const bookData = ALL_BOOKS.find(b => b.name === book);
          if (bookData) {
            onBookChange(book, bookData.chapters);
          }
        }}
      >
        <SelectTrigger className="border-2 border-primary">
          <SelectValue placeholder="Livro" />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <div className="px-2 py-1 text-xs font-semibold text-primary">
            Antigo Testamento
          </div>
          {OLD_TESTAMENT.map((book) => (
            <SelectItem key={book.name} value={book.name}>
              {book.name}
            </SelectItem>
          ))}
          <div className="px-2 py-1 text-xs font-semibold mt-2 text-primary">
            Novo Testamento
          </div>
          {NEW_TESTAMENT.map((book) => (
            <SelectItem key={book.name} value={book.name}>
              {book.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Seletor de Capítulo */}
      <Select 
        value={currentChapter.toString()} 
        onValueChange={(ch) => onChapterChange(parseInt(ch))}
      >
        <SelectTrigger className="border-2 border-primary">
          <SelectValue placeholder="Cap." />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {Array.from({ length: totalChapters }, (_, i) => i + 1).map((ch) => (
            <SelectItem key={ch} value={ch.toString()}>
              Capítulo {ch}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Seletor de Versão */}
      <Select value={selectedVersion} onValueChange={onVersionChange}>
        <SelectTrigger className="border-2 border-primary">
          <SelectValue placeholder="Versão" />
        </SelectTrigger>
        <SelectContent>
          {BIBLE_VERSIONS.map(version => (
            <SelectItem
              key={version.sigla}
              value={version.sigla}
              disabled={version.indisponivel}
              title={version.indisponivel ? 'Indisponível: sem fonte gratuita/legal para esta tradução' : undefined}
            >
              {version.sigla}{version.indisponivel ? ' (indisponível)' : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}