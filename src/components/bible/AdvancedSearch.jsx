import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, BookOpen, MessageSquare, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

export default function AdvancedSearch({ open, onOpenChange, onSelectVerse }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [verseResults, setVerseResults] = useState([]);
  const [commentaryResults, setCommentaryResults] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.length < 3) return;

    setIsSearching(true);
    
    try {
      // Buscar nos comentários
      const prompt = `Busque comentários bíblicos que contenham ou sejam relacionados a: "${searchTerm}".
Retorne até 5 resultados mais relevantes.

JSON:
{
  "results": [
    {
      "comentarista": "nome",
      "livro": "livro",
      "capitulo": número,
      "versiculo": número,
      "trecho": "trecho relevante do comentário (max 200 chars)",
      "relevancia": "alta/media/baixa"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  comentarista: { type: "string" },
                  livro: { type: "string" },
                  capitulo: { type: "integer" },
                  versiculo: { type: "integer" },
                  trecho: { type: "string" },
                  relevancia: { type: "string" }
                }
              }
            }
          }
        }
      });

      setCommentaryResults(response.results || []);

      // Buscar versículos
      const versePrompt = `Encontre versículos bíblicos relacionados a: "${searchTerm}".
Retorne até 5 versículos mais relevantes com seus textos.

JSON:
{
  "verses": [
    {
      "livro": "livro",
      "capitulo": número,
      "versiculo": número,
      "texto": "texto do versículo"
    }
  ]
}`;

      const verseResponse = await base44.integrations.Core.InvokeLLM({
        prompt: versePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            verses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  livro: { type: "string" },
                  capitulo: { type: "integer" },
                  versiculo: { type: "integer" },
                  texto: { type: "string" }
                }
              }
            }
          }
        }
      });

      setVerseResults(verseResponse.verses || []);
    } catch (error) {
      console.error("Erro na busca:", error);
    }
    
    setIsSearching(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setVerseResults([]);
    setCommentaryResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Busca Avançada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar versículos ou temas nos comentários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || searchTerm.length < 3}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="text-xs text-slate-500">Digite pelo menos 3 caracteres para buscar</p>
          )}

          {(verseResults.length > 0 || commentaryResults.length > 0) && (
            <Tabs defaultValue="verses" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="verses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Versículos ({verseResults.length})
                </TabsTrigger>
                <TabsTrigger value="commentaries" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comentários ({commentaryResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="verses">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {verseResults.map((verse, idx) => (
                      <Card
                        key={idx}
                        className="p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          onSelectVerse(verse.livro, verse.capitulo, verse.versiculo);
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <Badge className="mb-2 bg-blue-600">
                              {verse.livro} {verse.capitulo}:{verse.versiculo}
                            </Badge>
                            <p className="text-slate-700 leading-relaxed">
                              {verse.texto}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="commentaries">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {commentaryResults.map((comment, idx) => (
                      <Card
                        key={idx}
                        className="p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          onSelectVerse(comment.livro, comment.capitulo, comment.versiculo);
                          onOpenChange(false);
                        }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {comment.livro} {comment.capitulo}:{comment.versiculo}
                            </Badge>
                            <Badge className="bg-purple-600">
                              {comment.comentarista}
                            </Badge>
                            {comment.relevancia === 'alta' && (
                              <Badge className="bg-green-600 text-xs">Alta relevância</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 italic">
                            {comment.trecho}...
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}

          {!isSearching && searchTerm.length >= 3 && verseResults.length === 0 && commentaryResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">Nenhum resultado encontrado</p>
              <p className="text-sm text-slate-400 mt-1">Tente usar termos diferentes</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}