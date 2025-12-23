import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: preferences } = useQuery({
    queryKey: ['userPreferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreferences.filter({ created_by: user.email });
      return prefs[0] || { tema: "claro", tamanho_fonte: "media" };
    },
    enabled: !!user,
  });

  const getThemeClasses = () => {
    const tema = preferences?.tema || "claro";
    const fontSize = preferences?.tamanho_fonte || "media";

    const themes = {
      claro: "bg-white text-slate-900",
      escuro: "bg-slate-900 text-white",
      sepia: "bg-amber-50 text-amber-900",
      azul: "bg-blue-50 text-blue-900"
    };

    const fontSizes = {
      pequena: "text-sm",
      media: "text-base",
      grande: "text-lg",
      extra_grande: "text-xl"
    };

    return {
      theme: themes[tema] || themes.claro,
      fontSize: fontSizes[fontSize] || fontSizes.media,
      tema,
      tamanho_fonte: fontSize
    };
  };

  return (
    <ThemeContext.Provider value={getThemeClasses()}>
      {children}
    </ThemeContext.Provider>
  );
}