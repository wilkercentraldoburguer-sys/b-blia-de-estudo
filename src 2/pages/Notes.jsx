import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Trash2, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notes() {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteText, setNoteText] = useState("");

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      try {
        return await base44.entities.Note.list('-created_date');
      } catch (error) {
        console.error("Error loading notes:", error);
        return [];
      }
    },
    initialData: [],
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditDialogOpen(false);
      setNoteText("");
      setSelectedNote(null);
    },
  });

  const handleEdit = (note) => {
    setSelectedNote(note);
    setNoteText(note.note_text);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedNote || !noteText.trim()) return;
    updateNoteMutation.mutate({
      id: selectedNote.id,
      data: { note_text: noteText }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Minhas Anotações</h1>
        </div>

        {notes.length === 0 ? (
          <Card className="bg-card shadow-lg">
            <CardContent className="py-12 sm:py-16 md:py-20 text-center px-4">
              <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-base sm:text-lg">
                Você ainda não tem anotações.
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm mt-2">
                Adicione reflexões e pensamentos aos versículos durante sua leitura!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-accent font-bold text-base sm:text-lg">
                          {note.book} {note.chapter}:{note.verse}
                        </CardTitle>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(note)}
                            className="text-primary hover:text-primary hover:bg-secondary h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 sm:h-10 sm:w-10"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                      <div className="bg-secondary rounded-lg p-3 sm:p-4 border-l-4 border-accent">
                        <p className="text-secondary-foreground italic text-xs sm:text-sm md:text-base break-words">
                          "{note.verse_text}"
                        </p>
                      </div>
                      <div className="pl-2 sm:pl-4">
                        <p className="text-card-foreground leading-relaxed text-sm sm:text-base break-words">
                          {note.note_text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Editar Anotação - {selectedNote?.book} {selectedNote?.chapter}:{selectedNote?.verse}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground italic">"{selectedNote?.verse_text}"</p>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escreva sua anotação aqui..."
              className="min-h-32"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}