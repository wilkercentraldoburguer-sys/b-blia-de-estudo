import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BookMarked, Video, User, Loader2 } from "lucide-react";
import DailyVerseRecommendation from "../components/personalization/DailyVerseRecommendation";

export default function Home() {
  const [user, setUser] = useState(null);
  const [dailyVerse, setDailyVerse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadDailyVerse();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadDailyVerse = async () => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Escolha um versículo bíblico edificante em português (Almeida Revista e Atualizada).
        
JSON:
{
  "referencia": "Livro Capítulo:Versículo",
  "texto": "texto do versículo"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            referencia: { type: "string" },
            texto: { type: "string" }
          },
          required: ["referencia", "texto"]
        }
      });
      setDailyVerse(response);
    } catch (error) {
      console.error("Erro ao carregar versículo:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-3">
            Bem-vindo{user ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-slate-600">
            Um novo dia, uma nova oportunidade de crescer na Palavra
          </p>
        </div>

        {user ? (
          <DailyVerseRecommendation user={user} />
        ) : (
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 mb-8">
            <CardHeader>
              <CardTitle className="text-blue-900">Versículo do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : dailyVerse ? (
                <>
                  <p className="text-lg leading-relaxed text-slate-800 italic mb-3">
                    "{dailyVerse.texto}"
                  </p>
                  <p className="font-semibold text-blue-900">{dailyVerse.referencia}</p>
                </>
              ) : (
                <p className="text-slate-600">Não foi possível carregar o versículo</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to={createPageUrl("Bible")}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <BookOpen className="w-12 h-12 text-blue-600" />
                <p className="font-semibold text-center">Ler Bíblia</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Study")}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <BookMarked className="w-12 h-12 text-indigo-600" />
                <p className="font-semibold text-center">Estudos</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Sermons")}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <Video className="w-12 h-12 text-purple-600" />
                <p className="font-semibold text-center">Ministrações</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Profile")}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <User className="w-12 h-12 text-amber-600" />
                <p className="font-semibold text-center">Perfil</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Continue Estudando</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 text-sm mb-4">
              Nenhum estudo em andamento. Comece agora!
            </p>
            <Link to={createPageUrl("Study")}>
              <Button className="bg-blue-900 hover:bg-blue-800">
                Iniciar Estudo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}