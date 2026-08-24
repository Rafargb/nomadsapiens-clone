import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Compass } from "lucide-react";

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080a]">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-[#C85B46] to-[#2C3A32] items-center justify-center text-[#EBE1D5] animate-spin">
          <Compass size={24} />
        </div>
        <p className="mt-4 text-[#8f929d] text-sm">Carregando...</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role) && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
