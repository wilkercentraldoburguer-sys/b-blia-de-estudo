import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Target, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PredefinedPlansLibrary({ onPlanCreated }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.ReadingPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-plans'] });
      setDialogOpen(false);
      if (onPlanCreated) onPlanCreated();
    },
  });

  const predefinedPlans = [
    {
      id: 'novo_testamento_90',
      nome: 'Novo Testamento em 90 Dias',
      descricao: 'Complete todo o Novo Testamento em 3 meses',
      duracao: 90,
      icon: BookOpen,
      color: 'from-primary to-brand-night-light',
      recomendado: 'Iniciantes ou foco no Novo Testamento',
      categoria: 'popular'
    },
    {
      id: 'biblia_1_ano',
      nome: 'Bíblia Completa em 1 Ano',
      descricao: 'Leia toda a Bíblia de capa a capa em ordem sequencial',
      duracao: 365,
      icon: Calendar,
      color: 'from-accent to-brand-clay',
      recomendado: 'Visão geral completa com tempo para meditação',
      categoria: 'popular'
    },
    {
      id: 'biblia_misto_1_ano',
      nome: 'Bíblia em 1 Ano (Misto)',
      descricao: 'Alterna Antigo e Novo Testamento para experiência equilibrada',
      duracao: 365,
      icon: Target,
      color: 'from-brand-clay to-primary',
      recomendado: 'Leitura dinâmica e variada',
      categoria: 'popular'
    },
    {
      id: 'biblia_180_dias',
      nome: 'Bíblia em 6 Meses',
      descricao: 'Visão geral completa em ritmo acelerado',
      duracao: 180,
      icon: Zap,
      color: 'from-accent to-primary',
      recomendado: 'Quem deseja imersão mais rápida',
      categoria: 'intensivo'
    },
    {
      id: 'biblia_90_dias',
      nome: 'Bíblia em 90 Dias',
      descricao: 'Desafio intensivo de leitura completa',
      duracao: 90,
      icon: Zap,
      color: 'from-primary to-accent',
      recomendado: 'Desafio para quem tem mais tempo disponível',
      categoria: 'intensivo'
    },
    {
      id: 'novo_testamento_60',
      nome: 'Novo Testamento em 60 Dias',
      descricao: 'Foco intensivo no Novo Testamento',
      duracao: 60,
      icon: BookOpen,
      color: 'from-brand-night-light to-primary',
      recomendado: 'Estudo focado nos Evangelhos e Epístolas',
      categoria: 'tematico'
    },
    {
      id: 'evangelhos_15',
      nome: 'Os Evangelhos em 15 Dias',
      descricao: 'Conheça a vida e ensinamentos de Jesus',
      duracao: 15,
      icon: BookOpen,
      color: 'from-accent to-accent/80',
      recomendado: 'Iniciantes ou foco em Jesus',
      categoria: 'tematico'
    },
    {
      id: 'proverbios_31',
      nome: 'Provérbios em 31 Dias',
      descricao: 'Sabedoria diária para sua vida',
      duracao: 31,
      icon: Target,
      color: 'from-primary to-brand-clay',
      recomendado: 'Reflexões práticas e sabedoria',
      categoria: 'tematico'
    },
    {
      id: 'salmos_30',
      nome: 'Salmos em 30 Dias',
      descricao: 'Mergulhe na poesia e louvor',
      duracao: 30,
      icon: BookOpen,
      color: 'from-brand-clay to-accent',
      recomendado: 'Para momentos de reflexão',
      categoria: 'tematico'
    },
    {
      id: 'paulinas_45',
      nome: 'Cartas Paulinas em 45 Dias',
      descricao: 'Estudo profundo das epístolas de Paulo',
      duracao: 45,
      icon: Target,
      color: 'from-primary to-brand-night-light',
      recomendado: 'Aprofundamento teológico',
      categoria: 'tematico'
    },
    {
      id: 'profetas_60',
      nome: 'Profetas Maiores em 60 Dias',
      descricao: 'Isaías, Jeremias, Ezequiel e Daniel',
      duracao: 60,
      icon: BookOpen,
      color: 'from-brand-night-light to-brand-clay',
      recomendado: 'Compreensão profética',
      categoria: 'tematico'
    },
    {
      id: 'pentateuco_50',
      nome: 'Pentateuco em 50 Dias',
      descricao: 'Os cinco primeiros livros da Bíblia',
      duracao: 50,
      icon: Calendar,
      color: 'from-brand-clay to-primary',
      recomendado: 'Fundamentos da fé',
      categoria: 'tematico'
    }
  ];

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleConfirmCreate = async () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + selectedPlan.duracao);

    createPlanMutation.mutate({
      nome: selectedPlan.nome,
      descricao: selectedPlan.descricao,
      tipo: 'personalizado',
      data_inicio: today.toISOString().split('T')[0],
      data_fim: endDate.toISOString().split('T')[0],
      passagens: [],
      progresso: 0,
      ativo: true
    });
  };

  const [selectedCategory, setSelectedCategory] = useState('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Planos' },
    { id: 'popular', label: 'Mais Populares' },
    { id: 'intensivo', label: 'Intensivos' },
    { id: 'tematico', label: 'Temáticos' }
  ];

  const filteredPlans = selectedCategory === 'todos' 
    ? predefinedPlans 
    : predefinedPlans.filter(p => p.categoria === selectedCategory);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          Planos de Leitura
        </h2>
        <p className="text-muted-foreground">Escolha um plano estruturado para sua jornada bíblica</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={selectedCategory === cat.id ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card 
              key={plan.id}
              className="hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border-2 hover:border-primary/40"
              onClick={() => handleSelectPlan(plan)}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-lg">{plan.nome}</CardTitle>
                <CardDescription className="line-clamp-2">{plan.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-semibold">{plan.duracao} dias</Badge>
                  <Button size="sm" className={`bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl transition-all`}>
                    Iniciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPlan?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">{selectedPlan?.descricao}</p>
            <div className="bg-secondary p-4 rounded-lg space-y-2">
              <p><span className="font-semibold">Duração:</span> {selectedPlan?.duracao} dias</p>
              <p><span className="font-semibold">Recomendado para:</span> {selectedPlan?.recomendado}</p>
              <p><span className="font-semibold">Data de início:</span> Hoje</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmCreate}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={createPlanMutation.isPending}
              >
                Criar Plano
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}