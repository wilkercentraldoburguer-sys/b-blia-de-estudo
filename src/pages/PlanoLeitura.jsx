import React, { useState } from "react";
import { CalendarCheck, Sparkles } from "lucide-react";
import PredefinedPlansLibrary from "../components/reading/PredefinedPlansLibrary";
import MyReadingPlans from "../components/reading/MyReadingPlans";
import { Card, CardContent } from "@/components/ui/card";

// Temas do curso da Casa de Discípulos / RHEMA (capa do material físico).
// Ainda não têm conteúdo próprio no app - ficam aqui como sub-abas
// reservadas para quando esse conteúdo for adicionado no futuro.
const RHEMA_THEMES = [
  "Fundamentos da Fé",
  "Justiça de Deus",
  "Oração que Prevalece",
  "Aliança de Sangue",
  "Submissão e Autoridade",
  "Como Ser Guiado pelo Espírito",
  "Vida de Louvor",
  "Família Cristã",
  "Caráter de Deus",
  "O Livro de Atos",
  "História da Igreja",
  "Ministério Prático",
  "Realidades da Nova Criação",
  "Autoridade do Crente",
  "Doutrinas Básicas da Bíblia",
  "Cristo, Aquele Que Cura",
  "Fruto do Espírito",
  "Manifestações do Espírito",
  "Evangelismo",
  "Gálatas",
  "Vida de Prosperidade",
  "Unção",
  "Escatologia"
];

// Paleta de cores da marca "Vigília" (ver tailwind.config.js), em rodízio,
// pra dar a cada chip de tema uma cor diferente sem sair da identidade
// visual do app.
const PILL_COLORS = [
  "bg-brand-clay/15 text-brand-clay border-brand-clay/30 hover:bg-brand-clay/25",
  "bg-brand-amber/15 text-brand-amber border-brand-amber/30 hover:bg-brand-amber/25",
  "bg-primary/15 text-primary border-primary/30 hover:bg-primary/25",
  "bg-accent/15 text-accent-foreground border-accent/30 hover:bg-accent/25",
  "bg-brand-night-light/15 text-brand-night-light border-brand-night-light/30 hover:bg-brand-night-light/25"
];

const BIBLICOS_TAB = "__planos_biblicos__";

export default function PlanoLeitura() {
  const [activeTab, setActiveTab] = useState(BIBLICOS_TAB);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="bg-brand-night">
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-brand-amber/15 border border-brand-amber/40 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold text-brand-bone leading-tight">
                Plano de Leitura
              </h1>
              <p className="text-sm text-brand-bone/60">
                Planos guiados para mergulhar na Palavra, no seu ritmo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Sub-abas: Planos Bíblicos (conteúdo real) + temas reservados */}
        <div className="flex gap-2 overflow-x-auto py-4 -mx-1 px-1">
          <button
            onClick={() => setActiveTab(BIBLICOS_TAB)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              activeTab === BIBLICOS_TAB
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/70"
            }`}
          >
            Planos Bíblicos
          </button>
          {RHEMA_THEMES.map((theme, i) => (
            <button
              key={theme}
              onClick={() => setActiveTab(theme)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                activeTab === theme
                  ? "bg-primary text-primary-foreground border-primary"
                  : PILL_COLORS[i % PILL_COLORS.length]
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {activeTab === BIBLICOS_TAB ? (
          <div className="space-y-8 pb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">Meus Planos</h2>
              <MyReadingPlans />
            </div>

            <div className="border-t pt-6">
              <PredefinedPlansLibrary />
            </div>
          </div>
        ) : (
          <Card className="border-dashed mb-6">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">{activeTab}</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Conteúdo em breve. Este tema ainda não tem um plano de leitura próprio -
                em breve vamos adicionar estudos e leituras dedicados a ele.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
