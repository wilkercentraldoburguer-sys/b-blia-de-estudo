import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Upload, Construction } from "lucide-react";

export default function Sermons() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-10 h-10" style={{ color: '#722f37' }} />
            <h1 className="text-4xl font-bold text-stone-800" style={{ color: '#722f37' }}>Ministrações</h1>
          </div>
          <p className="text-stone-600">Acesse pregações e ensinamentos supervisionados pela liderança</p>
        </div>

        {/* Banner em Desenvolvimento */}
        <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-2 mb-6" style={{ borderColor: '#722f37' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#722f37' }}>
              <Construction className="w-6 h-6" />
              Área em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stone-700 mb-2">
              Em breve você terá acesso a uma biblioteca completa de ministrações organizadas por tema.
            </p>
            <div className="p-3 bg-amber-100 rounded-lg border border-amber-300 mb-4">
              <p className="text-sm text-amber-900">
                <strong>Importante:</strong> Todo conteúdo será supervisionado pela liderança da igreja.
              </p>
            </div>
            <p className="text-stone-700 mb-4 font-semibold">Categorias disponíveis em breve:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Família</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Fé</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Santidade</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Batalha Espiritual</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Cura Interior</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Vida Financeira</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Sermões Gerais</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm">Eventos Especiais</p>
              </div>
            </div>
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Adicionar Ministração (Em breve)
            </Button>
          </CardContent>
        </Card>

        {/* Lista Vazia */}
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              Nenhuma ministração cadastrada ainda.
            </p>
            <p className="text-slate-400 text-sm mt-2">
              A liderança poderá adicionar vídeos em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}