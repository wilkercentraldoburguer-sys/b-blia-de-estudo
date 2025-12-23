import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function QuizPerformance({ quizProgress, biblicalStudies }) {
  const totalQuizzes = quizProgress.length;
  
  const totalAcertos = quizProgress.reduce((acc, q) => acc + (q.acertos || 0), 0);
  const totalPerguntas = quizProgress.reduce((acc, q) => acc + (q.total_perguntas || 0), 0);
  const accuracyRate = totalPerguntas > 0 ? Math.round((totalAcertos / totalPerguntas) * 100) : 0;

  const avgPontuacao = totalQuizzes > 0
    ? Math.round(quizProgress.reduce((acc, q) => acc + (q.pontuacao || 0), 0) / totalQuizzes)
    : 0;

  // Performance por nível
  const niveis = {
    facil: { total: 0, acertos: 0, perguntas: 0 },
    intermediario: { total: 0, acertos: 0, perguntas: 0 },
    dificil: { total: 0, acertos: 0, perguntas: 0 },
    expert: { total: 0, acertos: 0, perguntas: 0 }
  };

  quizProgress.forEach(q => {
    if (q.nivel && niveis[q.nivel]) {
      niveis[q.nivel].total++;
      niveis[q.nivel].acertos += q.acertos || 0;
      niveis[q.nivel].perguntas += q.total_perguntas || 0;
    }
  });

  const nivelData = Object.entries(niveis)
    .filter(([_, data]) => data.total > 0)
    .map(([nivel, data]) => ({
      nivel,
      accuracy: data.perguntas > 0 ? Math.round((data.acertos / data.perguntas) * 100) : 0,
      total: data.total
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <Card className="border-2" style={{ borderColor: '#722f37' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" style={{ color: '#722f37' }} />
          Performance nos Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalQuizzes === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-stone-500 text-sm">
              Complete quizzes para ver sua performance
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-2xl font-bold text-blue-900">{totalQuizzes}</p>
                <p className="text-xs text-blue-700">Quizzes</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-2xl font-bold text-green-900">{accuracyRate}%</p>
                <p className="text-xs text-green-700">Acertos</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                <p className="text-2xl font-bold text-amber-900">{avgPontuacao}</p>
                <p className="text-xs text-amber-700">Média Pts</p>
              </div>
            </div>

            {/* Performance por Nível */}
            {nivelData.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Por Nível de Dificuldade
                </h3>
                {nivelData.map(({ nivel, accuracy, total }) => (
                  <div key={nivel} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="capitalize text-xs"
                          style={{ borderColor: '#722f37', color: '#722f37' }}
                        >
                          {nivel}
                        </Badge>
                        <span className="text-xs text-stone-600">{total} quiz(zes)</span>
                      </div>
                      <span className="text-sm font-semibold text-stone-800">
                        {accuracy}%
                      </span>
                    </div>
                    <Progress value={accuracy} className="h-1.5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}