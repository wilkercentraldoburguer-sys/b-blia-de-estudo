import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function WeeklyChallenge({ completedStudies, user }) {
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    generateWeeklyChallenge();
  }, [completedStudies]);

  const generateWeeklyChallenge = () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const storedChallenge = localStorage.getItem(`weekly_challenge_${startOfWeek.toISOString().split('T')[0]}`);
    
    if (storedChallenge) {
      setChallenge(JSON.parse(storedChallenge));
      return;
    }

    // Gerar novo desafio baseado em estudos concluídos
    const challengeTypes = [
      {
        type: "estudos",
        title: "Mestre dos Estudos",
        description: "Complete 3 estudos bíblicos esta semana",
        goal: 3,
        icon: "📚"
      },
      {
        type: "quiz",
        title: "Campeão dos Quizzes",
        description: "Acerte 80% em 5 quizzes diferentes",
        goal: 5,
        icon: "🎯"
      },
      {
        type: "leitura",
        title: "Leitor Devoto",
        description: "Leia 7 capítulos diferentes da Bíblia",
        goal: 7,
        icon: "📖"
      }
    ];

    const randomChallenge = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    const newChallenge = {
      ...randomChallenge,
      progress: 0,
      startDate: startOfWeek.toISOString(),
      completed: false
    };

    localStorage.setItem(
      `weekly_challenge_${startOfWeek.toISOString().split('T')[0]}`,
      JSON.stringify(newChallenge)
    );
    
    setChallenge(newChallenge);
  };

  if (!challenge) return null;

  const progressPercentage = Math.min((challenge.progress / challenge.goal) * 100, 100);
  const isCompleted = challenge.progress >= challenge.goal;

  return (
    <Card className="border-2 bg-gradient-to-br from-amber-50 to-stone-50" style={{ borderColor: '#722f37' }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: '#722f37' }} />
            Desafio Semanal
          </div>
          {isCompleted ? (
            <Badge className="bg-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Completo!
            </Badge>
          ) : (
            <Badge style={{ backgroundColor: '#722f37' }}>
              Ativo
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{challenge.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800">{challenge.title}</h3>
            <p className="text-sm text-stone-600">{challenge.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-600">Progresso</span>
            <span className="font-semibold text-stone-800">
              {challenge.progress} / {challenge.goal}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {isCompleted ? (
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-center">
            <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-green-800">
              Parabéns! Você completou o desafio desta semana! 🎉
            </p>
          </div>
        ) : (
          <Link to={createPageUrl('Study')}>
            <Button className="w-full text-white" style={{ backgroundColor: '#722f37' }}>
              <Target className="w-4 h-4 mr-2" />
              Continuar Desafio
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}