import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Crown, Medal, TrendingUp } from "lucide-react";

export default function Leaderboard({ currentUser }) {
  const [timeframe, setTimeframe] = useState("geral");

  const { data: allProgress = [] } = useQuery({
    queryKey: ['all-quiz-progress'],
    queryFn: async () => {
      const progress = await base44.entities.QuizProgress.list('-pontuacao', 100);
      return progress;
    },
    initialData: [],
  });

  const getTopPlayers = () => {
    const playerStats = {};
    
    allProgress.forEach(p => {
      if (!playerStats[p.created_by]) {
        playerStats[p.created_by] = {
          email: p.created_by,
          totalPontos: 0,
          totalAcertos: 0,
          totalPerguntas: 0,
          quizCompletos: 0
        };
      }
      
      playerStats[p.created_by].totalPontos += p.pontuacao || 0;
      playerStats[p.created_by].totalAcertos += p.acertos || 0;
      playerStats[p.created_by].totalPerguntas += p.total_perguntas || 0;
      playerStats[p.created_by].quizCompletos += 1;
    });

    return Object.values(playerStats)
      .sort((a, b) => b.totalPontos - a.totalPontos)
      .slice(0, 10);
  };

  const topPlayers = getTopPlayers();
  const userRank = topPlayers.findIndex(p => p.email === currentUser?.email) + 1;

  const getMedalIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-slate-600">{index + 1}</span>;
  };

  return (
    <Card className="shadow-xl border-2">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Ranking de Campeões
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="mensal">Este Mês</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-2">
            {topPlayers.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhum jogador ainda. Seja o primeiro!</p>
            ) : (
              <>
                {topPlayers.map((player, index) => {
                  const isCurrentUser = player.email === currentUser?.email;
                  const accuracy = player.totalPerguntas > 0 
                    ? Math.round((player.totalAcertos / player.totalPerguntas) * 100) 
                    : 0;

                  return (
                    <div
                      key={player.email}
                      className={`p-4 rounded-xl transition-all ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300' 
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            {getMedalIcon(index)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${isCurrentUser ? 'text-blue-900' : 'text-slate-800'}`}>
                              {player.email.split('@')[0]}
                              {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(Você)</span>}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                              <span>{player.quizCompletos} quiz</span>
                              <span>•</span>
                              <span>{accuracy}% acertos</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-2xl font-bold text-slate-800">{player.totalPontos}</p>
                          <p className="text-xs text-slate-500">pontos</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </TabsContent>

          <TabsContent value="mensal">
            <p className="text-center text-slate-500 py-8">Ranking mensal em breve!</p>
          </TabsContent>
        </Tabs>

        {userRank > 0 && userRank > 10 && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900">Sua Posição: #{userRank}</p>
              </div>
              <Badge className="bg-blue-600">Continue jogando!</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}