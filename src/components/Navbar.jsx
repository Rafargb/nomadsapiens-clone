import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X, Compass, LogOut, User, Briefcase } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: t("navbar.home") },
    { to: "/courses", label: t("navbar.courses") },
    { to: "/affiliates", label: t("navbar.affiliates") },
  ];

  const isLandingPage = location.pathname === "/" || location.pathname === "/affiliates" || location.pathname === "/courses";
  const navTheme = !isLandingPage || scrolled ? "light" : "transparent";
  const isLightNav = navTheme === "light";

  return (
    <header
      data-testid="main-navbar"
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        navTheme === "light"
          ? "bg-white shadow-sm border-b border-[#E4E4E6]"
          : "bg-transparent"
      }`}
    >
      <div className="nomad-container flex items-center justify-between h-20">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
          <img 
            src="/nomad-sapiens-white.png" 
            alt="Nomad Sapiens" 
            className="object-contain transition-all duration-300"
            style={{ height: '60px', filter: isLightNav ? 'invert(1)' : 'none' }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                  isActive
                    ? isLightNav
                      ? "bg-gray-100 text-[#202124]"
                      : "bg-white/20 text-white"
                    : isLightNav
                      ? "text-[#5D6068] hover:text-[#202124] hover:bg-gray-50"
                      : "text-[#E6D7C3] hover:text-white hover:bg-white/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {(user.role === "admin" || user.role === "producer") && (
                  <Link
                    to={user.role === "admin" ? "/dashboard/admin" : "/dashboard/producer"}
                    className={isLightNav ? "inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-[#202124] rounded-full text-sm font-bold transition-colors" : "inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-bold transition-colors hover:bg-white/30"}
                  >
                    <Briefcase size={16} /> Painel {user.role === "admin" ? "Admin" : "Produtor"}
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  data-testid="nav-dashboard-btn"
                  className={isLightNav ? "inline-flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-full text-[#5D6068] hover:bg-gray-50 hover:text-[#202124] transition-all duration-300" : "inline-flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-full text-white hover:bg-white/10 transition-all duration-300"}
                >
                  <User size={16} /> {user.name?.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  data-testid="nav-logout-btn"
                  className={isLightNav ? "inline-flex items-center justify-center font-medium text-sm p-2.5 rounded-full text-[#5D6068] hover:bg-gray-50 hover:text-[#202124] transition-all duration-300" : "inline-flex items-center justify-center font-medium text-sm p-2.5 rounded-full text-white hover:bg-white/10 transition-all duration-300"}
                  aria-label="Sair"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-btn"
                  className={isLightNav ? "inline-flex items-center justify-center font-medium text-sm px-4 py-2 rounded-full text-[#5D6068] hover:bg-gray-50 hover:text-[#202124] transition-all duration-300" : "inline-flex items-center justify-center font-medium text-sm px-4 py-2 rounded-full text-white hover:bg-white/10 transition-all duration-300"}
                >
                  {t("navbar.signin")}
                </Link>
                <Link to="/register" data-testid="nav-register-btn" className="btn-primary text-sm !py-2.5 !px-5">
                  {t("navbar.start")}
                </Link>
              </>
            )}
          </div>

          {/* Language Switcher button */}
          <button
            onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border flex items-center gap-1.5 ${
              isLightNav
                ? "border-[#E4E4E6] text-[#5D6068] hover:bg-gray-50"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
            aria-label="Switch Language"
          >
            <span>{language === "pt" ? "🇺🇸" : "🇧🇷"}</span>
            <span>{language === "pt" ? "EN" : "PT"}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            data-testid="nav-mobile-toggle"
            className={`md:hidden p-2 rounded-full transition-all duration-300 ${
              isLightNav ? "hover:bg-gray-50 text-[#202124]" : "hover:bg-white/10 text-white"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#E4E4E6] bg-white">
          <div className="nomad-container py-4 flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-gray-50 font-medium text-[#202124]"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                {(user.role === "admin" || user.role === "producer") && (
                  <Link to={user.role === "admin" ? "/dashboard/admin" : "/dashboard/producer"} onClick={() => setOpen(false)} className="btn-primary justify-center !bg-[#F56D41] !text-white">
                    Painel {user.role === "admin" ? "Admin" : "Produtor"}
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-secondary justify-center">
                  {t("navbar.dashboard")}
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  {t("navbar.signout")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary justify-center text-nomad-ink">
                  {t("navbar.signin")}
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary justify-center">
                  {t("navbar.start")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
