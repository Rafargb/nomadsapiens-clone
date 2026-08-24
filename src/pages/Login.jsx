import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatError } from "../lib/api";
import Navbar from "../components/Navbar";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import heroImg from "../assets/hero.png";

export default function Login() {
  const { login } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = new URLSearchParams(location.search).get("redirect") || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success(language === "pt" ? "Bem-vindo de volta!" : "Welcome back!");
      if (loggedUser?.role === "admin") {
        navigate("/dashboard/admin");
      } else if (loggedUser?.role === "producer") {
        navigate("/dashboard/producer");
      } else if (loggedUser?.role === "affiliate") {
        navigate("/dashboard/affiliate");
      } else {
        navigate(redirect);
      }
    } catch (e) {
      toast.error(formatError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex text-[#161111]">
      <Navbar />

      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 md:p-24 lg:px-32 xl:px-40 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-10">
            <h1 className="font-black text-4xl tracking-tight mb-2" style={{ fontFamily: "'Inter', sans-serif", color: "#161111" }}>
              {language === "pt" ? "Acesse sua conta" : "Sign in"}
            </h1>
            <p className="text-[#5D6068] font-medium text-sm">
              {language === "pt" ? "Preencha seus dados abaixo para entrar." : "Enter your credentials to access your account."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-[#5D6068] ml-1 mb-2 block">{t("auth.email")}</label>
              <input
                data-testid="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-[#E4E4E6] rounded-xl py-3.5 px-4 text-[#161111] placeholder-[#9B9BA2] focus:outline-none focus:border-[#C05746] focus:ring-4 focus:ring-[#C05746]/10 transition-all font-medium"
                placeholder={t("auth.placeholderEmail")}
              />
            </div>

            <div>
              <div className="flex items-center justify-between ml-1 mb-2">
                <label className="text-sm font-bold text-[#5D6068]">{t("auth.password")}</label>
                <Link to="/forgot-password" className="text-xs font-bold text-[#C05746] hover:text-[#8a3d31]">
                  {language === "pt" ? "Esqueceu a senha?" : "Forgot password?"}
                </Link>
              </div>
              <input
                data-testid="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-[#E4E4E6] rounded-xl py-3.5 px-4 text-[#161111] placeholder-[#9B9BA2] focus:outline-none focus:border-[#C05746] focus:ring-4 focus:ring-[#C05746]/10 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full mt-2 bg-[#C05746] hover:bg-[#a5493b] text-white font-bold rounded-xl py-4 shadow-lg shadow-[#C05746]/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (language === "pt" ? "Entrando..." : "Signing in...") : (language === "pt" ? "Entrar" : "Sign In")}
            </button>
          </form>

          <div className="text-center mt-10 text-sm font-medium text-[#5D6068]">
            {language === "pt" ? "Não tem uma conta?" : "Don't have an account?"}{" "}
            <Link to="/register" className="text-[#C05746] hover:text-[#8a3d31] font-bold transition-colors">
              {language === "pt" ? "Cadastre-se" : "Sign Up"}
            </Link>
          </div>

        </div>
      </div>

      {/* Right Side: Image (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 p-4 lg:p-6 bg-white">
        <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden shadow-2xl">
          <img 
            src={heroImg} 
            alt="Nomad Sapiens" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          <div className="absolute bottom-16 left-12 right-12 z-10 text-white">
            <h2 className="text-4xl font-black mb-4 leading-tight tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              Sua jornada de<br/>evolução continua
            </h2>
            <p className="text-[#EBE1D5] text-lg font-medium max-w-md leading-relaxed">
              Bem-vindo de volta à Nomad Sapiens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
