import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { createPageUrl } from "../../utils";
import { Link } from "react-router-dom";

export default function StudyHistory({ studies }) {
  const completed = studies.filter(s => s.concluido).length;
  const inProgress = studies.filter(s => !s.concluido && s.progresso > 0).length;

  return (
    <Card className="border-2" style={{ borderColor: '#722f37' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: '#722f37' }} />
          Histórico de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold" style={{ color: '#722f37' }}>{studies.length}</p>
            <p className="text-xs text-stone-600">Total</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{completed}</p>
            <p className="text-xs text-stone-600">Concluídos</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
            <p className="text-xs text-stone-600">Em Andamento</p>
          </div>
        </div>

        <div className="space-y-3">
          {studies.slice(0, 5).map((study) => (
            <Link 
              key={study.id} 
              to={`${createPageUrl('Study')}?study=${study.id}`}
              className="block"
            >
              <div className="p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800 mb-1">
                      {study.referencia}
                    </p>
                    <div className="flex gap-2 mb-2">
                      <Badge className="text-xs" style={{ backgroundColor: '#722f37' }}>
                        {study.versao}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {study.profundidade}
                      </Badge>
                    </div>
                    <Progress value={study.progresso} className="h-1" />
                  </div>
                  {study.concluido && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            </Link>
          ))}

          {studies.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-stone-500 text-sm">Nenhum estudo iniciado ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}