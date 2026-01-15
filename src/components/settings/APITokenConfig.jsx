import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Key, ExternalLink } from "lucide-react";
import { testAPIConnection, saveAPIToken, getAPIToken, hasAPIToken } from "../bible/apiTokenManager";

export default function APITokenConfig() {
  const [token, setToken] = useState("");
  const [maskedToken, setMaskedToken] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCurrentToken();
  }, []);

  const loadCurrentToken = () => {
    if (hasAPIToken()) {
      const savedToken = getAPIToken();
      setMaskedToken(maskToken(savedToken));
      setIsSaved(true);
    }
  };

  const maskToken = (tokenStr) => {
    if (!tokenStr || tokenStr.length < 8) return "****";
    return tokenStr.substring(0, 4) + "****" + tokenStr.substring(tokenStr.length - 4);
  };

  const handleSave = () => {
    if (!token.trim()) return;
    
    setIsSaving(true);
    saveAPIToken(token.trim());
    setMaskedToken(maskToken(token.trim()));
    setIsSaved(true);
    setToken("");
    setIsSaving(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testAPIConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleClear = () => {
    setToken("");
    setMaskedToken("");
    setIsSaved(false);
    setTestResult(null);
    localStorage.removeItem("abiblia_token");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" style={{ color: '#722f37' }} />
          Token ABíbliaDigital
        </CardTitle>
        <CardDescription>
          Configure seu token de acesso para carregar capítulos da Bíblia via API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSaved ? (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Token configurado: <code className="bg-green-100 px-2 py-1 rounded text-xs">{maskedToken}</code>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                onClick={handleTest}
                disabled={isTesting}
                variant="outline"
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Testar Conexão"
                )}
              </Button>
              <Button onClick={handleClear} variant="destructive">
                Remover Token
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? "text-green-800" : "text-red-800"}>
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.details && (
                    <div className="text-xs mt-1 space-y-1">
                      <div>Status: {testResult.details.status}</div>
                      <div>Tempo: {testResult.details.timeMs}ms</div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800 text-sm">
                <div className="font-semibold mb-1">Token não configurado</div>
                <div>Configure seu token para acessar todos os capítulos da Bíblia.</div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                Cole seu token aqui:
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token da ABíbliaDigital"
                className="font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!token.trim() || isSaving}
              className="w-full text-white"
              style={{ backgroundColor: '#722f37' }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Token"
              )}
            </Button>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800 text-xs">
                <div className="font-semibold mb-1">Como obter o token?</div>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse o site da ABíbliaDigital</li>
                  <li>Crie uma conta gratuita</li>
                  <li>Gere seu token de acesso</li>
                  <li>Cole o token aqui e salve</li>
                </ol>
                <a
                  href="https://www.abibliadigital.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 mt-2 text-blue-600 hover:underline"
                >
                  Acessar ABíbliaDigital
                  <ExternalLink className="w-3 h-3" />
                </a>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}