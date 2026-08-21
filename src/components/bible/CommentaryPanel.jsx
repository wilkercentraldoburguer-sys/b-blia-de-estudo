import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommentaryPanel({ book, chapter, verse, activeCommentators }) {
  const { data: commentaries = [], isLoading } = useQuery({
    queryKey: ['commentaries', book, chapter, verse],
    queryFn: async () => {
      if (!book || !chapter) return [];
      
      const filters = { livro: book, capitulo: chapter };
      if (verse) {
        filters.versiculo_inicio = verse;
      }
      
      const results = await base44.entities.Commentary.filter(filters);
      
      // Filtrar pelos comentaristas ativos
      return results.filter(c => 
        activeCommentators.includes(c.comentarista)
      );
    },
    enabled: !!book && !!chapter,
  });

  // Mesmos nomes usados em Profile.jsx/Study.jsx. Lembrete: em todo lugar
  // que exibe esses nomes, o texto é uma reflexão gerada por IA "inspirada
  // no estilo" da pessoa - nunca uma citação literal (ver aviso na UI).
  const commentatorColors = {
    "Ryrie": "bg-primary text-primary-foreground",
    "Hernandes Dias Lopes": "bg-primary text-primary-foreground",
    "Matthew Henry": "bg-primary text-primary-foreground",
    "Spurgeon": "bg-primary text-primary-foreground",
    "John Stott": "bg-primary text-primary-foreground",
    "MacArthur": "bg-primary text-primary-foreground",
    "Pastor Local": "bg-primary text-primary-foreground"
  };

  const groupedCommentaries = commentaries.reduce((acc, comm) => {
    if (!acc[comm.comentarista]) {
      acc[comm.comentarista] = [];
    }
    acc[comm.comentarista].push(comm);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (commentaries.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comentários Bíblicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Nenhum comentário disponível para este capítulo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Selecione um versículo para ver comentários específicos
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Comentários Bíblicos
          <Badge variant="outline" className="ml-auto">
            {commentaries.length} {commentaries.length === 1 ? 'comentário' : 'comentários'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={Object.keys(groupedCommentaries)[0]} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto p-2 bg-secondary">
            {Object.keys(groupedCommentaries).map((commentator) => (
              <TabsTrigger
                key={commentator}
                value={commentator}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                {commentator}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(groupedCommentaries).map(([commentator, comms]) => (
            <TabsContent key={commentator} value={commentator} className="p-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {comms.map((comm, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-secondary/40 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`px-3 py-1 rounded-full ${commentatorColors[commentator]} text-xs font-semibold`}>
                          {commentator}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {comm.livro} {comm.capitulo}:{comm.versiculo_inicio}
                          {comm.versiculo_fim && comm.versiculo_fim !== comm.versiculo_inicio &&
                            `-${comm.versiculo_fim}`}
                        </Badge>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {comm.comentario}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}