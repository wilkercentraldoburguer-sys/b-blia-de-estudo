import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Upload, Construction } from "lucide-react";

export default function Sermons() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Ministrações</h1>
          </div>
          <p className="text-muted-foreground">Acesse pregações e ensinamentos supervisionados pela liderança</p>
        </div>

        {/* Banner em Desenvolvimento */}
        <Card className="bg-card border-2 border-primary mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Construction className="w-6 h-6" />
              Área em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-card-foreground mb-2">
              Em breve você terá acesso a uma biblioteca completa de ministrações organizadas por tema.
            </p>
            <div className="p-3 bg-brand-tint rounded-lg border border-accent mb-4">
              <p className="text-sm text-foreground">
                <strong>Importante:</strong> Todo conteúdo será supervisionado pela liderança da igreja.
              </p>
            </div>
            <p className="text-card-foreground mb-4 font-semibold">Categorias disponíveis em breve:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Família</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Fé</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Santidade</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Batalha Espiritual</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Cura Interior</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Vida Financeira</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Sermões Gerais</p>
              </div>
              <div className="bg-secondary p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-sm text-secondary-foreground">Eventos Especiais</p>
              </div>
            </div>
            <Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
              <Upload className="w-4 h-4 mr-2" />
              Adicionar Ministração (Em breve)
            </Button>
          </CardContent>
        </Card>

        {/* Lista Vazia */}
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Nenhuma ministração cadastrada ainda.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              A liderança poderá adicionar vídeos em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}