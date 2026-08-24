import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronDown, ChevronUp, CheckCircle2, ListChecks } from "lucide-react";

function calcProgresso(passagens = []) {
  if (passagens.length === 0) return 0;
  const feitas = passagens.filter((p) => p.concluido).length;
  return Math.round((feitas / passagens.length) * 100);
}

export default function MyReadingPlans() {
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["reading-plans"],
    queryFn: () => base44.entities.ReadingPlan.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ReadingPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-plans"] });
    },
  });

  const toggleDia = (plan, index) => {
    const passagens = plan.passagens.map((p, i) =>
      i === index ? { ...p, concluido: !p.concluido } : p
    );
    const progresso = calcProgresso(passagens);
    updateMutation.mutate({
      id: plan.id,
      data: { passagens, progresso, ativo: progresso < 100 },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <ListChecks className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Você ainda não começou nenhum plano. Escolha um abaixo para começar sua jornada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const progresso = calcProgresso(plan.passagens);
        const isExpanded = expandedId === plan.id;
        const concluido = progresso === 100;

        return (
          <Card key={plan.id} className={concluido ? "border-primary/40" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {plan.nome}
                    {concluido && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </CardTitle>
                  <CardDescription>{plan.descricao}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedId(isExpanded ? null : plan.id)}
                >
                  {isExpanded ? (
                    <>
                      Ocultar dias <ChevronUp className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Ver dias <ChevronDown className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Progress value={progresso} className="flex-1" />
                <span className="text-sm font-semibold text-muted-foreground w-12 text-right">
                  {progresso}%
                </span>
              </div>

              {isExpanded && (
                <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
                  {plan.passagens.map((p, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-secondary/50"
                    >
                      <Checkbox
                        checked={!!p.concluido}
                        onCheckedChange={() => toggleDia(plan, index)}
                      />
                      <span className="text-muted-foreground w-14 shrink-0">Dia {index + 1}</span>
                      <span
                        className={p.concluido ? "line-through text-muted-foreground" : "text-foreground"}
                      >
                        {p.livro}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
