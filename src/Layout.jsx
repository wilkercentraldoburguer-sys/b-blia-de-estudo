import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, BookOpen, BookMarked, Video, User, Users, Settings, Brain } from "lucide-react";
import { ThemeProvider } from "./components/personalization/ThemeProvider";

export default function Layout({ children, currentPageName }) {
  const menuItems = [
    { name: "Home", label: "Início", icon: Home },
    { name: "BibliaLeitura", label: "Leitura", icon: BookOpen },
    { name: "Bible", label: "Estudo", icon: BookMarked },
    { name: "Quiz", label: "Quiz", icon: Brain },
    { name: "Community", label: "Comunidade", icon: Users },
    { name: "Sermons", label: "Ministrações", icon: Video },
    { name: "Settings", label: "Configurações", icon: Settings },
    { name: "Profile", label: "Perfil", icon: User }
  ];

  return (
    <ThemeProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/50 shadow-2xl z-50">
        <div className="flex justify-around items-center py-2 px-2">
          {menuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-lg scale-105"
                    : "text-slate-500 hover:text-white hover:bg-stone-700"
                }`}
                style={isActive ? { backgroundColor: '#722f37' } : {}}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "stroke-2 scale-110" : ""}`} />
                <span className="text-xs font-semibold">{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 border-r border-slate-200/50 shadow-2xl backdrop-blur-sm">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Bíblia App</h1>
              <p className="text-xs text-blue-100">Sua jornada espiritual</p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "text-slate-700 hover:bg-white/80 hover:shadow-md hover:scale-102"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-2" : "group-hover:scale-110 transition-transform"}`} />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50 shadow-inner">
            <p className="text-xs text-slate-700 text-center font-medium leading-relaxed">
              "A Palavra é a nossa base.<br />
              O Espírito Santo é o nosso Mestre."
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 pb-20 md:pb-0">
        {children}
        </main>
        </div>
        </ThemeProvider>
        );
        }