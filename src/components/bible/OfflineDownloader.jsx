import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { downloadBookOffline } from './bibleLoader';

export default function OfflineDownloader({ currentBook, totalChapters, selectedVersion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);
    setResult(null);

    try {
      const downloadResult = await downloadBookOffline(
        selectedVersion,
        currentBook,
        totalChapters,
        (progressInfo) => {
          setProgress(progressInfo.percentage);
        }
      );

      setResult(downloadResult);
    } catch (error) {
      setResult({
        success: 0,
        failed: totalChapters,
        errors: [{ error: error.message }]
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        style={{ borderColor: '#722f37', color: '#722f37' }}
      >
        <Download className="w-4 h-4" />
        Baixar para Offline
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixar {currentBook} para Offline</DialogTitle>
            <DialogDescription>
              Baixar todos os {totalChapters} capítulos de {currentBook} ({selectedVersion}) para leitura offline
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!downloading && !result && (
              <div className="text-sm text-slate-600">
                <p className="mb-2">
                  Isso irá baixar todos os capítulos e salvá-los localmente para acesso rápido sem internet.
                </p>
                <p className="text-xs text-slate-500">
                  Tempo estimado: ~{Math.ceil(totalChapters * 0.2)} segundos
                </p>
              </div>
            )}

            {downloading && (
              <div className="space-y-3">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-slate-600">
                  Baixando... {Math.round(progress)}%
                </p>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg ${result.failed === 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.failed === 0 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <p className="font-semibold text-slate-800">
                    {result.failed === 0 ? 'Download Completo!' : 'Download Parcial'}
                  </p>
                </div>
                <div className="text-sm text-slate-700">
                  <p>✓ {result.success} capítulos baixados com sucesso</p>
                  {result.failed > 0 && (
                    <p className="text-amber-700">✗ {result.failed} falharam</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Fechar
              </Button>
              {!result && (
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="text-white"
                  style={{ backgroundColor: '#722f37' }}
                >
                  {downloading ? 'Baixando...' : 'Iniciar Download'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}