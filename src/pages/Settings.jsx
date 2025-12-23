import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  Download, 
  AlertCircle,
  CheckCircle,
  Clock,
  Database
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ThemeCustomizer from "../components/personalization/ThemeCustomizer";
import ReadingPlanGenerator from "../components/personalization/ReadingPlanGenerator";
import PredefinedPlansLibrary from "../components/reading/PredefinedPlansLibrary";
import AboutSection from "../components/settings/AboutSection";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [offlineData, setOfflineData] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5242880 }); // 5MB default
  const [updateAvailable, setUpdateAvailable] = useState([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
    loadOfflineData();
    checkForUpdates();
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
    queryKey: ['userPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0] || null;
    },
    enabled: !!user,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences) {
        return await base44.entities.UserPreferences.update(preferences.id, data);
      } else {
        return await base44.entities.UserPreferences.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });

  const loadOfflineData = () => {
    const books = localStorage.getItem('offline_bible_books');
    const cacheVersion = localStorage.getItem('offline_cache_version') || '1.0';
    
    if (books) {
      const parsedBooks = JSON.parse(books);
      setOfflineData(parsedBooks);
      
      // Calculate storage usage
      const dataSize = new Blob([books]).size;
      setStorageInfo(prev => ({ ...prev, used: dataSize }));
    }
  };

  const checkForUpdates = () => {
    const books = localStorage.getItem('offline_bible_books');
    if (!books) return;

    const parsedBooks = JSON.parse(books);
    const needsUpdate = parsedBooks.filter(book => {
      if (!book.lastUpdated) return true;
      const daysSinceUpdate = (new Date() - new Date(book.lastUpdated)) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });

    setUpdateAvailable(needsUpdate);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    return (storageInfo.used / storageInfo.total) * 100;
  };

  const deleteBook = (bookName) => {
    const updated = offlineData.filter(b => b.book !== bookName);
    setOfflineData(updated);
    localStorage.setItem('offline_bible_books', JSON.stringify(updated));
    setClearDialogOpen(false);
    setItemToDelete(null);
    loadOfflineData();
  };

  const clearAllCache = () => {
    localStorage.removeItem('offline_bible_books');
    localStorage.removeItem('offline_cache_version');
    setOfflineData([]);
    setStorageInfo(prev => ({ ...prev, used: 0 }));
    setClearDialogOpen(false);
  };

  const getBookSize = (book) => {
    const bookString = JSON.stringify(book);
    return new Blob([bookString]).size;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Configurações</h1>
          <p className="text-slate-600">Gerencie seu conteúdo offline e armazenamento</p>
        </div>

        <Tabs defaultValue="personalization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personalization">Personalização</TabsTrigger>
            <TabsTrigger value="reading">Leitura</TabsTrigger>
            <TabsTrigger value="storage">Armazenamento</TabsTrigger>
            <TabsTrigger value="updates">Atualizações</TabsTrigger>
          </TabsList>

          <TabsContent value="personalization" className="space-y-6">
            <ThemeCustomizer
              preferences={preferences}
              onUpdate={(data) => updatePreferencesMutation.mutate(data)}
            />
          </TabsContent>

          <TabsContent value="reading" className="space-y-6">
            <PredefinedPlansLibrary 
              onPlanCreated={() => queryClient.invalidateQueries({ queryKey: ['reading-plans'] })}
            />
            
            <div className="border-t pt-6 mt-6">
              <ReadingPlanGenerator
                user={user}
                onPlanCreated={() => queryClient.invalidateQueries({ queryKey: ['readingPlans'] })}
              />
            </div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            {/* Storage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Uso de Armazenamento
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie o espaço usado pelo conteúdo offline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {formatBytes(storageInfo.used)} de {formatBytes(storageInfo.total)} usados
                    </span>
                    <span className="text-sm text-slate-500">
                      {Math.round(getStoragePercentage())}%
                    </span>
                  </div>
                  <Progress value={getStoragePercentage()} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <Database className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-slate-800">{offlineData.length}</p>
                    <p className="text-xs text-slate-600">Livros Baixados</p>
                  </div>
                  <div className="text-center">
                    <Download className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-slate-800">
                      {offlineData.reduce((acc, b) => acc + (b.chapters?.length || 0), 0)}
                    </p>
                    <p className="text-xs text-slate-600">Capítulos</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                    <p className="text-2xl font-bold text-slate-800">{updateAvailable.length}</p>
                    <p className="text-xs text-slate-600">Precisam Atualizar</p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={() => {
                    setItemToDelete('all');
                    setClearDialogOpen(true);
                  }}
                  disabled={offlineData.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Todo o Cache
                </Button>
              </CardContent>
            </Card>

            {/* Downloaded Books List */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Baixado</CardTitle>
                <CardDescription>
                  Gerencie os livros baixados individualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offlineData.length === 0 ? (
                  <div className="text-center py-8">
                    <Download className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-600">Nenhum conteúdo offline ainda</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Vá para a seção Bíblia para baixar livros
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {offlineData.map((book, index) => {
                      const needsUpdate = updateAvailable.some(b => b.book === book.book);
                      const bookSize = getBookSize(book);
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-800">{book.book}</p>
                              {needsUpdate && (
                                <Badge variant="outline" className="text-amber-600 border-amber-600">
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Atualização Disponível
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span>{book.chapters?.length || 0} capítulos</span>
                              <span>•</span>
                              <span>{formatBytes(bookSize)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {book.lastUpdated 
                                  ? new Date(book.lastUpdated).toLocaleDateString('pt-BR')
                                  : 'Data desconhecida'}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setItemToDelete(book.book);
                              setClearDialogOpen(true);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-6">
            {/* Update Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Atualizações Disponíveis
                </CardTitle>
                <CardDescription>
                  Conteúdo que pode estar desatualizado (mais de 30 dias)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {updateAvailable.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="text-slate-800 font-semibold">Tudo atualizado!</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Seu conteúdo offline está em dia
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {updateAvailable.map((book, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{book.book}</p>
                          <p className="text-sm text-slate-600">
                            Última atualização: {book.lastUpdated 
                              ? new Date(book.lastUpdated).toLocaleDateString('pt-BR')
                              : 'Desconhecida'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <Badge variant="outline" className="bg-white">
                            Atualizar Recomendado
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <p className="text-sm text-slate-600 mb-3">
                        <AlertCircle className="w-4 h-4 inline mr-1" />
                        Recomendamos atualizar o conteúdo para garantir precisão e qualidade.
                      </p>
                      <p className="text-xs text-slate-500">
                        Vá para a seção de Downloads Offline na Bíblia para atualizar os livros individualmente.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cache Version Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-slate-600">Versão do Cache</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {localStorage.getItem('offline_cache_version') || '1.0'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-slate-600">Última Verificação</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Funcionando
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              {itemToDelete === 'all' 
                ? 'Tem certeza que deseja limpar todo o cache offline? Esta ação não pode ser desfeita.'
                : `Tem certeza que deseja remover "${itemToDelete}" do armazenamento offline?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete === 'all' ? clearAllCache() : deleteBook(itemToDelete)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}