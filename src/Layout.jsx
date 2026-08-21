import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, BookOpen, BookMarked, Video, User, Users, Settings, Brain } from "lucide-react";
import { ThemeProvider } from "./components/personalization/ThemeProvider";

export default function Layout({ children, currentPageName }) {
  const menuItems = [
    { name: "Home", label: "Início", icon: Home },
    { name: "BibliaLeitura", label: "Leitura", icon: BookOpen },
    { name: "Reader", label: "Estudo", icon: BookMarked },
    { name: "Quiz", label: "Quiz", icon: Brain },
    { name: "Community", label: "Comunidade", icon: Users },
    { name: "Sermons", label: "Ministrações", icon: Video },
    { name: "Settings", label: "Configurações", icon: Settings },
    { name: "Profile", label: "Perfil", icon: User }
  ];

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-background">
      {/* Navegação Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-brand-night text-brand-bone shadow-md scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "stroke-2 scale-110" : ""}`} />
                <span className="text-xs font-semibold">{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-brand-amber animate-pulse"></div>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Barra Lateral Desktop */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-72 bg-brand-night border-r border-black/20 shadow-2xl">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
            <div className="w-11 h-11 rounded-full bg-brand-amber/15 border border-brand-amber/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-brand-bone leading-tight">Abba Estudos</h1>
              <p className="text-xs text-brand-bone/55">Sua jornada espiritual</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex items-center gap-3 pl-3 pr-4 py-3 rounded-lg transition-all group border-l-2 ${
                    isActive
                      ? "bg-white/[0.06] border-brand-amber text-brand-amber"
                      : "border-transparent text-brand-bone/70 hover:bg-white/5 hover:text-brand-bone"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-2" : "group-hover:scale-110 transition-transform"}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 bg-white/[0.04] rounded-xl border border-white/10">
            <p className="font-display italic text-sm text-brand-bone/80 text-center leading-relaxed">
              "A Palavra é a nossa base.<br />
              O Espírito Santo é o nosso Mestre."
            </p>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="md:ml-72 pb-20 md:pb-0">
        {children}
        </main>
        </div>
        </ThemeProvider>
        );
        }
