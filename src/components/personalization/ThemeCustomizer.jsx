import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Type } from "lucide-react";

export default function ThemeCustomizer({ preferences, onUpdate }) {
  const themes = [
    { value: "claro", label: "Claro", bg: "bg-white", text: "text-slate-900" },
    { value: "escuro", label: "Escuro", bg: "bg-slate-900", text: "text-white" },
    { value: "sepia", label: "Sépia", bg: "bg-amber-50", text: "text-amber-900" },
    { value: "azul", label: "Azul", bg: "bg-blue-50", text: "text-blue-900" }
  ];

  const fontSizes = [
    { value: "pequena", label: "Pequena", size: "text-sm" },
    { value: "media", label: "Média", size: "text-base" },
    { value: "grande", label: "Grande", size: "text-lg" },
    { value: "extra_grande", label: "Extra Grande", size: "text-xl" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Tema de Cores
          </CardTitle>
          <CardDescription>Escolha o tema visual da sua preferência</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences?.tema || "claro"}
            onValueChange={(value) => onUpdate({ tema: value })}
          >
            <div className="grid grid-cols-2 gap-4">
              {themes.map((theme) => (
                <div key={theme.value}>
                  <RadioGroupItem
                    value={theme.value}
                    id={theme.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={theme.value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 cursor-pointer"
                  >
                    <div className={`w-full h-16 rounded ${theme.bg} border mb-2`}>
                      <div className={`p-2 ${theme.text} text-xs`}>Aa</div>
                    </div>
                    <span className="text-sm font-medium">{theme.label}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Tamanho da Fonte
          </CardTitle>
          <CardDescription>Ajuste o tamanho do texto para melhor leitura</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={preferences?.tamanho_fonte || "media"}
            onValueChange={(value) => onUpdate({ tamanho_fonte: value })}
          >
            <div className="space-y-3">
              {fontSizes.map((size) => (
                <div key={size.value}>
                  <RadioGroupItem
                    value={size.value}
                    id={size.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={size.value}
                    className="flex items-center justify-between rounded-md border-2 border-slate-200 p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 cursor-pointer"
                  >
                    <span className={`font-medium ${size.size}`}>{size.label}</span>
                    <span className={`text-slate-600 ${size.size}`}>
                      O Senhor é meu pastor
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}