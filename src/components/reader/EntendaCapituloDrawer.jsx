import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Sparkles, Lightbulb } from "lucide-react";
import { getManualContexto, getEraInfo } from "./manualContextoData";

export default function EntendaCapituloDrawer({ open, onOpenChange, livro, capitulo }) {
  const contexto = getManualContexto(livro, capitulo);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Entenda esse capítulo
          </SheetTitle>
          <SheetDescription>
            {livro} {capitulo}
            {contexto?.titulo ? ` · ${contexto.titulo}` : ""}
          </SheetDescription>
        </SheetHeader>

        {!contexto ? (
          <div className="mt-8 text-center py-10">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Em breve. Ainda não temos contexto mapeado para {livro} {capitulo}.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="resumo" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumo" title="Resumo fácil">
                <BookOpen className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="linha" title="Linha do tempo">
                <Clock className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="quem" title="Quem é quem">
                <Users className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="destaque" title="Curiosidade/Aplicação">
                <Sparkles className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            {/* Resumo fácil */}
            <TabsContent value="resumo" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{contexto.genero}</Badge>
                <Badge variant="outline">Autor: {contexto.autor}</Badge>
              </div>
              <div className="bg-card border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">{contexto.titulo}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{contexto.resumo}</p>
              </div>
            </TabsContent>

            {/* Linha do tempo */}
            <TabsContent value="linha" className="space-y-4 mt-4">
              {(() => {
                const era = getEraInfo(contexto.era);
                if (!era) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      Linha do tempo em breve para este trecho.
                    </p>
                  );
                }
                return (
                  <div className="space-y-3">
                    {era.anterior && (
                      <div className="pl-4 border-l-2 border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Antes</p>
                        <p className="text-sm font-medium text-foreground">{era.anterior.titulo}</p>
                      </div>
                    )}
                    <div className="pl-4 border-l-2 border-primary bg-primary/5 rounded-r-lg py-2">
                      <p className="text-xs text-primary uppercase tracking-wide font-semibold">Agora</p>
                      <p className="text-sm font-semibold text-foreground">{era.atual.titulo}</p>
                      <p className="text-xs text-muted-foreground mb-1">{era.atual.periodo}</p>
                      <p className="text-sm text-muted-foreground">{era.atual.descricao}</p>
                    </div>
                    {era.proxima && (
                      <div className="pl-4 border-l-2 border-border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Depois</p>
                        <p className="text-sm font-medium text-foreground">{era.proxima.titulo}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* Quem é quem */}
            <TabsContent value="quem" className="space-y-3 mt-4">
              {contexto.personagens && contexto.personagens.length > 0 ? (
                contexto.personagens.map((p, i) => (
                  <div key={i} className="flex gap-3 bg-card border rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.contexto}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum personagem específico destacado neste trecho.
                </p>
              )}
            </TabsContent>

            {/* Curiosidade/Aplicação */}
            <TabsContent value="destaque" className="space-y-4 mt-4">
              {contexto.versiculoDestaque && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-primary uppercase tracking-wide font-semibold mb-2">
                    Versículo-chave
                  </p>
                  <p className="text-sm text-foreground italic leading-relaxed mb-2">
                    "{contexto.versiculoDestaque.texto}"
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold mb-2">
                    {contexto.versiculoDestaque.referencia}
                  </p>
                  <p className="text-sm text-muted-foreground">{contexto.versiculoDestaque.relevancia}</p>
                </div>
              )}
              {contexto.curiosidade && (
                <div className="bg-card border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                    Você sabia?
                  </p>
                  <p className="text-sm text-foreground">{contexto.curiosidade}</p>
                </div>
              )}
              {!contexto.versiculoDestaque && !contexto.curiosidade && (
                <p className="text-sm text-muted-foreground">
                  Nenhum destaque especial mapeado para este trecho ainda.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
