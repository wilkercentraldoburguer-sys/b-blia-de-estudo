import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HandHeart, BookOpen, MessageCircleHeart, Trash2, Pencil, Save, X } from "lucide-react";
import { IDENTITY_SECTIONS } from "../components/prayer/identityDeclarations";

const STORAGE_KEY = "oracoes_livres";

function loadPrayersFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function savePrayersToStorage(prayers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
  } catch (e) {
    console.error("Erro ao salvar oração:", e);
  }
}

function OrandoAPalavra() {
  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Declare essas verdades da Palavra em oração, uma a uma, com calma. Cada frase tem a referência
            bíblica ao lado — abra e leia o versículo antes ou depois de orar, pra que a declaração fique
            sempre ancorada no texto, nunca solta dele.
          </p>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["sou"]} className="w-full">
        {IDENTITY_SECTIONS.map((secao) => (
          <AccordionItem key={secao.key} value={secao.key} className="border rounded-xl px-4 mb-4 bg-card">
            <AccordionTrigger className="text-lg font-display font-semibold text-primary hover:no-underline">
              {secao.titulo}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-4">
                {secao.itens.map((item, idx) => (
                  <li key={idx} className="border-b border-border/60 last:border-0 pb-3 last:pb-0">
                    <p className="text-foreground leading-relaxed">{item.texto}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.refs.map((ref) => (
                        <Badge key={ref} variant="outline" className="text-xs font-normal text-primary border-primary/30">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {ref}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function OracaoLivre() {
  const [prayers, setPrayers] = useState([]);
  const [novaOracao, setNovaOracao] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    setPrayers(loadPrayersFromStorage());
  }, []);

  const handleSaveNew = () => {
    if (!novaOracao.trim()) return;
    const nova = {
      id: Date.now().toString(),
      texto: novaOracao.trim(),
      data: new Date().toISOString(),
    };
    const atualizadas = [nova, ...prayers];
    setPrayers(atualizadas);
    savePrayersToStorage(atualizadas);
    setNovaOracao("");
  };

  const handleDelete = (id) => {
    const atualizadas = prayers.filter((p) => p.id !== id);
    setPrayers(atualizadas);
    savePrayersToStorage(atualizadas);
  };

  const handleStartEdit = (prayer) => {
    setEditingId(prayer.id);
    setEditingText(prayer.texto);
  };

  const handleSaveEdit = (id) => {
    const atualizadas = prayers.map((p) =>
      p.id === id ? { ...p, texto: editingText.trim() } : p
    );
    setPrayers(atualizadas);
    savePrayersToStorage(atualizadas);
    setEditingId(null);
    setEditingText("");
  };

  const formatDate = (isoDate) => {
    try {
      return new Date(isoDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Escreva sua oração livremente. Fica salva aqui pra você reler e acompanhar sua caminhada.
          </p>
          <Textarea
            value={novaOracao}
            onChange={(e) => setNovaOracao(e.target.value)}
            placeholder="Escreva sua oração..."
            className="min-h-32"
          />
          <div className="flex justify-end">
            <Button onClick={handleSaveNew} disabled={!novaOracao.trim()} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Salvar Oração
            </Button>
          </div>
        </CardContent>
      </Card>

      {prayers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircleHeart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Você ainda não salvou nenhuma oração.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prayers.map((prayer) => (
            <Card key={prayer.id}>
              <CardContent className="p-4">
                {editingId === prayer.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-h-24"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(prayer.id)} className="bg-primary hover:bg-primary/90">
                        <Save className="w-4 h-4 mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-foreground whitespace-pre-line leading-relaxed">{prayer.texto}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{formatDate(prayer.data)}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStartEdit(prayer)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prayer.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Oracao() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <HandHeart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Oração</h1>
        </div>

        <Tabs defaultValue="palavra" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="palavra">Orando a Palavra</TabsTrigger>
            <TabsTrigger value="livre">Oração Livre</TabsTrigger>
          </TabsList>

          <TabsContent value="palavra">
            <OrandoAPalavra />
          </TabsContent>

          <TabsContent value="livre">
            <OracaoLivre />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
