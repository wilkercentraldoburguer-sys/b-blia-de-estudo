import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertTriangle, Download, Loader2, Upload, Database } from "lucide-react";
import { validateDataset, exportReport } from "../bible/DatasetValidator";

export default function DatasetSection() {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" style={{ color: '#722f37' }} />
            Dataset Bíblico
          </CardTitle>
          <CardDescription>
            Gerencie e valide o dataset completo da Bíblia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {results ? (
            <>
              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-lg">
                <div>
                  <div className="text-sm text-stone-600">Capítulos esperados</div>
                  <div className="text-2xl font-bold" style={{ color: '#722f37' }}>
                    {results.totalExpected}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600">Capítulos encontrados</div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.totalFound}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600">Faltando</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {results.missing.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-600">Inválidos</div>
                  <div className="text-2xl font-bold text-red-600">
                    {results.invalid.length}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-700">Completude</span>
                  <span className="text-sm font-semibold" style={{ color: '#722f37' }}>
                    {getCompletionPercentage()}%
                  </span>
                </div>
                <Progress value={getCompletionPercentage()} className="h-3" />
              </div>

              {results.missing.length > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
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
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800 text-sm">
                Clique em "Validar dataset" para verificar quais capítulos estão disponíveis
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleValidate}
              disabled={isValidating}
              className="flex-1 text-white"
              style={{ backgroundColor: '#722f37' }}
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
                style={{ borderColor: '#722f37', color: '#722f37' }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar JSON
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" style={{ color: '#722f37' }} />
            Importar Dataset
          </CardTitle>
          <CardDescription>
            Importe arquivos de dataset para popular a Bíblia completa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setImportDialogOpen(true)}
            className="w-full text-white"
            style={{ backgroundColor: '#722f37' }}
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
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="font-semibold mb-2">Dataset ainda não fornecido</div>
                <div className="text-sm space-y-1">
                  <p>Este módulo está preparado para importar datasets em formato:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>ZIP contendo arquivos JSON organizados por livro/capítulo</li>
                    <li>Arquivos JSON individuais no formato padrão</li>
                  </ul>
                  <p className="mt-2">
                    Quando você tiver o dataset licenciado, basta fornecê-lo e
                    o sistema irá importar e preencher <code className="bg-amber-100 px-1 rounded">/bible/</code>
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
              <div className="font-semibold text-stone-800 mb-2">Formato esperado dos arquivos:</div>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
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

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-900">
                <strong>Estrutura de pastas:</strong>
                <pre className="mt-2 text-xs bg-white p-2 rounded">
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