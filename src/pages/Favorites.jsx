import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Favorites() {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        return await base44.entities.Favorite.list('-created_date');
      } catch (error) {
        console.error("Error loading favorites:", error);
        return [];
      }
    },
    initialData: [],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (id) => base44.entities.Favorite.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-current" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">Meus Favoritos</h1>
        </div>

        {favorites.length === 0 ? (
          <Card className="bg-white shadow-lg">
            <CardContent className="py-12 sm:py-16 md:py-20 text-center px-4">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-base sm:text-lg">
                Você ainda não tem versículos favoritos.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-2">
                Comece marcando versículos especiais durante sua leitura!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            <AnimatePresence>
              {favorites.map((favorite) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-amber-600 font-bold text-base sm:text-lg">
                          {favorite.book} {favorite.chapter}:{favorite.verse}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavoriteMutation.mutate(favorite.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                      <p className="text-slate-700 text-sm sm:text-base md:text-lg leading-relaxed italic break-words">
                        "{favorite.text}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}