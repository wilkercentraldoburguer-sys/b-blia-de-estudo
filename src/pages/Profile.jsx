import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StudyHistory from "../components/profile/StudyHistory";
import SpiritualStats from "../components/profile/SpiritualStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, BookOpen, MessageSquare, LogOut, Trash2, Heart, BookCheck, Plus, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BIBLE_VERSIONS = ["ARA", "ARC", "NVI", "NVT", "ACF", "KJV", "NAA", "NTLH"];
// NVT (Nova Versão Transformadora) e NTLH (Nova Tradução na Linguagem de
// Hoje) são traduções comerciais sem fonte gratuita/legal conhecida -
// ficam na lista (o usuário pediu por elas), mas marcadas como
// indisponíveis em vez de silenciosamente carregar outra versão sob esse
// rótulo (ver getBibleProvider.jsx).
const UNAVAILABLE_VERSIONS = ["NVT", "NTLH"];
// IMPORTANTE: por padrão, o comentário exibido pra cada nome abaixo é uma
// reflexão gerada por IA "inspirada no estilo" da pessoa - nunca uma
// citação literal do que ela realmente escreveu (ver
// Study.jsx/getCommentatorStyle e o aviso exibido na UI ao lado do nome).
// Exceção: "Matthew Henry" já busca comentário REAL e literal, de domínio
// público (ver matthewHenryProvider.jsx) - é a primeira fonte real
// integrada, com mais planejadas para o futuro.
const COMMENTATORS = ["Ryrie", "Hernandes Dias Lopes", "Matthew Henry", "Spurgeon", "John Stott", "MacArthur", "Pastor Local"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanType, setNewPlanType] = useState("diario");

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

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user?.email });
      return prefs[0] || null;
    },
    enabled: !!user,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['userNotes'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Note.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Favorite.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: readingPlans = [] } = useQuery({
    queryKey: ['readingPlans'],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ReadingPlan.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: biblicalStudies = [] } = useQuery({
    queryKey: ['biblicalStudies', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.BiblicalStudy.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: quizProgress = [] } = useQuery({
    queryKey: ['quizProgress', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.QuizProgress.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: highlights = [] } = useQuery({
    queryKey: ['highlights', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Highlight.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return await base44.entities.UserPreferences.update(preferences.id, data);
      } else {
        return await base44.entities.UserPreferences.create(data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userPreferences'] }),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userNotes'] }),
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userFavorites'] }),
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.ReadingPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingPlans'] });
      setPlanDialogOpen(false);
      setNewPlanName("");
      setNewPlanType("diario");
    },
  });

  const togglePlanActiveMutation = useMutation({
    mutationFn: ({ id, ativo }) => base44.entities.ReadingPlan.update(id, { ativo }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readingPlans'] }),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.ReadingPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['readingPlans'] }),
  });

  const toggleVersion = (version) => {
    const current = preferences?.versoes_ativas || ["ARA", "ARC", "NVI"];
    const updated = current.includes(version)
      ? current.filter(v => v !== version)
      : [...current, version];
    updatePreferencesMutation.mutate({ versoes_ativas: updated });
  };

  const toggleCommentator = (commentator) => {
    const current = preferences?.comentaristas_ativos || ["Ryrie"];
    if (commentator === "Ryrie") return; // sempre ativo
    const updated = current.includes(commentator)
      ? current.filter(c => c !== commentator)
      : [...current, commentator];
    updatePreferencesMutation.mutate({ comentaristas_ativos: updated });
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) return;
    createPlanMutation.mutate({
      nome: newPlanName,
      tipo: newPlanType,
      passagens: [],
      progresso: 0,
      ativo: true,
      data_inicio: new Date().toISOString().split('T')[0]
    });
  };

  const setDefaultVersion = (version) => {
    updatePreferencesMutation.mutate({ versao_padrao: version });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-stone-800">Meu Perfil</h1>
        </div>

        {/* Informações do Usuário */}
        {user && (
          <Card className="mb-6 border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Informações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-700"><strong>Nome:</strong> {user.full_name || "Não informado"}</p>
              <p className="text-stone-700 mt-2"><strong>Email:</strong> {user.email}</p>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="mt-4 border-primary text-primary"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas Espirituais Aprimoradas */}
        <div className="mb-6">
          <SpiritualStats 
            studies={biblicalStudies} 
            quizProgress={quizProgress}
            notes={notes}
            favorites={favorites}
            highlights={highlights}
            user={user}
          />
        </div>

        {/* Histórico de Estudos */}
        <div className="mb-6">
          <StudyHistory studies={biblicalStudies} />
        </div>

        {/* Versão Padrão */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Versão Padrão da Bíblia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Versão usada por padrão na leitura e estudo:
            </p>
            <Select
              value={preferences?.versao_padrao || "ARA"}
              onValueChange={setDefaultVersion}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BIBLE_VERSIONS.map(version => (
                  <SelectItem
                    key={version}
                    value={version}
                    disabled={UNAVAILABLE_VERSIONS.includes(version)}
                    title={UNAVAILABLE_VERSIONS.includes(version) ? 'Indisponível: sem fonte gratuita/legal para esta tradução' : undefined}
                  >
                    {version}{UNAVAILABLE_VERSIONS.includes(version) ? ' (indisponível)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Minhas Versões */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Versões Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Versões disponíveis para leitura e comparação:
            </p>
            <div className="space-y-3">
              {BIBLE_VERSIONS.map(version => {
                const isUnavailable = UNAVAILABLE_VERSIONS.includes(version);
                return (
                  <div key={version} className="flex items-center justify-between">
                    <span className={isUnavailable ? 'text-muted-foreground/60' : 'text-foreground'}>
                      {version}
                      {isUnavailable && (
                        <span className="text-xs text-muted-foreground ml-2">(sem fonte gratuita/legal)</span>
                      )}
                    </span>
                    <Switch
                      checked={!isUnavailable && (preferences?.versoes_ativas?.includes(version) || false)}
                      onCheckedChange={() => toggleVersion(version)}
                      disabled={isUnavailable}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Minhas Visões (Comentários) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentaristas Ativos
            </CardTitle>
            <p className="text-xs text-slate-500">
              Por padrão, cada reflexão é gerada por IA "inspirada no estilo de" o nome indicado - não é uma citação literal de nenhuma obra ou autor. Exceção: Matthew Henry já traz citação real e literal.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {COMMENTATORS.map(commentator => (
                <div key={commentator} className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-700">
                      {commentator === "Matthew Henry" ? commentator : `Inspirado em ${commentator}`}
                    </span>
                    {commentator === "Matthew Henry" && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                        Citação Real
                      </span>
                    )}
                    {commentator === "Ryrie" && (
                      <span className="ml-2 text-xs bg-brand-clay/15 text-brand-clay px-2 py-1 rounded">
                        Sempre ativo
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={preferences?.comentaristas_ativos?.includes(commentator) || commentator === "Ryrie"}
                    onCheckedChange={() => toggleCommentator(commentator)}
                    disabled={commentator === "Ryrie"}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meus Planos de Leitura */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookCheck className="w-5 h-5" />
                Planos de Leitura
              </div>
              <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Plano de Leitura</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Nome do Plano
                      </label>
                      <Input
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        placeholder="Ex: Leitura dos Evangelhos"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Frequência
                      </label>
                      <Select value={newPlanType} onValueChange={setNewPlanType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="personalizado">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreatePlan} className="bg-primary hover:bg-primary/90">
                        Criar Plano
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {readingPlans.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhum plano criado ainda. Crie seu primeiro plano de leitura!
              </p>
            ) : (
              <div className="space-y-3">
                {readingPlans.map((plan) => (
                  <Card key={plan.id} className="bg-primary/5 border-l-4 border-primary">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800">{plan.nome}</h3>
                            {plan.ativo && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 capitalize">{plan.tipo}</p>
                          <div className="mt-2 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-accent h-full transition-all"
                              style={{ width: `${plan.progresso || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{plan.progresso || 0}% concluído</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePlanActiveMutation.mutate({ id: plan.id, ativo: !plan.ativo })}
                            className={plan.ativo ? "text-accent" : "text-slate-400"}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePlanMutation.mutate(plan.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meus Versículos Favoritos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Versículos Favoritos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhum favorito ainda. Salve seus versículos favoritos durante a leitura!
              </p>
            ) : (
              <div className="space-y-3">
                {favorites.slice(0, 5).map((fav) => (
                  <Card key={fav.id} className="bg-brand-clay/5 border-l-4 border-brand-clay">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-primary mb-2">
                            {fav.book} {fav.chapter}:{fav.verse}
                          </p>
                          <p className="text-sm text-slate-700 italic">
                            "{fav.text}"
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFavoriteMutation.mutate(fav.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {favorites.length > 5 && (
                  <Link to={createPageUrl("Favorites")}>
                    <Button variant="outline" className="w-full">
                      Ver Todos os Favoritos ({favorites.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferências de Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Preferências de Interface</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Modo Escuro</span>
                <Switch
                  checked={preferences?.modo_escuro || false}
                  onCheckedChange={(checked) => updatePreferencesMutation.mutate({ modo_escuro: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Tamanho da Fonte</span>
                <div className="flex gap-2">
                  {["pequena", "media", "grande"].map(size => (
                    <Button
                      key={size}
                      variant={preferences?.tamanho_fonte === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => updatePreferencesMutation.mutate({ tamanho_fonte: size })}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minhas Anotações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Minhas Anotações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notes.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Você ainda não tem anotações. Comece estudando a Bíblia!
              </p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <Card key={note.id} className="bg-accent/5 border-l-4 border-accent">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-primary mb-2">
                            {note.book} {note.chapter}:{note.verse}
                          </p>
                          <p className="text-sm text-slate-600 italic mb-2">
                            "{note.verse_text}"
                          </p>
                          <p className="text-slate-800 whitespace-pre-line">
                            {note.note_text}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}