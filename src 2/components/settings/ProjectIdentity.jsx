import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, Shield, Target } from "lucide-react";

export default function ProjectIdentity() {
  return (
    <div className="space-y-6">
      {/* Identidade Central */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Identidade do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-brand-tint rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold text-foreground">Palavra-chave</p>
              <p className="text-lg font-bold text-primary">Bíblia</p>
            </div>
            <div className="text-center p-4 bg-brand-tint rounded-lg">
              <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold text-foreground">Valor Central</p>
              <p className="text-sm font-bold text-primary">Fidelidade às Escrituras</p>
            </div>
            <div className="text-center p-4 bg-brand-tint rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold text-foreground">Postura</p>
              <p className="text-sm font-bold text-primary">Reverência & Clareza</p>
            </div>
          </div>

          {/* Frases-base */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Frases-Base do Projeto</h3>
            <div className="space-y-3">
              <div className="p-4 bg-brand-tint rounded-lg border-l-4 border-primary">
                <p className="text-foreground font-medium">"A Palavra é a nossa base."</p>
              </div>
              <div className="p-4 bg-brand-tint rounded-lg border-l-4 border-primary">
                <p className="text-foreground font-medium">"O Espírito Santo é o nosso Mestre."</p>
              </div>
              <div className="p-4 bg-brand-tint rounded-lg border-l-4 border-primary">
                <p className="text-foreground font-medium">"Estudar a Bíblia é caminhar com Deus."</p>
              </div>
            </div>
          </div>

          {/* Tom de Comunicação */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Tom de Comunicação</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-secondary rounded-lg text-center">
                <p className="text-sm font-semibold text-secondary-foreground">Respeitoso</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg text-center">
                <p className="text-sm font-semibold text-accent">Sério, mas Acessível</p>
              </div>
              <div className="p-3 bg-brand-clay/10 rounded-lg text-center">
                <p className="text-sm font-semibold text-brand-clay">Profundo sem ser Pesado</p>
              </div>
            </div>
          </div>

          {/* Regra de Ouro */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-4">Regra de Ouro</h3>
            <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
              <p className="text-sm text-foreground mb-3 font-semibold">
                Se algo...
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Tira o foco da Escritura → <strong>não entra</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Substitui o papel do Espírito Santo → <strong>não entra</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Cria dependência do app → <strong>não entra</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texto Oficial de Lançamento */}
      <Card>
        <CardHeader>
          <CardTitle>Texto Oficial de Apresentação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed space-y-4">
            <p>
              Este aplicativo foi criado para quem deseja <strong>ler e estudar a Bíblia com profundidade, clareza e reverência</strong>.
            </p>
            
            <p>
              Aqui, <strong>a Palavra é o centro</strong>.<br />
              O estudo nasce do texto bíblico.<br />
              A aplicação respeita o tempo, a realidade e a caminhada de cada pessoa.
            </p>

            <p>
              <strong>Não substituímos a igreja.</strong><br />
              <strong>Não falamos no lugar de Deus.</strong><br />
              Somos uma ferramenta para quem deseja crescer no conhecimento das Escrituras.
            </p>

            <div className="text-center py-6 bg-brand-tint rounded-lg mt-6">
              <p className="text-base font-bold mb-1 text-primary">
                A Palavra é a nossa base.
              </p>
              <p className="text-sm text-muted-foreground italic">
                O Espírito Santo é o nosso Mestre.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}