import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Check, Loader2, RefreshCw, Clock } from "lucide-react";
import { OLD_TESTAMENT, NEW_TESTAMENT } from "./BookSelector";
import { base44 } from "@/api/base44Client";

const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

export default function OfflineManager({ selectedVersion, onClose }) {
  const [downloadedBooks, setDownloadedBooks] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [currentDownload, setCurrentDownload] = useState(null);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState("main"); // main, books

  useEffect(() => {
    loadDownloadedBooks();
  }, []);

  const loadDownloadedBooks = () => {
    const offline = localStorage.getItem('offline_bible_books');
    if (offline) {
      setDownloadedBooks(JSON.parse(offline));
    }
  };

  const isBookDownloaded = (bookName) => {
    return downloadedBooks.some(b => b.book === bookName && b.version === selectedVersion);
  };

  const downloadBook = async (book) => {
    setDownloading(true);
    setCurrentDownload(book.name);
    setProgress(0);

    const bookData = { 
      book: book.name, 
      version: selectedVersion, 
      chapters: [],
      downloadedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Retorne o texto completo de ${book.name} capítulo ${chapter} da Bíblia em português (versão ARA).

JSON:
{
  "verses": [
    {"number": 1, "text": "verso 1"},
    {"number": 2, "text": "verso 2"}
  ]
}`,
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

        bookData.chapters.push({
          chapter,
          verses: response.verses || []
        });

        setProgress(Math.round((chapter / book.chapters) * 100));
      } catch (error) {
        console.error(`Erro ao baixar ${book.name} ${chapter}:`, error);
      }
    }

    const updated = [...downloadedBooks.filter(b => !(b.book === book.name && b.version === selectedVersion)), bookData];
    setDownloadedBooks(updated);
    localStorage.setItem('offline_bible_books', JSON.stringify(updated));
    localStorage.setItem('offline_cache_version', '1.0');
    
    // Dispatch event for settings page
    window.dispatchEvent(new Event('offlineDataUpdated'));

    setDownloading(false);
    setCurrentDownload(null);
    setProgress(0);
  };

  const downloadAllBible = async () => {
    for (const book of ALL_BOOKS) {
      if (!isBookDownloaded(book.name)) {
        await downloadBook(book);
      }
    }
  };

  const deleteBook = (bookName) => {
    const updated = downloadedBooks.filter(b => !(b.book === bookName && b.version === selectedVersion));
    setDownloadedBooks(updated);
    localStorage.setItem('offline_bible_books', JSON.stringify(updated));
    window.dispatchEvent(new Event('offlineDataUpdated'));
  };

  const deleteAll = () => {
    const updated = downloadedBooks.filter(b => b.version !== selectedVersion);
    setDownloadedBooks(updated);
    localStorage.setItem('offline_bible_books', JSON.stringify(updated));
    window.dispatchEvent(new Event('offlineDataUpdated'));
  };

  const updateBook = async (book) => {
    await downloadBook(book);
  };

  const needsUpdate = (bookData) => {
    if (!bookData.downloadedAt) return true;
    const daysSinceDownload = (new Date() - new Date(bookData.downloadedAt)) / (1000 * 60 * 60 * 24);
    return daysSinceDownload > 30;
  };

  const getStorageSize = () => {
    const offline = localStorage.getItem('offline_bible_books');
    if (!offline) return "0 KB";
    const bytes = new Blob([offline]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const downloadedCount = downloadedBooks.filter(b => b.version === selectedVersion).length;
  const isFullBibleDownloaded = downloadedCount === ALL_BOOKS.length;

  if (view === "books") {
    return (
      <div className="space-y-4">
        {/* Progresso de Download */}
        {downloading && currentDownload && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800">Baixando: {currentDownload}</p>
                  <p className="text-sm text-slate-600">{progress}%</p>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        <ScrollArea className="h-[500px]">
          <div className="space-y-2 pr-4">
            {ALL_BOOKS.map((book) => {
              const isDownloaded = isBookDownloaded(book.name);
              const isCurrentlyDownloading = currentDownload === book.name;

              return (
                <div
                  key={book.name}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{book.name}</p>
                      <p className="text-xs text-slate-500">{book.chapters} capítulos</p>
                      {isDownloaded && downloadedBooks.find(b => b.book === book.name)?.downloadedAt && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(downloadedBooks.find(b => b.book === book.name).downloadedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isDownloaded ? (
                      <>
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                        {needsUpdate(downloadedBooks.find(b => b.book === book.name)) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBook(book)}
                            disabled={downloading}
                            className="text-amber-600 hover:bg-amber-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Atualizar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBook(book.name)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Remover
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => downloadBook(book)}
                        disabled={downloading}
                        variant="outline"
                      >
                        {isCurrentlyDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card da Bíblia Completa */}
      <Card className={isFullBibleDownloaded ? "bg-green-50 border-green-300" : "bg-white"}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                isFullBibleDownloaded ? "bg-green-100" : "bg-blue-100"
              }`}>
                {isFullBibleDownloaded ? (
                  <Check className="w-8 h-8 text-green-600" />
                ) : (
                  <Download className="w-8 h-8 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Bíblia Completa</h3>
                <p className="text-sm text-slate-600">
                  {isFullBibleDownloaded 
                    ? "66 livros disponíveis offline" 
                    : `${downloadedCount} de 66 livros`}
                </p>
                <p className="text-xs text-slate-500 mt-1">{getStorageSize()}</p>
              </div>
            </div>
            <div>
              {isFullBibleDownloaded ? (
                <Button
                  variant="outline"
                  onClick={deleteAll}
                  className="text-red-600 hover:bg-red-50"
                >
                  Remover Tudo
                </Button>
              ) : (
                <Button
                  onClick={downloadAllBible}
                  disabled={downloading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Baixando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Tudo
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progresso de Download */}
      {downloading && currentDownload && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">Baixando: {currentDownload}</p>
                <p className="text-sm text-slate-600">{progress}%</p>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão para ver livros individuais */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setView("books")}
      >
        Gerenciar Livros Individuais
      </Button>

      {/* Info */}
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Sobre downloads:</strong> Os livros são baixados para leitura offline e ocupam espaço no seu navegador. 
          Você pode remover livros a qualquer momento.
        </p>
      </div>
    </div>
  );
}