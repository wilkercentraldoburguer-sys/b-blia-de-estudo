import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Eye, Loader2 } from "lucide-react";

export default function ForumSection({ user }) {
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [topicData, setTopicData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "geral"
  });

  const queryClient = useQueryClient();

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['forumTopics'],
    queryFn: () => base44.entities.ForumTopic.list('-created_date'),
  });

  const createTopicMutation = useMutation({
    mutationFn: (data) => base44.entities.ForumTopic.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
      setNewTopicOpen(false);
      setTopicData({ titulo: "", conteudo: "", categoria: "geral" });
    },
  });

  const categoriaLabels = {
    doutrina: "Doutrina",
    vida_crista: "Vida Cristã",
    duvidas: "Dúvidas",
    testemunhos: "Testemunhos",
    oracao: "Oração",
    geral: "Geral"
  };

  const categoriaColors = {
    doutrina: "bg-blue-100 text-blue-800",
    vida_crista: "bg-green-100 text-green-800",
    duvidas: "bg-yellow-100 text-yellow-800",
    testemunhos: "bg-purple-100 text-purple-800",
    oracao: "bg-pink-100 text-pink-800",
    geral: "bg-slate-100 text-slate-800"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Dialog open={newTopicOpen} onOpenChange={setNewTopicOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Tópico
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Tópico do Fórum</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título do tópico"
                  value={topicData.titulo}
                  onChange={(e) => setTopicData({...topicData, titulo: e.target.value})}
                />
                <Select value={topicData.categoria} onValueChange={(v) => setTopicData({...topicData, categoria: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doutrina">Doutrina</SelectItem>
                    <SelectItem value="vida_crista">Vida Cristã</SelectItem>
                    <SelectItem value="duvidas">Dúvidas</SelectItem>
                    <SelectItem value="testemunhos">Testemunhos</SelectItem>
                    <SelectItem value="oracao">Oração</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Conteúdo do tópico"
                  value={topicData.conteudo}
                  onChange={(e) => setTopicData({...topicData, conteudo: e.target.value})}
                  className="min-h-32"
                />

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewTopicOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => createTopicMutation.mutate(topicData)}
                    disabled={!topicData.titulo || !topicData.conteudo}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    Criar Tópico
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          </CardContent>
        </Card>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-600">Nenhum tópico criado ainda. Inicie uma discussão!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoriaColors[topic.categoria]}`}>
                        {categoriaLabels[topic.categoria]}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2">{topic.titulo}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2">{topic.conteudo}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{topic.respostas_count || 0} respostas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{topic.visualizacoes || 0} visualizações</span>
                      </div>
                      <span className="text-xs">Por {topic.created_by}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}