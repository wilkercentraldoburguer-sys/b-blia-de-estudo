import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Search } from "lucide-react";
import { autoDetectBasePath, testBasePath, getBasePath, setBasePath } from "../bible/DatasetPathDetector";

export default function DatasetPathConfig() {
  const [currentPath, setCurrentPath] = useState(getBasePath());
  const [isDetecting, setIsDetecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [detectionResults, setDetectionResults] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setCurrentPath(getBasePath());
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setDetectionResults(null);
    setTestResult(null);

    const result = await autoDetectBasePath();
    setDetectionResults(result);
    
    if (result.success) {
      setCurrentPath(result.basePath);
    }

    setIsDetecting(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testBasePath(currentPath);
    setTestResult(result);

    setIsTesting(false);
  };

  const handleSave = () => {
    setBasePath(currentPath);
    setTestResult(null);
    setDetectionResults(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" style={{ color: '#722f37' }} />
          Rota Pública do Dataset
        </CardTitle>
        <CardDescription>
          Configure o caminho base onde os arquivos do dataset estão sendo servidos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Base path do dataset</label>
          <div className="flex gap-2">
            <Input
              value={currentPath}
              onChange={(e) => setCurrentPath(e.target.value)}
              placeholder="/bible"
              className="font-mono text-sm"
            />
            <Button onClick={handleSave} variant="outline" style={{ borderColor: '#722f37', color: '#722f37' }}>
              Salvar
            </Button>
          </div>
          <p className="text-xs text-stone-500">
            Exemplo: /bible (arquivos em public/bible/)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="flex-1 text-white"
            style={{ backgroundColor: '#722f37' }}
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Auto-detectando...
              </>
            ) : (
              'Auto-detectar'
            )}
          </Button>
          <Button
            onClick={handleTest}
            disabled={isTesting}
            variant="outline"
            style={{ borderColor: '#722f37', color: '#722f37' }}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Agora'
            )}
          </Button>
        </div>

        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription>
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.success ? 'Rota funcionando!' : 'Rota não encontrada'}
                  </div>
                  <div className="text-xs mt-1 space-y-1">
                    <div className="font-mono">{testResult.url}</div>
                    <div>Status: {testResult.status} • {testResult.timeMs}ms</div>
                    {testResult.success && <div>Bytes: {testResult.bytes} • Content-Type: {testResult.contentType}</div>}
                    {testResult.error && <div className="text-red-700">Erro: {testResult.error}</div>}
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {detectionResults && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-stone-700">
              {detectionResults.success ? '✅ Base path detectado' : '❌ Nenhuma rota válida encontrada'}
            </div>
            {detectionResults.success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="font-semibold">Detectado: {detectionResults.basePath}</div>
                  <div className="text-xs mt-1">Base path salvo automaticamente</div>
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-1">
              {detectionResults.results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-xs ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{result.url}</span>
                    <span className={result.success ? 'text-green-700' : 'text-stone-500'}>
                      {result.status} • {result.timeMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800 text-xs">
            <div className="font-semibold mb-1">Como funciona:</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Auto-detectar testa múltiplos prefixos candidatos</li>
              <li>O primeiro que retornar 200 é salvo automaticamente</li>
              <li>Você pode configurar manualmente se preferir</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}