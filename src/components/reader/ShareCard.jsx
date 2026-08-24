import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

export default function ShareCard({ verse, book, chapter, onClose }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [backgroundImage] = useState(() => {
    const images = [
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1080&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1080&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80',
    ];
    return images[Math.floor(Math.random() * images.length)];
  });

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `versiculo-${book}-${chapter}-${verse.number}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `versiculo-${book}-${chapter}-${verse.number}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${book} ${chapter}:${verse.number}`,
            text: verse.text
          });
        } else {
          handleDownload();
        }
      }, 'image/png');
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
    setIsGenerating(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary">Compartilhar Versículo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Card Preview */}
          <div
            ref={cardRef}
            className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(rgba(35, 42, 69, 0.7), rgba(35, 42, 69, 0.8)), url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="space-y-6">
                <p className="text-white text-2xl leading-relaxed font-serif">
                  "{verse.text}"
                </p>
                <div className="space-y-2">
                  <div className="w-16 h-1 bg-accent mx-auto"></div>
                  <p className="text-accent text-xl font-semibold">
                    {book} {chapter}:{verse.number}
                  </p>
                </div>
              </div>
              
              {/* Marca d'água */}
              <div className="absolute bottom-6 right-6">
                <p className="text-white/50 text-sm">@aplicativodabiblia</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Gerando...' : 'Baixar Imagem'}
            </Button>
            <Button
              onClick={handleShare}
              disabled={isGenerating}
              variant="outline"
              className="flex-1 border-primary text-primary"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}