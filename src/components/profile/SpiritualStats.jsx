import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReadingProgressByBook from "./ReadingProgressByBook";
import QuizPerformance from "./QuizPerformance";
import WeeklyChallenge from "./WeeklyChallenge";
import BadgesSystem from "./BadgesSystem";

export default function SpiritualStats({ studies, quizProgress, notes, favorites, highlights, user }) {
  return (
    <Tabs defaultValue="visao_geral" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="visao_geral">Visão Geral</TabsTrigger>
        <TabsTrigger value="progresso">Progresso</TabsTrigger>
        <TabsTrigger value="desafios">Desafios</TabsTrigger>
        <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
      </TabsList>

      <TabsContent value="visao_geral" className="space-y-6">
        <QuizPerformance quizProgress={quizProgress} biblicalStudies={studies} />
      </TabsContent>

      <TabsContent value="progresso" className="space-y-6">
        <ReadingProgressByBook highlights={highlights} notes={notes} />
      </TabsContent>

      <TabsContent value="desafios" className="space-y-6">
        <WeeklyChallenge completedStudies={studies.filter(s => s.concluido)} user={user} />
      </TabsContent>

      <TabsContent value="conquistas" className="space-y-6">
        <BadgesSystem 
          studies={studies}
          quizProgress={quizProgress}
          notes={notes}
          favorites={favorites}
          highlights={highlights}
        />
      </TabsContent>
    </Tabs>
  );
}