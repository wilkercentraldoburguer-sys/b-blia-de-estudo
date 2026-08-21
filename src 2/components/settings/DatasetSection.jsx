import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertTriangle, Download, Loader2, Upload, Database } from "lucide-react";
import { validateDataset, exportReport } from "../bible/DatasetValidator";
import DatasetPathConfig from "./DatasetPathConfig";

export default function DatasetSection() {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    setResults(null);

    try {
      const validationResults = await validateDataset('ra');
      setResults(validationResults);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportReport = () => {
    if (results) {
      exportReport(results);
    }
  };

  const getCompletionPercentage = () => {
    if (!results || results.totalExpected === 0) return 0;
    return Math.round((results.totalFound / results.totalExpected) * 100);
  };

  const handleSmokeTest = async () => {
    setIsTesting(true);
    setTestResults(null);

    const tests = [
      { name: 'meta.json', url: '/bible/meta.json' },
      { name: 'João 1 (RA)', url: '/bible/ra/jo/1.json' }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const t0 = performance.now();
        const response = await fetch(test.url);
        const timeMs = Math.round(performance.now() - t0);

        if (response.ok) {
          const text = await response.text();
          const sizeKB = (text.length / 1024).toFixed(2);
          
          results.push({
            name: test.name,
            url: test.url,
            status: response.status,
            statusText: 'OK',
            sizeKB,
            timeMs,
            success: true
          });
        } else {
          results.push({
            name: test.name,
            url: test.url,
            status: response.status,
            statusText: response.statusText,
            timeMs,
            success: false,
            error: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        results.push({
          name: test.name,
          url: test.url,
          status: 'ERROR',
          statusText: error.message,
          success: false,
          error: 'Rota não servida ou erro de rede'
        });
      }
    }

    setTestResults(results);
    setIsTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Path Config */}
      <DatasetPathConfig />

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Dataset Bíblico
          </CardTitle>
          <CardDescription>
            Gerencie e valide o dataset completo da Bíblia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {results ? (
            <>
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Capítulos esperados</div>
                  <div className="text-2xl font-bold text-primary">
                    {results.totalExpected}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Capítulos encontrados</div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.totalFound}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Faltando</div>
                  <div className="text-2xl font-bold text-accent">
                    {results.missing.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Inválidos</div>
                  <div className="text-2xl font-bold text-red-600">
                    {results.invalid.length}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Completude</span>
                  <span className="text-sm font-semibold text-primary">
                    {getCompletionPercentage()}%
                  </span>
                </div>
                <Progress value={getCompletionPercentage()} className="h-3" />
              </div>

              {results.missing.length > 0 && (
                <Alert className="border-accent/30 bg-accent/10">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  <AlertDescription className="text-foreground">
                    <div className="font-semibold mb-1">
                      {results.missing.length} capítulos faltando
                    </div>
                    <div className="text-xs">
                      Importe o dataset completo para habilitar todos os capítulos
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {results.totalFound === results.totalExpected && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="font-semibold">Dataset completo!</div>
                    <div className="text-xs">Todos os capítulos disponíveis</div>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <Alert className="border-border bg-secondary">
              <AlertDescription className="text-secondary-foreground text-sm">
                Clique em "Validar dataset" para verificar quais capítulos estão disponíveis
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleValidate}
              disabled={isValidating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Validar Dataset'
              )}
            </Button>
            {results && (
              <Button
                onClick={handleExportReport}
                variant="outline"
                className="border-primary text-primary"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Smoke Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Teste de Rotas
          </CardTitle>
          <CardDescription>
            Verifique se as rotas /bible estão sendo servidas corretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSmokeTest}
            disabled={isTesting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando rotas...
              </>
            ) : (
              'Testar Rotas'
            )}
          </Button>

          {testResults && (
            <div className="space-y-2">
              {testResults.map((test, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    test.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {test.success ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span className="font-semibold text-sm">{test.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">{test.url}</div>
                      {test.success ? (
                        <div className="text-xs text-green-700 mt-1">
                          HTTP {test.status} • {test.sizeKB} KB • {test.timeMs}ms
                        </div>
                      ) : (
                        <div className="text-xs text-red-700 mt-1">
                          {test.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Alert className="border-border bg-secondary">
            <AlertDescription className="text-secondary-foreground text-xs">
              <strong>Importante:</strong> Os arquivos devem estar em <code className="bg-muted px-1 rounded">public/bible/</code> mas o fetch deve ser <code className="bg-muted px-1 rounded">/bible/</code> (sem /public)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importar Dataset
          </CardTitle>
          <CardDescription>
            Importe arquivos de dataset para popular a Bíblia completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Dataset
          </Button>
        </CardContent>
      </Card>

      {/* Import Dialog (Placeholder) */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Dataset Bíblico</DialogTitle>
            <DialogDescription>
              Módulo de importação de dataset
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="border-accent/30 bg-accent/10">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <AlertDescription className="text-foreground">
                <div className="font-semibold mb-2">Dataset ainda não fornecido</div>
                <div className="text-sm space-y-1">
                  <p>Este módulo está preparado para importar datasets em formato:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>ZIP contendo arquivos JSON organizados por livro/capítulo</li>
                    <li>Arquivos JSON individuais no formato padrão</li>
                  </ul>
                  <p className="mt-2">
                    Quando você tiver o dataset licenciado, basta fornecê-lo e
                    o sistema irá importar e preencher <code className="bg-accent/20 px-1 rounded">/bible/</code>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-secondary p-4 rounded-lg border border-border">
              <div className="font-semibold text-foreground mb-2">Formato esperado dos arquivos:</div>
              <pre className="text-xs bg-card p-3 rounded border border-border overflow-x-auto">
{`{
  "version": "ra",
  "bookKey": "jo",
  "bookName": "João",
  "chapter": 6,
  "verses": [
    { "n": 1, "text": "Texto do versículo..." },
    { "n": 2, "text": "Texto do versículo..." }
  ]
}`}
              </pre>
            </div>

            <div className="bg-secondary p-4 rounded-lg border border-border">
              <div className="text-sm text-secondary-foreground">
                <strong>Estrutura de pastas:</strong>
                <pre className="mt-2 text-xs bg-card p-2 rounded border border-border">
{`/public/bible/
  meta.json
  ra/
    jo/
      1.json
      2.json
      ...`}
                </pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}