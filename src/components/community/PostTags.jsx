import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Lightbulb, MessageCircle } from "lucide-react";

export const POST_TAGS = [
  { id: "reflexao", label: "Reflexão", icon: Lightbulb, color: "bg-accent text-accent-foreground" },
  { id: "versiculo", label: "Versículo", icon: BookOpen, color: "bg-primary text-primary-foreground" },
  { id: "estudo", label: "Estudo", icon: Heart, color: "bg-brand-clay text-brand-bone" },
  { id: "testemunho", label: "Testemunho", icon: MessageCircle, color: "bg-secondary text-secondary-foreground" }
];

export function PostTag({ tag }) {
  const tagConfig = POST_TAGS.find(t => t.id === tag);
  if (!tagConfig) return null;

  const Icon = tagConfig.icon;
  
  return (
    <Badge className={`${tagConfig.color} text-xs`}>
      <Icon className="w-3 h-3 mr-1" />
      {tagConfig.label}
    </Badge>
  );
}

export function TagSelector({ selectedTag, onSelectTag }) {
  return (
    <div className="flex flex-wrap gap-2">
      {POST_TAGS.map(tag => {
        const Icon = tag.icon;
        return (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
              selectedTag === tag.id
                ? `${tag.color} border-current`
                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tag.label}</span>
          </button>
        );
      })}
    </div>
  );
}