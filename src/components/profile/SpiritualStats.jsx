import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BookOpen, Target, Trophy } from "lucide-react";

export default function SpiritualStats({ studies, quizProgress }) {
  const diasLeitura = (() => {
    const lastReading = localStorage.getItem('last_reading');
    if (!lastReading) return 0;
    const data = JSON.parse(lastReading);
    const diff = Math.floor((new Date() - new Date(data.timestamp)) / (1000 * 60 * 60 * 24));
    return diff <= 1 ? 1 : 0; // Simplificado por enquanto
  })();

  const capitulosLidos = (() => {
    const offlineData = localStorage.getItem('offline_bible_books');
    if (!offlineData) return 0;
    const books = JSON.parse(offlineData);
    return books.reduce((acc, book) => acc + (book.chapters?.length || 0), 0);
  })();

  const quizCompletos = quizProgress?.length || 0;
  const estudosConcluidos = studies.filter(s => s.concluido).length;

  const stats = [
    { label: "Dias de Leitura", value: diasLeitura, icon: Target, color: "#722f37" },
    { label: "Capítulos Lidos", value: capitulosLidos, icon: BookOpen, color: "#8b3a42" },
    { label: "Estudos Concluídos", value: estudosConcluidos, icon: TrendingUp, color: "#a0474f" },
    { label: "Quiz Completos", value: quizCompletos, icon: Trophy, color: "#b5545c" }
  ];

  return (
    <Card className="border-2" style={{ borderColor: '#722f37' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: '#722f37' }} />
          Estatísticas Espirituais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg">
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: stat.color }} />
                <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
                <p className="text-xs text-stone-600 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}