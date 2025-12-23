import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function ImmersiveMode({ verses, currentBook, currentChapter, onExit, fontSize, theme }) {
  const [backgroundImage] = useState(() => {
    const images = [
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', // oceano
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', // floresta
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80', // água
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', // montanha
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', // praia
    ];
    return images[Math.floor(Math.random() * images.length)];
  });

  const fontSizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl",
    xlarge: "text-3xl"
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Botão de Saída Discreto */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onExit}
        className="fixed top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Conteúdo Centralizado */}
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            {currentBook} {currentChapter}
          </h1>
          <div className="w-24 h-1 bg-amber-400 mx-auto"></div>
        </div>

        <div className={`space-y-8 ${fontSizeClasses[fontSize]}`}>
          {verses.map((verse, index) => (
            <div key={index} className="text-white text-center leading-relaxed">
              <span className="font-bold text-amber-400 mr-3">{index + 1}</span>
              <span className="text-white">{verse.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-amber-400 text-sm italic">
            "Lâmpada para os meus pés é a tua palavra<br />
            e luz, para o meu caminho."<br />
            <span className="text-xs text-white/70">Salmos 119:105</span>
          </p>
        </div>
      </div>
    </div>
  );
}