import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Download, Loader2 } from "lucide-react";
import { validateDataset, exportValidationReport } from "../bible/DatasetManager";

export default function DatasetValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState(null);

  const handleValidate = async () => {
    setIsValidating(true);
    setResults(null);

    try {
      const validationResults = await validateDataset('ra');
      setResults(validationResults);
    } catch (error) {
      console.error('Validation failed:', error);
      setResults({
        totalExpected: 1189,
        totalFound: 0,
        missing: [],
        invalid: [],
        error: error.message
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportReport = () => {
    if (results) {
      exportValidationReport(results);
    }
  };

  const getCompletionPercentage = () => {
    if (!results || results.totalExpected === 0) return 0;
    return Math.round((results.totalFound / results.totalExpected) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Validador do Dataset
        </CardTitle>
        <CardDescription>
          Verifique a integridade e completude do dataset bíblico instalado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full text-white"
          style={{ backgroundColor: '#722f37' }}
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            'Verificar Agora'
          )}
        </Button>

        {results && !results.error && (
          <div className="space-y-4">
            {/* Resumo */}
            <Alert className={results.totalFound === results.totalExpected ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
              <div className={results.totalFound === results.totalExpected ? "text-green-600" : "text-amber-600"}>
                {results.totalFound === results.totalExpected ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <AlertDescription className={results.totalFound === results.totalExpected ? "text-green-800" : "text-amber-800"}>
                <div className="font-semibold mb-2">
                  {results.totalFound === results.totalExpected 
                    ? 'Dataset completo!' 
                    : 'Dataset incompleto'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total esperado: <strong>{results.totalExpected}</strong></div>
                  <div>Total encontrado: <strong>{results.totalFound}</strong></div>
                  <div>Faltando: <strong>{results.missing.length}</strong></div>
                  <div>Inválidos: <strong>{results.invalid.length}</strong></div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Barra de Progresso */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-700">Completude</span>
                <span className="text-sm text-stone-600">{getCompletionPercentage()}%</span>
              </div>
              <Progress value={getCompletionPercentage()} className="h-3" />
            </div>

            {/* Detalhes de Faltando */}
            {results.missing.length > 0 && (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-amber-900">
                    Capítulos Faltando ({results.missing.length})
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2 text-xs text-amber-800">
                    {results.missing.slice(0, 50).map((m, idx) => (
                      <div key={idx} className="bg-white px-2 py-1 rounded">
                        {m.book} {m.chapter}
                      </div>
                    ))}
                    {results.missing.length > 50 && (
                      <div className="col-span-4 text-center text-amber-600 mt-2">
                        ... e mais {results.missing.length - 50} capítulos
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detalhes de Inválidos */}
            {results.invalid.length > 0 && (
              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h3 className="font-semibold text-red-900">
                    Capítulos Inválidos ({results.invalid.length})
                  </h3>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 text-xs text-red-800">
                  {results.invalid.map((i, idx) => (
                    <div key={idx} className="bg-white px-2 py-1 rounded">
                      {i.book} {i.chapter}: {i.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botão Exportar */}
            <Button
              onClick={handleExportReport}
              variant="outline"
              className="w-full"
              style={{ borderColor: '#722f37', color: '#722f37' }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        )}

        {results?.error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="font-semibold mb-1">Erro na validação</div>
              <div className="text-sm">{results.error}</div>
            </AlertDescription>
          </Alert>
        )}

        {!results && !isValidating && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800 text-sm">
              <div className="font-semibold mb-1">Sobre a validação</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Verifica todos os 1189 capítulos esperados</li>
                <li>Identifica arquivos faltando ou com formato inválido</li>
                <li>Gera relatório exportável para análise</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}