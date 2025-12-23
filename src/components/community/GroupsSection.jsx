import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Lock, Globe, Loader2 } from "lucide-react";

export default function GroupsSection({ user }) {
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [groupData, setGroupData] = useState({
    nome: "",
    descricao: "",
    tema: "",
    privacidade: "publico"
  });

  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['studyGroups'],
    queryFn: () => base44.entities.StudyGroup.list('-created_date'),
  });

  const createGroupMutation = useMutation({
    mutationFn: (data) => base44.entities.StudyGroup.create({
      ...data,
      admin: user.email,
      membros: [user.email]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
      setNewGroupOpen(false);
      setGroupData({ nome: "", descricao: "", tema: "", privacidade: "publico" });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (group) => {
      const membros = group.membros || [];
      if (!membros.includes(user.email)) {
        return await base44.entities.StudyGroup.update(group.id, {
          membros: [...membros, user.email]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: async (group) => {
      const membros = group.membros || [];
      return await base44.entities.StudyGroup.update(group.id, {
        membros: membros.filter(email => email !== user.email)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyGroups'] });
    },
  });

  const isMember = (group) => {
    return group.membros?.includes(user?.email);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Dialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Grupo de Estudo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Grupo de Estudo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do grupo"
                  value={groupData.nome}
                  onChange={(e) => setGroupData({...groupData, nome: e.target.value})}
                />
                <Textarea
                  placeholder="Descrição do grupo"
                  value={groupData.descricao}
                  onChange={(e) => setGroupData({...groupData, descricao: e.target.value})}
                />
                <Input
                  placeholder="Tema principal"
                  value={groupData.tema}
                  onChange={(e) => setGroupData({...groupData, tema: e.target.value})}
                />
                <Select value={groupData.privacidade} onValueChange={(v) => setGroupData({...groupData, privacidade: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publico">Público</SelectItem>
                    <SelectItem value="privado">Privado</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewGroupOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => createGroupMutation.mutate(groupData)}
                    disabled={!groupData.nome || !groupData.descricao}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Criar Grupo
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
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-600">Nenhum grupo criado ainda. Crie o primeiro!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.nome}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{group.tema}</p>
                  </div>
                  {group.privacidade === "privado" ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-700">{group.descricao}</p>
                
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{group.membros?.length || 0} membros</span>
                </div>

                {user && (
                  <div>
                    {isMember(group) ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => leaveGroupMutation.mutate(group)}
                        disabled={group.admin === user.email}
                      >
                        {group.admin === user.email ? "Você é o Admin" : "Sair do Grupo"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => joinGroupMutation.mutate(group)}
                      >
                        Entrar no Grupo
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}