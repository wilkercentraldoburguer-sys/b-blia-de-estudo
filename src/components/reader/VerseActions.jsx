import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit, MessageSquare, Copy, Share2, Palette, Trash2 } from "lucide-react";

export default function VerseActions({
  position,
  verse,
  existingHighlight,
  existingNote,
  onClose,
  onHighlight,
  onRemoveHighlight,
  onAddNote,
  onShare
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState(existingNote?.note_text || "");

  const colors = [
    { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-400' },
    { name: 'Laranja', value: 'orange', class: 'bg-orange-400' },
    { name: 'Vermelho', value: 'red', class: 'bg-red-400' },
    { name: 'Azul', value: 'blue', class: 'bg-blue-400' },
    { name: 'Verde', value: 'green', class: 'bg-green-400' },
    { name: 'Roxo', value: 'purple', class: 'bg-purple-400' },
    { name: 'Rosa', value: 'pink', class: 'bg-pink-400' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(verse.text);
    onClose();
  };

  const handleSaveNote = () => {
    onAddNote(noteText);
    setShowNoteDialog(false);
    setNoteText("");
  };

  return (
    <>
      {/* Menu Flutuante */}
      <div
        className="fixed z-50 bg-card rounded-lg shadow-2xl p-2 border-2 border-primary"
        style={{
          left: `${Math.min(position.x, window.innerWidth - 250)}px`,
          top: `${Math.min(position.y, window.innerHeight - 300)}px`
        }}
      >
        {/* Botões de Ação */}
        <div className="flex gap-1 mb-2 p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex-1"
          >
            <Palette className="w-4 h-4 mr-1 text-primary" />
            Destacar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNoteDialog(true)}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-1 text-primary" />
            Anotar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-1 text-primary" />
            Copiar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-1 text-primary" />
            Compartilhar
          </Button>
        </div>

        {/* Cores de Destaque */}
        {showColorPicker && (
          <div className="p-2">
            <p className="text-xs font-semibold mb-2 text-primary">
              Escolha a cor:
            </p>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    onHighlight(color.value);
                    setShowColorPicker(false);
                  }}
                  className={`w-10 h-10 rounded-full ${color.class} hover:scale-110 transition-transform border-2 ${
                    existingHighlight?.color === color.value ? 'border-primary' : 'border-transparent'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            {existingHighlight && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveHighlight}
                className="w-full mt-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remover Destaque
              </Button>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-full mt-1 text-stone-600"
        >
          Fechar
        </Button>
      </div>

      {/* Dialog de Anotação */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">Anotação Pessoal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-lg border border-border">
              <p className="text-sm text-stone-700 italic">"{verse?.text}"</p>
            </div>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escreva sua anotação aqui..."
              className="min-h-32 border-border"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowNoteDialog(false);
                  setNoteText("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNote}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}