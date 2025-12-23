import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, UsersRound } from "lucide-react";
import SpiritualDisclaimer from "../components/common/SpiritualDisclaimer";
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
          <h1 className="text-4xl font-bold text-stone-800 mb-2" style={{ color: '#722f37' }}>Comunidade</h1>
          <p className="text-stone-600">Conecte-se, compartilhe reflexões e cresça na fé com outros irmãos</p>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg border" style={{ borderColor: '#e5ddd5' }}>
            <p className="text-sm text-stone-700">
              💡 <strong>Dica:</strong> Compartilhe reflexões, versículos e testemunhos. Evite debates doutrinários complexos.
            </p>
          </div>
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