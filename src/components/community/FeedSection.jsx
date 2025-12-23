import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, MessageCircle, Plus, Loader2, Book } from "lucide-react";

export default function FeedSection({ user }) {
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [postData, setPostData] = useState({
    tipo: "reflexao",
    conteudo: "",
    versiculo_referencia: "",
    versiculo_texto: ""
  });
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const allPosts = await base44.entities.Post.list('-created_date');
      return allPosts;
    },
  });

  const { data: follows = [] } = useQuery({
    queryKey: ['follows', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Follow.filter({ follower_email: user.email });
    },
    enabled: !!user,
  });

  const createPostMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPostOpen(false);
      setPostData({ tipo: "reflexao", conteudo: "", versiculo_referencia: "", versiculo_texto: "" });
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, currentLikes }) => {
      const likes = currentLikes || [];
      const hasLiked = likes.includes(user.email);
      const updatedLikes = hasLiked 
        ? likes.filter(email => email !== user.email)
        : [...likes, user.email];
      
      return await base44.entities.Post.update(postId, { likes: updatedLikes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, conteudo }) => {
      await base44.entities.Comment.create({
        post_id: postId,
        conteudo,
        author_name: user.full_name
      });
      
      const post = posts.find(p => p.id === postId);
      await base44.entities.Post.update(postId, {
        comentarios_count: (post.comentarios_count || 0) + 1
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      setCommentText(prev => ({ ...prev, [variables.postId]: "" }));
    },
  });

  const { data: allComments = {} } = useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const comments = await base44.entities.Comment.list('-created_date');
      return comments.reduce((acc, comment) => {
        if (!acc[comment.post_id]) acc[comment.post_id] = [];
        acc[comment.post_id].push(comment);
        return acc;
      }, {});
    },
  });

  const followMutation = useMutation({
    mutationFn: async (targetEmail) => {
      const existing = follows.find(f => f.following_email === targetEmail);
      if (existing) {
        return await base44.entities.Follow.delete(existing.id);
      } else {
        const targetUser = await base44.entities.User.filter({ email: targetEmail });
        return await base44.entities.Follow.create({
          follower_email: user.email,
          following_email: targetEmail,
          following_name: targetUser[0]?.full_name || targetEmail
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follows'] });
    },
  });

  const handleCreatePost = () => {
    if (!postData.conteudo.trim()) return;
    createPostMutation.mutate(postData);
  };

  const isFollowing = (email) => {
    return follows.some(f => f.following_email === email);
  };

  const tipoLabels = {
    anotacao: "Anotação",
    destaque: "Destaque",
    insight: "Insight",
    reflexao: "Reflexão"
  };

  const tipoColors = {
    anotacao: "bg-blue-100 text-blue-800",
    destaque: "bg-yellow-100 text-yellow-800",
    insight: "bg-purple-100 text-purple-800",
    reflexao: "bg-green-100 text-green-800"
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Criar Post */}
        <Card>
          <CardContent className="pt-6">
            <Dialog open={newPostOpen} onOpenChange={setNewPostOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Compartilhar algo com a comunidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nova Postagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={postData.tipo} onValueChange={(v) => setPostData({...postData, tipo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reflexao">Reflexão</SelectItem>
                      <SelectItem value="insight">Insight Bíblico</SelectItem>
                      <SelectItem value="anotacao">Anotação de Estudo</SelectItem>
                      <SelectItem value="destaque">Versículo em Destaque</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="O que você gostaria de compartilhar?"
                    value={postData.conteudo}
                    onChange={(e) => setPostData({...postData, conteudo: e.target.value})}
                    className="min-h-32"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Referência (Ex: João 3:16)"
                      value={postData.versiculo_referencia}
                      onChange={(e) => setPostData({...postData, versiculo_referencia: e.target.value})}
                    />
                    <Input
                      placeholder="Texto do versículo (opcional)"
                      value={postData.versiculo_texto}
                      onChange={(e) => setPostData({...postData, versiculo_texto: e.target.value})}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewPostOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreatePost} className="bg-purple-600 hover:bg-purple-700">
                      Publicar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Feed de Posts */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600">Nenhuma postagem ainda. Seja o primeiro a compartilhar!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => {
            const postComments = allComments[post.id] || [];
            const hasLiked = post.likes?.includes(user?.email);
            
            return (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {post.created_by?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{post.created_by}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(post.created_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {user && post.created_by !== user.email && (
                      <Button
                        size="sm"
                        variant={isFollowing(post.created_by) ? "outline" : "default"}
                        onClick={() => followMutation.mutate(post.created_by)}
                      >
                        {isFollowing(post.created_by) ? "Seguindo" : "Seguir"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tipoColors[post.tipo]}`}>
                    {tipoLabels[post.tipo]}
                  </span>

                  <p className="text-slate-700 leading-relaxed">{post.conteudo}</p>

                  {post.versiculo_referencia && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="w-4 h-4 text-blue-600" />
                        <p className="font-semibold text-blue-900">{post.versiculo_referencia}</p>
                      </div>
                      {post.versiculo_texto && (
                        <p className="text-slate-700 italic">"{post.versiculo_texto}"</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => user && toggleLikeMutation.mutate({ postId: post.id, currentLikes: post.likes })}
                      className={hasLiked ? "text-red-600" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${hasLiked ? "fill-current" : ""}`} />
                      {post.likes?.length || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {post.comentarios_count || 0}
                    </Button>
                  </div>

                  {showComments[post.id] && (
                    <div className="space-y-3 pt-3 border-t">
                      {postComments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 p-3 rounded-lg">
                          <p className="font-semibold text-sm text-slate-800">{comment.author_name}</p>
                          <p className="text-slate-700 text-sm mt-1">{comment.conteudo}</p>
                        </div>
                      ))}
                      
                      {user && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Escreva um comentário..."
                            value={commentText[post.id] || ""}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          />
                          <Button
                            size="sm"
                            onClick={() => addCommentMutation.mutate({ postId: post.id, conteudo: commentText[post.id] })}
                            disabled={!commentText[post.id]?.trim()}
                          >
                            Enviar
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">Seguindo</h3>
          </CardHeader>
          <CardContent>
            {follows.length === 0 ? (
              <p className="text-sm text-slate-600">Você ainda não segue ninguém</p>
            ) : (
              <div className="space-y-2">
                {follows.map((follow) => (
                  <div key={follow.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 text-xs font-bold">
                        {follow.following_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{follow.following_name}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}