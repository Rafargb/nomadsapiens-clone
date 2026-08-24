import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Compass,
  Home,
  GraduationCap,
  HelpCircle,
  LogOut,
  User,
  Menu,
  Camera,
  Briefcase
} from "lucide-react";

export default function MembersAreaLayout({ children }) {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/dashboard" && location.pathname === "/dashboard") return true;
    if (path !== "/dashboard" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen player-container flex flex-col select-none bg-[#08080a]">
      {/* 1. Top Header (Netflix Style) */}
      <header className={`h-20 shrink-0 z-50 flex items-center justify-between px-6 md:px-10 fixed top-0 w-full transition-all duration-500 ${
        isScrolled 
          ? "bg-[#08080a]/90 backdrop-blur-md border-b border-white/5 shadow-lg" 
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent"
      }`}>
        
        {/* Left Side: Logo and Links */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 transition hover:opacity-80">
             <img src="/nomad-sapiens-white.png" alt="Nomad Sapiens" className="hidden sm:block object-contain" style={{ height: '40px' }} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { icon: Home, label: "Início", path: "/dashboard" },
              { icon: User, label: "Minha Conta", path: "/dashboard/account" },
              { icon: Compass, label: "Avisos", path: "/dashboard/announcements" },
              { icon: HelpCircle, label: "Suporte", path: "/dashboard/support" }
            ].map((item, idx) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "text-white bg-white/10"
                      : "text-[#8f929d] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Profile and Logout */}
        <div className="flex items-center gap-4">
          {(user?.role === "producer" || user?.role === "admin") && (
            <Link 
              to={user?.role === "admin" ? "/dashboard/admin" : "/dashboard/producer"} 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#F56D41]/10 text-[#F56D41] hover:bg-[#F56D41]/20 rounded-full text-sm font-bold transition-colors border border-[#F56D41]/20"
              title="Painel Administrativo"
            >
              <Briefcase size={16} />
              <span>Painel Produtor</span>
            </Link>
          )}

          <Link to="/dashboard/account" className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition cursor-pointer">
            <div className="text-right hidden lg:block">
              <div className="font-bold text-sm text-white leading-tight">{user?.name || "Gustavo Gomes"}</div>
              <div className="text-[11px] text-[#8f929d]">Aluno Vip</div>
            </div>
            <div className="relative">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden transition rounded-full border border-white/5 bg-[#1a1c24]">
                <User size={18} className="text-[#8f929d]" />
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8f929d] hover:text-[#F56D41] hover:bg-[#F56D41]/10 transition"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full relative pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#0c0d12]/90 backdrop-blur-md flex items-center justify-around p-3 z-50 border-t border-white/5">
            {[
              { icon: Home, label: "Início", path: "/dashboard", show: true },
              { icon: Compass, label: "Avisos", path: "/dashboard/announcements", show: true },
              { icon: User, label: "Conta", path: "/dashboard/account", show: true },
              { icon: Briefcase, label: "Painel", path: user?.role === "admin" ? "/dashboard/admin" : "/dashboard/producer", show: user?.role === "producer" || user?.role === "admin" }
            ].filter(item => item.show).map((item, idx) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`flex flex-col items-center gap-1.5 transition-colors ${
                    active ? "text-[#F56D41]" : "text-[#8f929d]"
                  }`}
                >
                  <item.icon size={22} className={active ? "fill-[#F56D41]/20" : ""} />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </Link>
              );
            })}
      </nav>
    </div>
  );
}
