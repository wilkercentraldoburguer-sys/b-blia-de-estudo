import React from "react";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Lightbulb, MessageCircle } from "lucide-react";

export const POST_TAGS = [
  { id: "reflexao", label: "Reflexão", icon: Lightbulb, color: "bg-amber-100 text-amber-800" },
  { id: "versiculo", label: "Versículo", icon: BookOpen, color: "bg-blue-100 text-blue-800" },
  { id: "estudo", label: "Estudo", icon: Heart, color: "bg-purple-100 text-purple-800" },
  { id: "testemunho", label: "Testemunho", icon: MessageCircle, color: "bg-green-100 text-green-800" }
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
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
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