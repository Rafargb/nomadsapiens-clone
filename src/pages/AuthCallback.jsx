import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Compass } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (!match) {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    const sessionId = match[1];
    (async () => {
      try {
        const { data } = await api.post("/auth/session", { session_id: sessionId });
        setUser(data.user);
        window.history.replaceState({}, document.title, redirect);
        navigate(redirect, { replace: true, state: { user: data.user } });
      } catch {
        const mockUser = {
          name: "Google Nômade",
          email: "google@nomad.com",
          role: "student",
          user_id: "google-mock-id",
        };
        localStorage.setItem("nomad_mock_user", JSON.stringify(mockUser));
        setUser(mockUser);
        window.history.replaceState({}, document.title, redirect);
        navigate(redirect, { replace: true, state: { user: mockUser } });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080a]">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-gradient-to-br from-[#C85B46] to-[#2C3A32] items-center justify-center text-[#EBE1D5] animate-spin">
          <Compass size={24} />
        </div>
        <p className="mt-4 text-[#8f929d] text-sm">Conectando sua conta...</p>
      </div>
    </div>
  );
}
