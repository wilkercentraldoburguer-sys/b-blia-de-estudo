import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, Shield, Target } from "lucide-react";

export default function ProjectIdentity() {
  return (
    <div className="space-y-6">
      {/* Identidade Central */}
      <Card className="border-2" style={{ borderColor: '#722f37' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: '#722f37' }} />
            Identidade do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: '#722f37' }} />
              <p className="text-sm font-bold text-stone-800">Palavra-chave</p>
              <p className="text-lg font-bold" style={{ color: '#722f37' }}>Bíblia</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg">
              <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: '#722f37' }} />
              <p className="text-sm font-bold text-stone-800">Valor Central</p>
              <p className="text-sm font-bold" style={{ color: '#722f37' }}>Fidelidade às Escrituras</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: '#722f37' }} />
              <p className="text-sm font-bold text-stone-800">Postura</p>
              <p className="text-sm font-bold" style={{ color: '#722f37' }}>Reverência & Clareza</p>
            </div>
          </div>

          {/* Frases-base */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-stone-800 mb-4">Frases-Base do Projeto</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-stone-50 to-amber-50 rounded-lg border-l-4" style={{ borderColor: '#722f37' }}>
                <p className="text-stone-800 font-medium">"A Palavra é a nossa base."</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-stone-50 to-amber-50 rounded-lg border-l-4" style={{ borderColor: '#722f37' }}>
                <p className="text-stone-800 font-medium">"O Espírito Santo é o nosso Mestre."</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-stone-50 to-amber-50 rounded-lg border-l-4" style={{ borderColor: '#722f37' }}>
                <p className="text-stone-800 font-medium">"Estudar a Bíblia é caminhar com Deus."</p>
              </div>
            </div>
          </div>

          {/* Tom de Comunicação */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-stone-800 mb-4">Tom de Comunicação</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm font-semibold text-blue-900">Respeitoso</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-sm font-semibold text-green-900">Sério, mas Acessível</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-sm font-semibold text-purple-900">Profundo sem ser Pesado</p>
              </div>
            </div>
          </div>

          {/* Regra de Ouro */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-stone-800 mb-4">Regra de Ouro</h3>
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
              <p className="text-sm text-amber-900 mb-3 font-semibold">
                Se algo...
              </p>
              <ul className="space-y-2 text-sm text-amber-900">
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
          <div className="prose prose-sm max-w-none text-stone-700 leading-relaxed space-y-4">
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

            <div className="text-center py-6 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg mt-6">
              <p className="text-base font-bold mb-1" style={{ color: '#722f37' }}>
                A Palavra é a nossa base.
              </p>
              <p className="text-sm text-stone-600 italic">
                O Espírito Santo é o nosso Mestre.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}