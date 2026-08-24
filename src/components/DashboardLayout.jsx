import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Share2, Briefcase, GraduationCap, Shield, LogOut, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [];
  items.push({ to: "/dashboard", label: "Área de Membros", icon: LayoutDashboard, end: true });

  if (user?.role === "student" || user?.role === "admin") {
    items.push({ to: "/dashboard/courses", label: "Meus cursos", icon: GraduationCap });
  }
  if (user?.role === "affiliate" || user?.role === "producer" || user?.role === "admin") {
    items.push({ to: "/dashboard/affiliate", label: "Afiliado", icon: Share2 });
  }
  if (user?.role === "producer" || user?.role === "admin") {
    items.push({ to: "/dashboard/producer", label: "Área do Produtor", icon: Briefcase, end: false });
  }
  if (user?.role === "admin") {
    items.push({ to: "/dashboard/admin", label: "Admin", icon: Shield });
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8] flex font-sans">
      <aside className="hidden lg:flex flex-col w-72 bg-[#161111] sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2.5 p-6 border-b border-white/10 hover:opacity-80 transition-opacity">
          <img src="/nomad-sapiens-white.png" alt="Nomad Sapiens" className="object-contain" style={{ height: '48px' }} />
        </Link>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`sidebar-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition ${
                  isActive
                    ? "bg-[#C05746] text-white shadow-lg"
                    : "text-[#9B9BA2] hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <it.icon size={18} />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-[#C05746] text-white flex items-center justify-center font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate text-white">{user?.name}</div>
              <div className="text-xs text-[#9B9BA2] capitalize">{user?.role}</div>
            </div>
            <button onClick={handleLogout} data-testid="sidebar-logout" className="text-[#9B9BA2] hover:text-[#F56D41]">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="border-b border-[#E4E4E6] bg-[#F6F6F8]/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="px-6 md:px-10 py-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#F56D41] mb-1">Dashboard · {user?.role}</div>
            <h1 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-[#161111] mt-1">{title}</h1>
            {subtitle && <p className="text-[#5D6068] mt-1">{subtitle}</p>}
          </div>
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
