import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function Champions() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para Home
    window.location.href = createPageUrl("Home");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-foreground mx-auto"></div>
        <p className="text-primary-foreground mt-4">Redirecionando...</p>
      </div>
    </div>
  );
}