import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Coffee } from "lucide-react";

export default function ReadingSettings({
  fontSize,
  lineSpacing,
  theme,
  onFontSizeChange,
  onLineSpacingChange,
  onThemeChange,
  onClose
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Configurações de Leitura</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tamanho da Fonte */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-primary">
              Tamanho da Fonte
            </Label>
            <RadioGroup value={fontSize} onValueChange={onFontSizeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="text-sm cursor-pointer">Pequeno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-base cursor-pointer">Médio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="text-lg cursor-pointer">Grande</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlarge" id="xlarge" />
                <Label htmlFor="xlarge" className="text-xl cursor-pointer">Extra Grande</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Espaçamento de Linhas */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-primary">
              Espaçamento de Linhas
            </Label>
            <RadioGroup value={lineSpacing} onValueChange={onLineSpacingChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="compact" />
                <Label htmlFor="compact" className="cursor-pointer">Compacto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="cursor-pointer">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spacious" id="spacious" />
                <Label htmlFor="spacious" className="cursor-pointer">Espaçoso</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tema */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-primary">
              Tema de Leitura
            </Label>
            <RadioGroup value={theme} onValueChange={onThemeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="cursor-pointer flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Claro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="cursor-pointer flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Escuro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sepia" id="sepia" />
                <Label htmlFor="sepia" className="cursor-pointer flex items-center gap-2">
                  <Coffee className="w-4 h-4" />
                  Sépia
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}