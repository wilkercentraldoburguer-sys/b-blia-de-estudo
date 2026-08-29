import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BookMarked, Video, User, Loader2 } from "lucide-react";
import DailyVerseRecommendation from "../components/personalization/DailyVerseRecommendation";
import { fetchRandomVerse } from "../components/bible/abibliaBibleProvider";

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
      // Versículo real e aleatório da ABíbliaDigital - nunca "escolhido"
      // e escrito por uma IA.
      const verse = await fetchRandomVerse("ARA");
      setDailyVerse({
        referencia: `${verse.book} ${verse.chapter}:${verse.verse}`,
        texto: verse.text
      });
    } catch (error) {
      console.error("Erro ao carregar versículo:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold text-primary mb-3">
            Bem-vindo{user ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-lg text-muted-foreground">
            Um novo dia, uma nova oportunidade de crescer na Palavra
          </p>
        </div>

        {user ? (
          <DailyVerseRecommendation user={user} />
        ) : (
          <Card className="bg-primary border-primary mb-8">
            <CardHeader>
              <CardTitle className="text-primary-foreground">Versículo do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-amber" />
                </div>
              ) : dailyVerse ? (
                <>
                  <p className="font-display text-lg leading-relaxed text-primary-foreground italic mb-3">
                    "{dailyVerse.texto}"
                  </p>
                  <p className="font-semibold text-brand-amber">{dailyVerse.referencia}</p>
                </>
              ) : (
                <p className="text-primary-foreground/70">Não foi possível carregar o versículo</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Link to={createPageUrl("Reader")}>
            <Card className="hover:border-accent hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <BookOpen className="w-12 h-12 text-primary" />
                <p className="font-semibold text-center">Ler Bíblia</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Study")}>
            <Card className="hover:border-accent hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <BookMarked className="w-12 h-12 text-primary" />
                <p className="font-semibold text-center">Estudos</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Sermons")}>
            <Card className="hover:border-accent hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <Video className="w-12 h-12 text-primary" />
                <p className="font-semibold text-center">Ministrações</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Profile")}>
            <Card className="hover:border-accent hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                <User className="w-12 h-12 text-primary" />
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
            <p className="text-muted-foreground text-sm mb-4">
              Nenhum estudo em andamento. Comece agora!
            </p>
            <Link to={createPageUrl("Study")}>
              <Button className="bg-primary hover:bg-brand-night-light text-primary-foreground">
                Iniciar Estudo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}