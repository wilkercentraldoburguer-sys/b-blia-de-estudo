import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

export default function UpdateNotificationBanner() {
  const [updateCount, setUpdateCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkForUpdates();
    
    const handleUpdate = () => checkForUpdates();
    window.addEventListener('offlineDataUpdated', handleUpdate);
    
    return () => window.removeEventListener('offlineDataUpdated', handleUpdate);
  }, []);

  const checkForUpdates = () => {
    const books = localStorage.getItem('offline_bible_books');
    const dismissedUntil = localStorage.getItem('update_banner_dismissed');
    
    if (dismissedUntil && new Date(dismissedUntil) > new Date()) {
      setDismissed(true);
      return;
    }

    if (!books) {
      setUpdateCount(0);
      return;
    }

    const parsedBooks = JSON.parse(books);
    const needsUpdate = parsedBooks.filter(book => {
      if (!book.lastUpdated) return true;
      const daysSinceUpdate = (new Date() - new Date(book.lastUpdated)) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });

    setUpdateCount(needsUpdate.length);
  };

  const handleDismiss = () => {
    setDismissed(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem('update_banner_dismissed', tomorrow.toISOString());
  };

  if (updateCount === 0 || dismissed) return null;

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <RefreshCw className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Atualizações Disponíveis</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-amber-800">
          {updateCount} {updateCount === 1 ? 'livro precisa' : 'livros precisam'} ser atualizado(s) para garantir conteúdo atualizado.
        </span>
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="outline" asChild className="bg-white">
            <Link to={createPageUrl("Settings")}>
              Ver Detalhes
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}