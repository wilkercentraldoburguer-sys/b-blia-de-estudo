import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileJson, FileText, Database, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { importDataset, saveChaptersToCache, validateImportedDataset, clearDatasetCache } from './datasetGenerator';

export default function DatasetImporter({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [validationStats, setValidationStats] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setResult(null);
    setValidationStats(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Parse arquivo
      setProgress(10);
      const chapters = await importDataset(file, 'ARA');
      
      setProgress(40);
      
      // Validar antes de salvar
      const stats = validateImportedDataset(chapters);
      setValidationStats(stats);
      
      setProgress(60);
      
      // Salvar no cache
      const saveResult = await saveChaptersToCache(chapters);
      
      setProgress(100);
      
      setResult({
        success: true,
        message: 'Dataset importado com sucesso!',
        ...saveResult,
        stats
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClearCache = () => {
    if (confirm('Tem certeza que deseja limpar todo o dataset? Esta ação não pode ser desfeita.')) {
      clearDatasetCache();
      setResult({
        success: true,
        message: 'Dataset limpo com sucesso'
      });
      setValidationStats(null);
      if (onImportComplete) {
        onImportComplete();
      }
    }
  };

  const copyReport = () => {
    if (!validationStats) return;

    const report = `
RELATÓRIO DE IMPORTAÇÃO DO DATASET
====================================

RESUMO:
- Total importado: ${validationStats.totalChapters} capítulos
- Livros cobertos: ${validationStats.booksCovered.size} de 66
- Faltantes: ${validationStats.missing.length} capítulos
- Vazios: ${validationStats.empty.length} capítulos
- Duplicados: ${validationStats.duplicates.length}

STATUS: ${validationStats.missing.length === 0 ? '✅ COMPLETO' : `⚠️ INCOMPLETO (${validationStats.missing.length} faltantes)`}

${validationStats.missing.length > 0 ? `
PRIMEIROS 20 CAPÍTULOS FALTANTES:
${validationStats.missing.slice(0, 20).map((m, i) => `${i + 1}. ${m.book} ${m.chapter} (${m.path})`).join('\n')}
${validationStats.missing.length > 20 ? `\n... e mais ${validationStats.missing.length - 20} faltantes` : ''}
` : ''}

${validationStats.empty.length > 0 ? `
CAPÍTULOS VAZIOS:
${validationStats.empty.join(', ')}
` : ''}

Data: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(report);
    alert('Relatório copiado!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Dataset Bíblico
          </CardTitle>
          <CardDescription>
            Importe um arquivo com o texto bíblico completo (JSON, CSV ou USFM)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instruções */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Formatos suportados:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>JSON:</strong> {'{ books: [{ name, key, chapters: [{ number, verses: [{ number, text }] }] }] }'}</li>
                <li><strong>CSV:</strong> book,chapter,verse,text (uma linha por versículo)</li>
                <li><strong>USFM:</strong> Formato padrão USFM (\id, \c, \v)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json,.csv,.txt,.usfm"
              onChange={handleFileSelect}
              className="hidden"
              id="dataset-upload"
            />
            <label htmlFor="dataset-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                {file ? (
                  <>
                    <FileJson className="w-12 h-12 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{file.name}</p>
                      <p className="text-sm text-slate-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </>
                ) : (
                  <>
                    <FileText className="w-12 h-12 text-slate-400" />
                    <div>
                      <p className="font-semibold text-slate-800">Clique para selecionar arquivo</p>
                      <p className="text-sm text-slate-600">JSON, CSV ou USFM</p>
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1"
              size="lg"
            >
              {importing ? (
                <>
                  <Database className="w-5 h-5 mr-2 animate-pulse" />
                  Importando {Math.round(progress)}%...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Importar e Validar
                </>
              )}
            </Button>
            
            <Button
              onClick={handleClearCache}
              variant="destructive"
              size="lg"
            >
              Limpar Dataset
            </Button>
          </div>

          {/* Progress */}
          {importing && (
            <Progress value={progress} className="h-2" />
          )}

          {/* Resultado */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
                {result.saved && (
                  <div className="mt-2 text-sm">
                    <p>✓ {result.saved} capítulos importados</p>
                    <p>✓ Total em cache: {result.totalInCache} capítulos</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Estatísticas de Validação */}
          {validationStats && (
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Relatório de Validação</CardTitle>
                  <Button size="sm" variant="outline" onClick={copyReport}>
                    📋 Copiar Relatório
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Resumo */}
                <div className={`p-4 rounded-lg ${validationStats.missing.length === 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{validationStats.totalChapters}</div>
                      <div className="text-xs text-slate-600">Importados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{validationStats.booksCovered.size}/66</div>
                      <div className="text-xs text-slate-600">Livros</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${validationStats.missing.length === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                        {validationStats.missing.length}
                      </div>
                      <div className="text-xs text-slate-600">Faltantes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-600">{validationStats.empty.length}</div>
                      <div className="text-xs text-slate-600">Vazios</div>
                    </div>
                  </div>
                </div>

                {/* Faltantes */}
                {validationStats.missing.length > 0 && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 max-h-48 overflow-y-auto">
                    <p className="font-semibold text-amber-900 mb-2 text-sm">
                      Primeiros 20 Faltantes:
                    </p>
                    <div className="space-y-1 text-xs font-mono">
                      {validationStats.missing.slice(0, 20).map((m, i) => (
                        <div key={i} className="text-amber-800">
                          {i + 1}. {m.book} {m.chapter} → {m.path}
                        </div>
                      ))}
                    </div>
                    {validationStats.missing.length > 20 && (
                      <p className="text-xs text-amber-700 mt-2 italic">
                        ... e mais {validationStats.missing.length - 20} faltantes
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como fornecer o arquivo fonte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold mb-1">Opção 1: API Pública</p>
            <p className="text-slate-600">Use serviços como Bible API, STEPBible ou getbible.net para baixar JSON/CSV</p>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Opção 2: Dataset Público</p>
            <p className="text-slate-600">Repositórios como github.com/thiagobodruk/biblia ou unfoldingWord têm datasets licenciados</p>
          </div>
          
          <div>
            <p className="font-semibold mb-1">Opção 3: Conversão USFM</p>
            <p className="text-slate-600">Converta arquivos USFM (formato padrão de traduções) para nosso formato</p>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              <strong>Importante:</strong> Certifique-se de ter direitos de uso do texto bíblico. 
              Muitas traduções têm copyright. Use versões em domínio público ou com licença apropriada.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}