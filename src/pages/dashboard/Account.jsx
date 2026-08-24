import React, { useState, useEffect } from "react";
import MembersAreaLayout from "../../components/MembersAreaLayout";
import { User, Mail, Lock, CheckCircle2, Camera } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function Account() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;
    const updated = { ...user, name, avatar };
    setUser(updated);
    localStorage.setItem("nomad_mock_user", JSON.stringify(updated));
    toast.success("Perfil atualizado com sucesso!");
  };

  return (
    <MembersAreaLayout>
      <div className="bg-[#08080a] min-h-screen text-white p-6 pt-12 md:p-12 md:pt-20 pb-24">
        <div className="max-w-4xl mx-auto flex flex-col" style={{ gap: "3rem" }}>
          
          {/* Header */}
          <div>
            <h1 className="font-sans font-bold text-3xl text-white tracking-tight">Minha Conta</h1>
            <p className="text-[#8f929d]" style={{ marginTop: "0.5rem" }}>Gerencie suas informações pessoais e segurança.</p>
          </div>

          <div className="grid md:grid-cols-3" style={{ gap: "2rem" }}>
            {/* Left Column - Profile Avatar */}
            <div className="col-span-1">
              <div 
                className="rounded-2xl p-6 text-center shadow-lg"
                style={{ backgroundColor: "#12141c", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Upload Avatar Container */}
                <div 
                  className="relative mx-auto mb-4 group cursor-pointer"
                  style={{ width: "100px", height: "100px" }}
                >
                  {/* Default User Silhouette */}
                  <div 
                    className="w-full h-full flex items-center justify-center overflow-hidden transition"
                    style={{ 
                      backgroundColor: "rgba(255,255,255,0.02)", 
                      borderRadius: "50%", 
                      border: "2px dashed rgba(255,255,255,0.2)" 
                    }}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} style={{ color: "#8f929d" }} />
                    )}
                  </div>
                  
                  {/* Camera Icon Badge */}
                  <div 
                    onClick={() => {
                      const url = prompt("Cole a URL da sua nova foto:");
                      if (url) setAvatar(url);
                    }}
                    className="absolute bottom-0 right-0 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                    style={{ 
                      width: "32px", 
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#C85B46", 
                      border: "3px solid #12141c" 
                    }}
                  >
                    <Camera size={14} color="#EBE1D5" />
                  </div>
                </div>
                <h2 className="font-bold text-lg">{user?.name || "Nômade Sapiens"}</h2>
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full mt-2"
                  style={{ backgroundColor: "#2C3A32", color: "#EBE1D5" }}
                >
                  <CheckCircle2 size={12} />
                  Aluno Ativo
                </div>
              </div>
            </div>

            {/* Right Column - Forms */}
            <div className="col-span-1 md:col-span-2 flex flex-col" style={{ gap: "2rem" }}>
              
              {/* Personal Info */}
              <div 
                className="rounded-2xl p-6 md:p-8"
                style={{ backgroundColor: "#12141c", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <User size={18} style={{ color: "#EBE1D5" }} />
                  Informações Pessoais
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8f929d" }}>Nome Completo</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-white focus:outline-none transition"
                      style={{ backgroundColor: "#08080a", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8f929d" }}>E-mail</label>
                    <input 
                      type="email" 
                      value={user?.email || ""} 
                      className="w-full rounded-xl px-4 py-3 text-white focus:outline-none transition"
                      style={{ backgroundColor: "#08080a", border: "1px solid rgba(255,255,255,0.1)", opacity: 0.7 }}
                      disabled
                    />
                    <p className="text-[11px] text-gray-500 mt-1">O e-mail não pode ser alterado. Contate o suporte.</p>
                  </div>
                  <button 
                    onClick={handleSave}
                    className="font-bold py-3 px-6 rounded-xl transition text-sm"
                    style={{ backgroundColor: "#C85B46", color: "#EBE1D5" }}
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>

              {/* Password */}
              <div 
                className="rounded-2xl p-6 md:p-8"
                style={{ backgroundColor: "#12141c", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Lock size={18} style={{ color: "#EBE1D5" }} />
                  Segurança
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8f929d" }}>Nova Senha</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full rounded-xl px-4 py-3 text-white focus:outline-none transition"
                      style={{ backgroundColor: "#08080a", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <button 
                    className="bg-transparent text-white font-bold py-3 px-6 rounded-xl transition text-sm hover:bg-white/5"
                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    Atualizar Senha
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </MembersAreaLayout>
  );
}
