import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, Lightbulb, Calendar, GitCompare, Link2, 
  Brain, Heart, MessageCircle, CheckCircle2, Share2 
} from "lucide-react";

export default function StudyViewer({ study, onUpdateProgress, onComplete }) {
  const [activeTab, setActiveTab] = useState("contexto");
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const tabs = [
    { value: "contexto", label: "Contexto", icon: BookOpen },
    { value: "explicacao", label: "Explicação", icon: Lightbulb },
    { value: "aplicacao", label: "Aplicação Hoje", icon: Calendar },
    { value: "comparacao", label: "Visões", icon: GitCompare },
    { value: "versoes", label: "Versões", icon: GitCompare },
    { value: "referencias", label: "Referências", icon: Link2 },
    { value: "quiz", label: "Quiz", icon: Brain },
    { value: "reflexao", label: "Reflexão", icon: Heart },
    { value: "oracao", label: "Oração", icon: MessageCircle }
  ];

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers({ ...quizAnswers, [questionIndex]: answerIndex });
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const correct = study.quiz.filter((q, i) => quizAnswers[i] === q.resposta_correta).length;
    const percentage = (correct / study.quiz.length) * 100;
    
    if (percentage >= 70 && onUpdateProgress) {
      onUpdateProgress(100);
      if (onComplete) onComplete();
    }
  };

  const getQuizScore = () => {
    const correct = study.quiz.filter((q, i) => quizAnswers[i] === q.resposta_correta).length;
    return { correct, total: study.quiz.length };
  };

  return (
    <div className="space-y-6">
      {/* Header do Estudo */}
      <Card className="border-2" style={{ borderColor: '#722f37' }}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-stone-800 mb-2">
                {study.referencia}
              </h2>
              <div className="flex gap-2 flex-wrap">
                <Badge style={{ backgroundColor: '#722f37' }} className="text-white">
                  {study.versao}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {study.profundidade}
                </Badge>
                {study.concluido && (
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-stone-600 mb-1">
                  <span>Progresso</span>
                  <span>{study.progresso}%</span>
                </div>
                <Progress value={study.progresso} className="h-2" />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs do Estudo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="text-xs gap-1"
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="contexto" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: '#722f37' }} />
                Contexto Histórico e Literário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {study.contexto}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explicacao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" style={{ color: '#722f37' }} />
                Explicação Detalhada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {study.explicacao}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aplicacao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: '#722f37' }} />
                Aplicação Prática Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {study.aplicacao_pratica}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparacao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="w-5 h-5" style={{ color: '#722f37' }} />
                Visão Bíblica vs Visão Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {study.comparacao_visoes}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versoes" className="mt-6">
          <div className="space-y-4">
            {study.comparacao_versoes?.map((versao, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Badge style={{ backgroundColor: '#722f37' }} className="text-white">
                      {versao.versao}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-700">{versao.diferenca_chave}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="referencias" className="mt-6">
          <div className="space-y-4">
            {study.referencias_estudo?.map((ref, idx) => (
              <Card key={idx} className="border-l-4" style={{ borderLeftColor: '#722f37' }}>
                <CardContent className="pt-4">
                  <p className="font-semibold text-stone-800 mb-2">{ref.referencia}</p>
                  <p className="text-stone-600 text-sm">{ref.relacao}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: '#722f37' }} />
                Teste seu conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {study.quiz?.map((question, qIdx) => (
                <div key={qIdx} className="p-4 bg-stone-50 rounded-lg">
                  <p className="font-semibold text-stone-800 mb-3">
                    {qIdx + 1}. {question.pergunta}
                  </p>
                  <div className="space-y-2">
                    {question.opcoes.map((opcao, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = question.resposta_correta === oIdx;
                      const showResult = quizSubmitted;
                      
                      return (
                        <button
                          key={oIdx}
                          onClick={() => !quizSubmitted && handleQuizAnswer(qIdx, oIdx)}
                          disabled={quizSubmitted}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            showResult && isCorrect
                              ? 'bg-green-100 border-green-600'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-red-100 border-red-600'
                              : isSelected
                              ? 'bg-blue-100 border-blue-600'
                              : 'bg-white border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          {opcao}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Explicação:</strong> {question.explicacao}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {!quizSubmitted ? (
                <Button
                  onClick={submitQuiz}
                  disabled={Object.keys(quizAnswers).length < study.quiz?.length}
                  className="w-full text-white"
                  style={{ backgroundColor: '#722f37' }}
                >
                  Enviar Respostas
                </Button>
              ) : (
                <Card className="bg-gradient-to-r from-amber-50 to-stone-50">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-stone-800 mb-2">
                        {getQuizScore().correct} / {getQuizScore().total}
                      </p>
                      <p className="text-stone-600">
                        {getQuizScore().correct / getQuizScore().total >= 0.7
                          ? "Parabéns! Você dominou o conteúdo! 🎉"
                          : "Continue estudando para melhorar! 📚"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reflexao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: '#722f37' }} />
                Reflexão Pessoal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {study.reflexao}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oracao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" style={{ color: '#722f37' }} />
                Oração Guiada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg">
                <p className="text-stone-700 leading-relaxed whitespace-pre-line italic">
                  {study.oracao}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rodapé Espiritual */}
      <Card className="bg-amber-50 border-2 border-amber-300">
        <CardContent className="pt-4">
          <p className="text-sm text-stone-700 italic text-center">
            "Este estudo é uma ferramenta. O Espírito Santo é o Mestre.<br />
            Ore, leia a Palavra e confirme com sua comunidade de fé."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}