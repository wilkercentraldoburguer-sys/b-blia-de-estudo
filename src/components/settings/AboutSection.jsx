import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, BookOpen, Users, Heart } from "lucide-react";
import ProjectIdentity from "./ProjectIdentity";

export default function AboutSection() {
  return (
    <Tabs defaultValue="sobre" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sobre">Sobre</TabsTrigger>
        <TabsTrigger value="identidade">Identidade</TabsTrigger>
      </TabsList>

      <TabsContent value="sobre" className="space-y-6">
      {/* Sobre o App */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Sobre o Aplicativo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Nossa Missão</h3>
            <p className="text-sm text-foreground leading-relaxed">
              Auxiliar cristãos no estudo profundo e reflexivo das Escrituras Sagradas,
              promovendo compreensão bíblica fundamentada e crescimento espiritual.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-brand-tint rounded-lg">
            <BookOpen className="w-5 h-5 flex-shrink-0 mt-1 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                A Palavra é nossa base
              </p>
              <p className="text-xs text-muted-foreground italic">
                "Toda a Escritura é inspirada por Deus e útil para o ensino,
                para a repreensão, para a correção, para a educação na justiça."
                <br />— 2 Timóteo 3:16
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Termos de Uso e Responsabilidade */}
      <Card className="border-2 border-accent bg-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Heart className="w-5 h-5" />
            Responsabilidade Espiritual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-foreground">
            <p className="leading-relaxed">
              <strong>Este aplicativo tem como objetivo auxiliar na leitura e no estudo da Bíblia.</strong>
            </p>

            <p className="leading-relaxed">
              Ele <strong>não substitui</strong> a igreja local, a liderança pastoral ou o aconselhamento espiritual.
            </p>

            <p className="leading-relaxed">
              Toda interpretação deve ser confrontada com as Escrituras e vivida em comunhão cristã.
            </p>

            <div className="border-t border-border pt-3 mt-4">
              <p className="font-semibold mb-2">O que este app NÃO faz:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Não gera profecias pessoais ou direcionamentos específicos</li>
                <li>Não substitui o aconselhamento pastoral</li>
                <li>Não toma o lugar do Espírito Santo como Mestre</li>
                <li>Não substitui a comunhão na igreja local</li>
              </ul>
            </div>

            <div className="border-t border-border pt-3">
              <p className="font-semibold mb-2">O que este app faz:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Auxilia no estudo contextualizado das Escrituras</li>
                <li>Facilita a leitura e organização da Palavra</li>
                <li>Promove reflexão pessoal baseada no texto bíblico</li>
                <li>Incentiva a busca por entendimento e sabedoria</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posicionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Nosso Posicionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-brand-tint rounded-lg border-l-4 border-primary">
            <p className="text-sm font-semibold text-foreground mb-2">
              Postura Teológica
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• <strong>Cristocêntrica:</strong> Toda Escritura aponta para Cristo</li>
              <li>• <strong>Bíblica:</strong> A Palavra é nossa autoridade máxima</li>
              <li>• <strong>Humilde:</strong> Não somos dogmáticos fora do texto</li>
              <li>• <strong>Respeitosa:</strong> Honramos diferentes tradições cristãas históricas</li>
            </ul>
          </div>

          <div className="text-center py-6 bg-brand-tint rounded-lg">
            <p className="text-lg font-bold mb-1 text-primary">
              A Palavra é a nossa base.
            </p>
            <p className="text-sm text-muted-foreground italic">
              O Espírito Santo é o nosso Mestre.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Versão */}
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Versão 1.0.0 • Desenvolvido com reverência às Escrituras Sagradas
          </p>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="identidade">
        <ProjectIdentity />
      </TabsContent>
    </Tabs>
  );
}