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
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Histórico de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-2xl font-bold text-primary">{studies.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-2xl font-bold text-accent">{completed}</p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </div>
          <div className="text-center p-3 bg-brand-clay/10 border border-brand-clay/30 rounded-lg">
            <p className="text-2xl font-bold text-brand-clay">{inProgress}</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </div>
        </div>

        <div className="space-y-3">
          {studies.slice(0, 5).map((study) => (
            <Link
              key={study.id}
              to={`${createPageUrl('Study')}?study=${study.id}`}
              className="block"
            >
              <div className="p-3 bg-secondary rounded-lg hover:bg-secondary/70 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-card-foreground mb-1">
                      {study.referencia}
                    </p>
                    <div className="flex gap-2 mb-2">
                      <Badge className="text-xs bg-primary text-primary-foreground">
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
              <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhum estudo iniciado ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}