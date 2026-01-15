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
      expectedFiles: BIBLE_META.totalChapters,
      validated: 0,
      missing: [],
      empty: [],
      samples: [],
      errors: [],
      first20Missing: []
    };
    
    let processed = 0;
    
    // VALIDAÇÃO COMPLETA - todos os 1189 capítulos
    const allChapters = [];
    for (const book of BIBLE_META.books) {
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        allChapters.push({ book, chapter });
      }
    }
    
    console.log(`🔍 Iniciando validação de ${allChapters.length} capítulos...`);
    
    for (const { book, chapter } of allChapters) {
      try {
        const data = await fetchChapterFromJSON('ARA', book.name, chapter);
        
        if (!data.verses || data.verses.length === 0) {
          results.empty.push(`${book.name} ${chapter}`);
        } else {
          results.validated++;
          
          // Amostrar 10 aleatórios para exibir
          if (results.samples.length < 10 && Math.random() < 0.01) {
            results.samples.push({
              path: `data/ARA/${book.key}/${chapter}.json`,
              verses: data.verses.length,
              book: book.name,
              chapter
            });
          }
        }
      } catch (error) {
        const path = `/data/ARA/${book.key}/${chapter}.json`;
        results.missing.push(path);
        
        // Guardar primeiros 20 faltantes
        if (results.first20Missing.length < 20) {
          results.first20Missing.push({
            path,
            book: book.name,
            chapter,
            error: error.message
          });
        }
      }
      
      processed++;
      setProgress((processed / allChapters.length) * 100);
      
      // Update UI a cada 50 capítulos
      if (processed % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    console.log(`✅ Validação completa: ${results.validated}/${allChapters.length} encontrados`);
    console.log(`❌ Faltando: ${results.missing.length} arquivos`);
    
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
              Validando {Math.round(progress)}%...
            </>
          ) : (
            'Validar Dataset Completo (1.189 capítulos)'
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Relatório de Validação Completa</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const reportText = `
RELATÓRIO DE VALIDAÇÃO DO DATASET BÍBLICO
==========================================

Total Esperado: ${report.expectedFiles} arquivos (66 livros, 1.189 capítulos)
Total Encontrados: ${report.validated} arquivos (${((report.validated / report.expectedFiles) * 100).toFixed(1)}%)
Total Faltando: ${report.missing.length} arquivos
Total Vazios: ${report.empty.length} arquivos

STATUS: ${report.missing.length === 0 ? '✅ COMPLETO' : `❌ INCOMPLETO (${report.missing.length} faltantes)`}

${report.missing.length > 0 ? `
PRIMEIROS 20 ARQUIVOS FALTANTES:
${report.first20Missing.map((m, i) => `${i + 1}. ${m.path}\n   ${m.book} ${m.chapter} - ${m.error}`).join('\n')}
` : ''}

AMOSTRAS VERIFICADAS:
${report.samples.map(s => `✓ ${s.path} (${s.verses} versículos)`).join('\n')}

Data: ${new Date().toISOString()}
                    `.trim();
                    
                    navigator.clipboard.writeText(reportText);
                    alert('Relatório copiado para a área de transferência!');
                  }}
                >
                  📋 Copiar Relatório
                </Button>
              </div>
              
              <div className="grid gap-3">
                {/* Resumo Principal */}
                <div className={`p-4 rounded-lg ${report.missing.length === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2`}>
                  <div className="flex items-center gap-3 mb-2">
                    {report.missing.length === 0 ? (
                      <CheckCircle2 className="w-6 h-6 text-green-700" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-700" />
                    )}
                    <div>
                      <p className={`font-bold ${report.missing.length === 0 ? 'text-green-900' : 'text-red-900'}`}>
                        {report.missing.length === 0 
                          ? '✅ DATASET COMPLETO' 
                          : `❌ DATASET INCOMPLETO (${report.missing.length} faltantes)`}
                      </p>
                      <p className={`text-sm ${report.missing.length === 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {report.validated} de {report.expectedFiles} arquivos ({((report.validated / report.expectedFiles) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primeiros 20 Faltantes */}
                {report.first20Missing.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold mb-3 text-red-900 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Primeiros 20 Arquivos Faltantes:
                    </h4>
                    <div className="space-y-2 text-sm font-mono">
                      {report.first20Missing.map((missing, i) => (
                        <div key={i} className="bg-white p-2 rounded border border-red-200">
                          <div className="text-red-800 font-semibold">{i + 1}. {missing.path}</div>
                          <div className="text-red-600 text-xs mt-1">{missing.book} {missing.chapter} - {missing.error}</div>
                        </div>
                      ))}
                    </div>
                    {report.missing.length > 20 && (
                      <p className="text-xs text-red-700 mt-3 italic">
                        ... e mais {report.missing.length - 20} arquivos faltando
                      </p>
                    )}
                  </div>
                )}

                {/* Amostras Encontradas */}
                {report.samples.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 text-green-900">Amostras Encontradas:</h4>
                    <div className="space-y-1 text-sm font-mono">
                      {report.samples.map((sample, i) => (
                        <div key={i} className="flex justify-between bg-white p-2 rounded">
                          <span className="text-green-800">{sample.path}</span>
                          <span className="text-green-600">{sample.verses} versículos</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {report.empty.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold mb-2 text-amber-900">Capítulos Vazios ({report.empty.length}):</h4>
                    <div className="text-sm text-amber-800">
                      {report.empty.join(', ')}
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