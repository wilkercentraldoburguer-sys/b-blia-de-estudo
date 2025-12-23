import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { createPageUrl } from "../../utils";
import { Link } from "react-router-dom";

export default function ContinueReading({ user }) {
  const [lastReading, setLastReading] = useState(null);

  useEffect(() => {
    loadLastReading();
  }, [user]);

  const loadLastReading = () => {
    const saved = localStorage.getItem('last_reading');
    if (saved) {
      const data = JSON.parse(saved);
      setLastReading(data);
    }
  };

  if (!lastReading) return null;

  return (
    <Card className="border-2 hover:shadow-lg transition-all" style={{ borderColor: '#722f37' }}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5" style={{ color: '#722f37' }} />
              <h3 className="font-semibold text-stone-800">Continue sua leitura</h3>
            </div>
            <p className="text-stone-600 text-sm mb-3">
              {lastReading.book} {lastReading.chapter}
            </p>
            {lastReading.progress && (
              <div className="space-y-1">
                <Progress value={lastReading.progress} className="h-2" />
                <p className="text-xs text-stone-500">{lastReading.progress}% concluído</p>
              </div>
            )}
          </div>
          <Link to={createPageUrl('BibliaLeitura')}>
            <Button 
              size="sm"
              className="text-white"
              style={{ backgroundColor: '#722f37' }}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}