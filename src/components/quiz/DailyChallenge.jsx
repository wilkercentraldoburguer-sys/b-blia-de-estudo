import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Target, Users, Trophy, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DailyChallenge({ user, onStartChallenge }) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: todayChallenge } = useQuery({
    queryKey: ['daily-challenge', today],
    queryFn: async () => {
      const challenges = await base44.entities.DailyChallenge.filter({ 
        data: today,
        tipo: 'diario',
        ativo: true 
      });
      return challenges[0] || null;
    },
  });

  const { data: weeklyChallenge } = useQuery({
    queryKey: ['weekly-challenge'],
    queryFn: async () => {
      const challenges = await base44.entities.DailyChallenge.filter({ 
        tipo: 'semanal',
        ativo: true 
      });
      return challenges[0] || null;
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data) => base44.entities.DailyChallenge.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily-challenge'] }),
  });

  const hasCompletedToday = todayChallenge?.participantes?.some(
    p => p.email === user?.email && p.concluido
  );

  const getUserScore = (challenge) => {
    if (!challenge || !user) return null;
    return challenge.participantes?.find(p => p.email === user.email);
  };

  const getTopScore = (challenge) => {
    if (!challenge || !challenge.participantes || challenge.participantes.length === 0) return 0;
    return Math.max(...challenge.participantes.map(p => p.pontuacao || 0));
  };

  const getLevelColor = (nivel) => {
    const colors = {
      facil: 'bg-gradient-to-r from-green-400 to-green-600',
      intermediario: 'bg-primary',
      dificil: 'bg-gradient-to-r from-orange-400 to-orange-600',
      expert: 'bg-brand-clay'
    };
    return colors[nivel] || 'bg-secondary';
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Desafio Diário */}
      <Card className="border-2 hover:shadow-xl transition-all">
        <CardHeader className={`${getLevelColor(todayChallenge?.nivel)} text-white rounded-t-lg`}>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Desafio Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {todayChallenge ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-700">Nível:</span>
                </div>
                <Badge className={`${getLevelColor(todayChallenge.nivel)} text-white`}>
                  {todayChallenge.nivel.charAt(0).toUpperCase() + todayChallenge.nivel.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-600" />
                  <span className="text-sm text-slate-700">Participantes</span>
                </div>
                <span className="font-bold text-slate-800">{todayChallenge.participantes?.length || 0}</span>
              </div>

              {hasCompletedToday ? (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-800 font-semibold">✅ Concluído!</p>
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-700">
                    Sua pontuação: <span className="font-bold">{getUserScore(todayChallenge)?.pontuacao}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Melhor pontuação: {getTopScore(todayChallenge)}
                  </p>
                </div>
              ) : (
                <Button
                  onClick={() => onStartChallenge(todayChallenge)}
                  className={`w-full ${getLevelColor(todayChallenge.nivel)} text-white shadow-lg hover:shadow-xl`}
                >
                  Iniciar Desafio
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Novo desafio em breve!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desafio Semanal */}
      <Card className="border-2 hover:shadow-xl transition-all">
        <CardHeader className="bg-primary text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Desafio Semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {weeklyChallenge ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-700">Nível:</span>
                </div>
                <Badge className="bg-primary text-white">
                  {weeklyChallenge.nivel.charAt(0).toUpperCase() + weeklyChallenge.nivel.slice(1)}
                </Badge>
              </div>

              <div className="p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-700">Recompensa Extra</span>
                  <span className="text-lg font-bold text-accent">+50 pontos</span>
                </div>
              </div>

              <Button
                onClick={() => onStartChallenge(weeklyChallenge)}
                className="w-full bg-primary text-white shadow-lg hover:shadow-xl"
              >
                Participar do Desafio
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Novo desafio semanal em breve!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}