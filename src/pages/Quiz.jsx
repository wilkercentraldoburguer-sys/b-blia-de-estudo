import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Brain, Award, Target, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
      saveProgressMutation.mutate({
        nivel: selectedLevel,
        pontuacao: score,
        total_perguntas: currentQuestions.length,
        acertos: correctAnswers,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              Quiz Bíblico
            </h1>
            <p className="text-lg text-slate-600">
              Teste seu conhecimento com 200 perguntas em 4 níveis de dificuldade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {levels.map((level) => {
              const Icon = level.icon;
              const levelQuestions = questions.filter(q => q.nivel === level.id);
              return (
                <Card 
                  key={level.id} 
                  className={`${level.bgColor} border-2 hover:shadow-xl transition-all cursor-pointer`}
                  onClick={() => startQuiz(level.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className={`text-2xl ${level.textColor}`}>
                          {level.name}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-2">{level.description}</p>
                      </div>
                      <Icon className={`w-12 h-12 ${level.textColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={level.textColor}>
                        {levelQuestions.length} perguntas
                      </Badge>
                      <Button className={`bg-gradient-to-r ${level.color} text-white`}>
                        Começar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {progress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Seu Progresso Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progress.slice(0, 5).map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold capitalize">{p.nivel}</p>
                        <p className="text-sm text-slate-600">
                          {p.acertos}/{p.total_perguntas} acertos
                        </p>
                      </div>
                      <Badge variant="outline" className="text-lg">
                        {p.pontuacao} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
    const currentLevel = levels.find(l => l.id === selectedLevel);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
              <CardTitle className="text-3xl">Quiz Completo!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-5xl font-bold text-blue-900 mb-2">{score} pontos</p>
                <p className="text-lg text-slate-600">
                  {correctAnswers} de {currentQuestions.length} corretas ({percentage}%)
                </p>
              </div>

              <Progress value={percentage} className="h-4" />

              <div className={`p-4 rounded-lg ${currentLevel.bgColor}`}>
                <p className="text-lg font-semibold">
                  {percentage >= 80 ? "Excelente! 🎉" : 
                   percentage >= 60 ? "Muito bom! 👏" : 
                   percentage >= 40 ? "Bom trabalho! 👍" : "Continue estudando! 📖"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => startQuiz(selectedLevel)} className="flex-1">
                  Jogar Novamente
                </Button>
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
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
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                    <p className={`font-semibold text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correto!' : 'Incorreto'}
                    </p>
                  </div>
                  <p className="text-slate-700">
                    <span className="font-semibold">Resposta correta:</span> {currentQuestion.resposta}
                  </p>
                  {currentQuestion.referencia_biblica && (
                    <p className="text-sm text-slate-600 mt-2">
                      📖 {currentQuestion.referencia_biblica}
                    </p>
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