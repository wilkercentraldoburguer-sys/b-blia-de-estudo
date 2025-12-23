import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lightbulb, Calendar, GitCompare, Link2, Brain, Heart, MessageCircle } from "lucide-react";

export default function StudyTabs({ studyData, children }) {
  return (
    <Tabs defaultValue="contexto" className="w-full">
      <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
        <TabsTrigger value="contexto" className="text-xs gap-1">
          <BookOpen className="w-3 h-3" />
          <span className="hidden sm:inline">Contexto</span>
        </TabsTrigger>
        <TabsTrigger value="explicacao" className="text-xs gap-1">
          <Lightbulb className="w-3 h-3" />
          <span className="hidden sm:inline">Explicação</span>
        </TabsTrigger>
        <TabsTrigger value="hoje" className="text-xs gap-1">
          <Calendar className="w-3 h-3" />
          <span className="hidden sm:inline">Hoje</span>
        </TabsTrigger>
        <TabsTrigger value="comparacoes" className="text-xs gap-1">
          <GitCompare className="w-3 h-3" />
          <span className="hidden sm:inline">Versões</span>
        </TabsTrigger>
        <TabsTrigger value="referencias" className="text-xs gap-1">
          <Link2 className="w-3 h-3" />
          <span className="hidden sm:inline">Referências</span>
        </TabsTrigger>
        <TabsTrigger value="quiz" className="text-xs gap-1">
          <Brain className="w-3 h-3" />
          <span className="hidden sm:inline">Quiz</span>
        </TabsTrigger>
        <TabsTrigger value="reflexao" className="text-xs gap-1">
          <Heart className="w-3 h-3" />
          <span className="hidden sm:inline">Reflexão</span>
        </TabsTrigger>
        <TabsTrigger value="oracao" className="text-xs gap-1">
          <MessageCircle className="w-3 h-3" />
          <span className="hidden sm:inline">Oração</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contexto" className="space-y-4">
        {children.contexto}
      </TabsContent>

      <TabsContent value="explicacao" className="space-y-4">
        {children.explicacao}
      </TabsContent>

      <TabsContent value="hoje" className="space-y-4">
        {children.hoje}
      </TabsContent>

      <TabsContent value="comparacoes" className="space-y-4">
        {children.comparacoes}
      </TabsContent>

      <TabsContent value="referencias" className="space-y-4">
        {children.referencias}
      </TabsContent>

      <TabsContent value="quiz" className="space-y-4">
        {children.quiz}
      </TabsContent>

      <TabsContent value="reflexao" className="space-y-4">
        {children.reflexao}
      </TabsContent>

      <TabsContent value="oracao" className="space-y-4">
        {children.oracao}
      </TabsContent>
    </Tabs>
  );
}