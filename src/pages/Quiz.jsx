import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Brain, Award, Target, CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Leaderboard from "../components/quiz/Leaderboard";
import DailyChallenge from "../components/quiz/DailyChallenge";

export default function Quiz() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: questions = [] } = useQuery({
    queryKey: ['quiz-questions'],
    queryFn: () => base44.entities.QuizQuestion.list(),
    initialData: [],
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['quiz-progress'],
    queryFn: () => base44.entities.QuizProgress.list('-created_date', 10),
    initialData: [],
    enabled: !!user,
  });

  const saveProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.QuizProgress.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quiz-progress'] }),
  });

  const levels = [
    { 
      id: 'facil', 
      name: 'Fácil', 
      icon: Target, 
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'Perguntas básicas sobre a Bíblia'
    },
    { 
      id: 'intermediario', 
      name: 'Intermediário', 
      icon: Brain, 
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Teste seu conhecimento bíblico'
    },
    { 
      id: 'dificil', 
      name: 'Difícil', 
      icon: Award, 
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: 'Para estudiosos da Palavra'
    },
    { 
      id: 'expert', 
      name: 'Expert', 
      icon: Trophy, 
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Desafio máximo de conhecimento'
    }
  ];

  const startQuiz = (levelId) => {
    const levelQuestions = questions.filter(q => q.nivel === levelId);
    if (levelQuestions.length === 0) {
      alert("Ainda não há perguntas para este nível. Em breve!");
      return;
    }
    
    const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
    setCurrentQuestions(shuffled);
    setSelectedLevel(levelId);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setUserAnswer("");
    setShowAnswer(false);
    setIsQuizComplete(false);
    setStartTime(Date.now());
  };

  const handleSubmitAnswer = () => {
    setShowAnswer(true);
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.resposta.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setShowAnswer(false);
    } else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const finalScore = showAnswer && isCorrect ? score + 10 : score;
      const finalCorrect = showAnswer && isCorrect ? correctAnswers + 1 : correctAnswers;
      
      saveProgressMutation.mutate({
        nivel: selectedLevel,
        pontuacao: finalScore,
        total_perguntas: currentQuestions.length,
        acertos: finalCorrect,
        tempo_gasto: timeSpent
      });
      setIsQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setSelectedLevel(null);
    setCurrentQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setShowAnswer(false);
    setScore(0);
    setCorrectAnswers(0);
    setIsQuizComplete(false);
  };

  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 pt-4">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-6">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Quiz Bíblico
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Teste e aprimore seu conhecimento com perguntas em 4 níveis de dificuldade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {levels.map((level) => {
              const Icon = level.icon;
              const levelQuestions = questions.filter(q => q.nivel === level.id);
              return (
                <Card 
                  key={level.id} 
                  className="hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border-2 group overflow-hidden relative"
                  onClick={() => startQuiz(level.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className={`text-2xl sm:text-3xl ${level.textColor} mb-2`}>
                          {level.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600">{level.description}</p>
                      </div>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${level.textColor} font-semibold px-3 py-1`}>
                        {levelQuestions.length} perguntas
                      </Badge>
                      <Button className={`bg-gradient-to-r ${level.color} text-white shadow-lg hover:shadow-xl transition-all group-hover:scale-105`}>
                        Começar Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Tabs defaultValue="jogar" className="mt-12">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="jogar">Jogar</TabsTrigger>
              <TabsTrigger value="desafios">Desafios</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
            </TabsList>

            <TabsContent value="jogar">
              {progress.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Seu Progresso Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {progress.slice(0, 5).map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
                          <div>
                            <p className="font-semibold capitalize">{p.nivel}</p>
                            <p className="text-sm text-slate-600">
                              {p.acertos}/{p.total_perguntas} acertos ({Math.round((p.acertos/p.total_perguntas)*100)}%)
                            </p>
                          </div>
                          <Badge variant="outline" className="text-lg font-bold">
                            {p.pontuacao} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="desafios">
              <DailyChallenge 
                user={user}
                onStartChallenge={(challenge) => {
                  // Implementar lógica de iniciar desafio
                  alert('Função de desafios em desenvolvimento!');
                }}
              />
            </TabsContent>

            <TabsContent value="ranking">
              <Leaderboard currentUser={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
    const currentLevel = levels.find(l => l.id === selectedLevel);
    const timeMinutes = Math.floor((Date.now() - startTime) / 60000);
    const timeSeconds = Math.floor(((Date.now() - startTime) % 60000) / 1000);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-2xl border-2">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <Trophy className="w-20 h-20 mx-auto mb-4 animate-bounce" />
              <CardTitle className="text-3xl">Quiz Completo!</CardTitle>
              <p className="text-blue-100 mt-2">Nível: {currentLevel.name}</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <p className="text-4xl font-bold text-blue-900 mb-1">{score}</p>
                  <p className="text-sm text-blue-700 font-semibold">Pontos</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <p className="text-4xl font-bold text-green-900 mb-1">{percentage}%</p>
                  <p className="text-sm text-green-700 font-semibold">Acertos</p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-sm text-slate-600 mb-2">Desempenho</p>
                <Progress value={percentage} className="h-3" />
                <p className="text-xs text-slate-500 mt-1">
                  {correctAnswers} de {currentQuestions.length} corretas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-600">Tempo gasto</p>
                  <p className="font-bold text-slate-800">{timeMinutes}:{timeSeconds.toString().padStart(2, '0')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-slate-600">Média por questão</p>
                  <p className="font-bold text-slate-800">
                    {Math.round((Date.now() - startTime) / currentQuestions.length / 1000)}s
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl bg-gradient-to-r ${currentLevel.color} text-white`}>
                <p className="text-xl font-bold">
                  {percentage >= 80 ? "🎉 Excelente!" : 
                   percentage >= 60 ? "👏 Muito bom!" : 
                   percentage >= 40 ? "👍 Bom trabalho!" : "📖 Continue estudando!"}
                </p>
                <p className="text-sm mt-1 text-white/90">
                  {percentage >= 80 ? "Você domina este nível!" : 
                   percentage >= 60 ? "Bom conhecimento bíblico!" : 
                   percentage >= 40 ? "Continue praticando!" : "A prática leva à perfeição!"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => startQuiz(selectedLevel)} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg">
                  Jogar Novamente
                </Button>
                <Button onClick={resetQuiz} variant="outline" className="flex-1 hover:bg-slate-100">
                  Escolher Nível
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const currentLevel = levels.find(l => l.id === selectedLevel);
  const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.resposta.toLowerCase().trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Badge className={`${currentLevel.bgColor} ${currentLevel.textColor} text-lg px-4 py-2`}>
            Nível {currentLevel.name}
          </Badge>
          <div className="text-right">
            <p className="text-sm text-slate-600">Pontuação</p>
            <p className="text-2xl font-bold text-blue-900">{score}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                Pergunta {currentQuestionIndex + 1} de {currentQuestions.length}
              </p>
              <Progress value={(currentQuestionIndex / currentQuestions.length) * 100} className="w-32 h-2" />
            </div>
            <CardTitle className="text-xl">{currentQuestion.pergunta}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showAnswer ? (
              <>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmitAnswer()}
                  placeholder="Digite sua resposta..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={!userAnswer.trim()}
                  className="w-full bg-blue-900 hover:bg-blue-800"
                >
                  Responder
                </Button>
              </>
            ) : (
              <>
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <p className={`font-semibold text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correto! Parabéns!' : 'Ops! Resposta Incorreta'}
                    </p>
                  </div>
                  
                  {!isCorrect && (
                    <div className="mb-3 p-3 bg-white rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Sua resposta:</p>
                      <p className="text-slate-800 font-medium">{userAnswer}</p>
                    </div>
                  )}
                  
                  <div className="p-3 bg-white rounded-lg mb-3">
                    <p className="text-sm text-slate-600 mb-1">Resposta correta:</p>
                    <p className="text-slate-800 font-bold text-lg">{currentQuestion.resposta}</p>
                  </div>
                  
                  {currentQuestion.referencia_biblica && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Referência Bíblica</p>
                        <p className="text-sm text-blue-700">{currentQuestion.referencia_biblica}</p>
                        {!isCorrect && (
                          <p className="text-xs text-blue-600 mt-2 italic">
                            💡 Leia esta passagem para aprender mais sobre o tema
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleNextQuestion}
                  className="w-full bg-blue-900 hover:bg-blue-800"
                >
                  {currentQuestionIndex + 1 < currentQuestions.length ? 'Próxima Pergunta' : 'Ver Resultado'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button onClick={resetQuiz} variant="outline">
            Sair do Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}