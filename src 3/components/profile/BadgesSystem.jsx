import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, BookOpen, Brain, Flame, Target, Crown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const BADGES = [
  {
    id: "primeiro_estudo",
    title: "Primeiro Passo",
    description: "Complete seu primeiro estudo bíblico",
    icon: BookOpen,
    color: "primary",
    checkUnlock: (data) => data.completedStudies >= 1
  },
  {
    id: "estudioso",
    title: "Estudioso",
    description: "Complete 10 estudos bíblicos",
    icon: Brain,
    color: "accent",
    checkUnlock: (data) => data.completedStudies >= 10
  },
  {
    id: "mestre_estudos",
    title: "Mestre dos Estudos",
    description: "Complete 50 estudos bíblicos",
    icon: Crown,
    color: "clay",
    checkUnlock: (data) => data.completedStudies >= 50
  },
  {
    id: "leitor_diario_7",
    title: "Leitor Devoto",
    description: "Leia a Bíblia por 7 dias consecutivos",
    icon: Flame,
    color: "primary",
    checkUnlock: (data) => data.readingStreak >= 7
  },
  {
    id: "leitor_diario_30",
    title: "Chama Ardente",
    description: "Leia a Bíblia por 30 dias consecutivos",
    icon: Flame,
    color: "accent",
    checkUnlock: (data) => data.readingStreak >= 30
  },
  {
    id: "quiz_perfeito",
    title: "Mente Afiada",
    description: "Acerte 100% em qualquer quiz",
    icon: Target,
    color: "clay",
    checkUnlock: (data) => data.perfectQuizzes >= 1
  },
  {
    id: "quiz_expert",
    title: "Expert Bíblico",
    description: "Complete 20 quizzes",
    icon: Brain,
    color: "primary",
    checkUnlock: (data) => data.totalQuizzes >= 20
  },
  {
    id: "compartilhador",
    title: "Semeador",
    description: "Compartilhe 10 versículos",
    icon: Star,
    color: "accent",
    checkUnlock: (data) => data.shares >= 10
  },
  {
    id: "anotador",
    title: "Escriba",
    description: "Faça 50 anotações",
    icon: BookOpen,
    color: "clay",
    checkUnlock: (data) => data.notes >= 50
  },
  {
    id: "favoritos",
    title: "Colecionador",
    description: "Salve 100 versículos favoritos",
    icon: Award,
    color: "primary",
    checkUnlock: (data) => data.favorites >= 100
  }
];

const BADGE_COLOR_CLASSES = {
  primary: {
    tile: "bg-primary/5 border-primary/30",
    icon: "text-primary"
  },
  accent: {
    tile: "bg-accent/10 border-accent/30",
    icon: "text-accent"
  },
  clay: {
    tile: "bg-brand-clay/10 border-brand-clay/30",
    icon: "text-brand-clay"
  }
};

export default function BadgesSystem({ studies, quizProgress, notes, favorites, highlights }) {
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  useEffect(() => {
    checkBadges();
  }, [studies, quizProgress, notes, favorites, highlights]);

  const checkBadges = () => {
    const completedStudies = studies.filter(s => s.concluido).length;
    const totalQuizzes = quizProgress.length;
    
    const perfectQuizzes = quizProgress.filter(q => {
      const accuracy = q.total_perguntas > 0 ? (q.acertos / q.total_perguntas) * 100 : 0;
      return accuracy === 100;
    }).length;

    // Calcular streak de leitura (simplificado)
    const readingStreak = highlights.length > 0 ? Math.min(highlights.length, 7) : 0;

    const data = {
      completedStudies,
      totalQuizzes,
      perfectQuizzes,
      readingStreak,
      notes: notes.length,
      favorites: favorites.length,
      shares: 0 // Placeholder
    };

    const unlocked = BADGES.filter(badge => badge.checkUnlock(data));
    setUnlockedBadges(unlocked);

    // Armazenar badges desbloqueados
    localStorage.setItem('unlocked_badges', JSON.stringify(unlocked.map(b => b.id)));
  };

  const lockedBadges = BADGES.filter(badge => 
    !unlockedBadges.some(ub => ub.id === badge.id)
  );

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Conquistas
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {unlockedBadges.length}/{BADGES.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-6 pr-4">
            {/* Badges Desbloqueados */}
            {unlockedBadges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  Desbloqueados
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {unlockedBadges.map((badge) => {
                    const Icon = badge.icon;
                    const colorClasses = BADGE_COLOR_CLASSES[badge.color] || BADGE_COLOR_CLASSES.primary;
                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-lg border-2 ${colorClasses.tile}`}
                      >
                        <Icon className={`w-8 h-8 mb-2 mx-auto ${colorClasses.icon}`} />
                        <h4 className="text-sm font-bold text-center text-card-foreground mb-1">
                          {badge.title}
                        </h4>
                        <p className="text-xs text-muted-foreground text-center">
                          {badge.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badges Bloqueados */}
            {lockedBadges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Bloqueados
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {lockedBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div
                        key={badge.id}
                        className="p-4 rounded-lg border-2 border-border bg-muted opacity-60"
                      >
                        <Icon className="w-8 h-8 mb-2 mx-auto text-muted-foreground" />
                        <h4 className="text-sm font-bold text-center text-muted-foreground mb-1">
                          ???
                        </h4>
                        <p className="text-xs text-muted-foreground text-center">
                          {badge.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}