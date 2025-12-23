import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, CheckCircle2 } from "lucide-react";
import { createPageUrl } from "../../utils";
import { Link } from "react-router-dom";

export default function StudyBasedQuiz({ completedStudies }) {
  const studiesWithQuiz = completedStudies.filter(s => s.quiz && s.quiz.length > 0);

  return (
    <Card className="border-2" style={{ borderColor: '#722f37' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" style={{ color: '#722f37' }} />
          Quiz dos Estudos Concluídos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {studiesWithQuiz.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm mb-3">
              Complete estudos para desbloquear quizzes personalizados
            </p>
            <Link to={createPageUrl('Study')}>
              <Button size="sm" className="text-white" style={{ backgroundColor: '#722f37' }}>
                Ir para Estudos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {studiesWithQuiz.map((study) => (
              <Link 
                key={study.id}
                to={`${createPageUrl('Study')}?study=${study.id}`}
                className="block"
              >
                <div className="p-4 bg-gradient-to-r from-amber-50 to-stone-50 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800 mb-2">
                        {study.referencia}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs" style={{ backgroundColor: '#722f37' }}>
                          {study.quiz.length} perguntas
                        </Badge>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600">Estudo concluído</span>
                      </div>
                    </div>
                    <Button size="sm" className="text-white" style={{ backgroundColor: '#722f37' }}>
                      Fazer Quiz
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}