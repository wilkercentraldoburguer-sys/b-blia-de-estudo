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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
        <p className="text-white mt-4">Redirecionando...</p>
      </div>
    </div>
  );
}