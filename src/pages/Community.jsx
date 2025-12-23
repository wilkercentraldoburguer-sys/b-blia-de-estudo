import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, UsersRound } from "lucide-react";
import FeedSection from "../components/community/FeedSection";
import GroupsSection from "../components/community/GroupsSection";
import ForumSection from "../components/community/ForumSection";

export default function Community() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("feed");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Comunidade</h1>
          <p className="text-slate-600">Conecte-se, compartilhe e cresça na fé com outros irmãos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="feed" className="gap-2">
              <Users className="w-4 h-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <UsersRound className="w-4 h-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="forum" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Fórum
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <FeedSection user={user} />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsSection user={user} />
          </TabsContent>

          <TabsContent value="forum">
            <ForumSection user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}