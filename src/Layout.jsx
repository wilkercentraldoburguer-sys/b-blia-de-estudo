import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { Home, BookOpen, BookMarked, Video, User, Users, Settings, Brain } from "lucide-react";
import { ThemeProvider } from "./components/personalization/ThemeProvider";

export default function Layout({ children, currentPageName }) {
  const menuItems = [
    { name: "Home", label: "Início", icon: Home },
    { name: "Bible", label: "Bíblia", icon: BookOpen },
    { name: "Study", label: "Estudo", icon: BookMarked },
    { name: "Quiz", label: "Quiz", icon: Brain },
    { name: "Community", label: "Comunidade", icon: Users },
    { name: "Sermons", label: "Ministrações", icon: Video },
    { name: "Settings", label: "Configurações", icon: Settings },
    { name: "Profile", label: "Perfil", icon: User }
  ];

  return (
    <ThemeProvider>
    <div className="min-h-screen">
      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex justify-around items-center py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.name;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-blue-900 bg-blue-50"
                    : "text-slate-500 hover:text-blue-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-10 h-10 text-blue-900" />
            <div>
              <h1 className="text-xl font-bold text-blue-900">App Bíblico</h1>
              <p className="text-sm text-slate-600">Versão Padrão</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-blue-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 bg-blue-50">
          <p className="text-xs text-slate-600 text-center italic leading-relaxed">
            "A Palavra é a nossa base.<br />
            O Espírito Santo é o nosso Mestre."
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {children}
        </main>
        </div>
        </ThemeProvider>
        );
        }