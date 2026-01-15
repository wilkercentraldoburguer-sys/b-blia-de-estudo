import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BIBLE_META } from './bibleMeta';
import { fetchChapterFromJSON, getCacheStats } from './bibleLoader';
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';

/**
 * Componente de validação e relatório do dataset bíblico
 */
export default function BibleValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [cacheStats, setCacheStats] = useState(getCacheStats());

  const validateDataset = async () => {
    setIsValidating(true);
    setProgress(0);
    
    const results = {
      totalBooks: BIBLE_META.totalBooks,
      totalChapters: BIBLE_META.totalChapters,
      validated: 0,
      missing: [],
      empty: [],
      samples: [],
      errors: []
    };
    
    let processed = 0;
    
    // Validar amostra aleatória (10 capítulos)
    const samples = [];
    for (let i = 0; i < 10; i++) {
      const randomBook = BIBLE_META.books[Math.floor(Math.random() * BIBLE_META.books.length)];
      const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
      samples.push({ book: randomBook, chapter: randomChapter });
    }
    
    for (const { book, chapter } of samples) {
      try {
        const data = await fetchChapterFromJSON('ARA', book.name, chapter);
        
        if (!data.verses || data.verses.length === 0) {
          results.empty.push(`${book.name} ${chapter}`);
        } else {
          results.validated++;
          results.samples.push({
            path: `${book.key}/${chapter}`,
            verses: data.verses.length,
            book: book.name,
            chapter
          });
        }
      } catch (error) {
        results.missing.push(`${book.name} ${chapter}`);
        results.errors.push({
          book: book.name,
          chapter,
          error: error.message
        });
      }
      
      processed++;
      setProgress((processed / samples.length) * 100);
    }
    
    setReport(results);
    setCacheStats(getCacheStats());
    setIsValidating(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-6 h-6" />
          Validação do Dataset Bíblico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas do Cache */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{BIBLE_META.totalBooks}</div>
            <div className="text-sm text-blue-600">Livros</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{BIBLE_META.totalChapters}</div>
            <div className="text-sm text-green-600">Capítulos</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{cacheStats.cachedChapters || 0}</div>
            <div className="text-sm text-purple-600">Em Cache</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber-700">
              {cacheStats.cachedChapters ? Math.round((cacheStats.cachedChapters / BIBLE_META.totalChapters) * 100) : 0}%
            </div>
            <div className="text-sm text-amber-600">Completude</div>
          </div>
        </div>

        {/* Estatísticas de Fonte */}
        {cacheStats.total && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Estatísticas de Carregamento</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Cache Memória:</span>
                <span className="font-mono">{cacheStats.memory || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Cache Persistente:</span>
                <span className="font-mono">{cacheStats.persistent || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Dados Inline:</span>
                <span className="font-mono">{cacheStats.inline || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Via LLM:</span>
                <span className="font-mono">{cacheStats.llm || 0}</span>
              </div>
              <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Total:</span>
                <span className="font-mono">{cacheStats.total || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Validação */}
        <Button
          onClick={validateDataset}
          disabled={isValidating}
          className="w-full"
          size="lg"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            'Validar Dataset (Amostra Aleatória)'
          )}
        </Button>

        {/* Progresso */}
        {isValidating && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-slate-600">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Relatório */}
        {report && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-3">Relatório de Validação</h3>
              
              <div className="grid gap-3">
                {/* Resumo */}
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{report.validated} amostras validadas com sucesso</span>
                </div>
                
                {report.missing.length > 0 && (
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="w-5 h-5" />
                    <span>{report.missing.length} capítulos faltantes</span>
                  </div>
                )}
                
                {report.empty.length > 0 && (
                  <div className="flex items-center gap-2 text-amber-700">
                    <XCircle className="w-5 h-5" />
                    <span>{report.empty.length} capítulos vazios</span>
                  </div>
                )}

                {/* Amostras */}
                {report.samples.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2">Amostras Verificadas:</h4>
                    <div className="space-y-1 text-sm font-mono">
                      {report.samples.map((sample, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{sample.book} {sample.chapter}</span>
                          <span className="text-green-600">{sample.verses} versículos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Erros */}
                {report.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg mt-4">
                    <h4 className="font-semibold mb-2 text-red-800">Erros Encontrados:</h4>
                    <div className="space-y-1 text-sm">
                      {report.errors.map((err, i) => (
                        <div key={i} className="text-red-700">
                          {err.book} {err.chapter}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Informação */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
          <p className="text-blue-900">
            <strong>Sistema Híbrido:</strong> João 1-4 inline (instantâneo), demais capítulos via LLM com cache permanente.
            Primeiro acesso pode demorar 5-15s, acessos posteriores &lt; 2s (cache).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}