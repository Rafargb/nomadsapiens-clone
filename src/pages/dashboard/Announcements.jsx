import React from "react";
import MembersAreaLayout from "../../components/MembersAreaLayout";
import { Bell, Calendar, Link as LinkIcon, Plus } from "lucide-react";
import { getAnnouncements, createAnnouncement } from "../../lib/announcementStore";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = React.useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", type: "update", content: "", link: "" });

  const load = () => setAnnouncements(getAnnouncements());

  React.useEffect(() => {
    load();
    window.addEventListener("announcements_updated", load);
    return () => window.removeEventListener("announcements_updated", load);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    createAnnouncement(form);
    setForm({ title: "", type: "update", content: "", link: "" });
    setDialogOpen(false);
    toast.success("Aviso publicado com sucesso!");
  };

  return (
    <MembersAreaLayout>
      <div className="bg-[#08080a] min-h-screen text-white p-6 pt-12 md:p-12 md:pt-20 pb-24">
        <div className="max-w-3xl mx-auto flex flex-col" style={{ gap: "3rem" }}>
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "rgba(200, 91, 70, 0.1)", color: "#C85B46" }}
              >
                <Bell size={28} />
              </div>
              <div>
                <h1 className="font-sans font-bold text-3xl md:text-4xl text-white tracking-tight">Canal de Avisos</h1>
                <p className="text-[#8f929d] mt-2 text-base">Fique por dentro das novidades e links importantes.</p>
              </div>
            </div>
            {(user?.role === 'admin' || user?.role === 'producer') && (
              <button onClick={() => setDialogOpen(true)} className="btn-primary text-sm flex items-center gap-2 px-4 py-2">
                <Plus size={16} /> Novo Aviso
              </button>
            )}
          </div>

          {/* Feed */}
          <div className="flex flex-col mt-12" style={{ gap: "2rem" }}>
            {announcements.map((item) => (
              <div 
                key={item.id} 
                className="rounded-2xl p-6 relative overflow-hidden group"
                style={{ backgroundColor: "#12141c", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {/* Accent Line */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "#C85B46" }}
                ></div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={item.type === 'live' 
                          ? { backgroundColor: "#C85B46", color: "#EBE1D5" } 
                          : { backgroundColor: "#2C3A32", color: "#EBE1D5" }
                        }
                      >
                        {item.type === 'live' ? 'Aviso de Live' : 'Atualização'}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "#8f929d" }}>
                        <Calendar size={12} /> {new Date(item.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2">{item.title}</h2>
                    <p className="text-[#8f929d] text-sm leading-relaxed mb-4">
                      {item.content}
                    </p>
                    
                    {item.link && (
                      <button 
                        className="flex items-center gap-2 text-sm font-medium transition hover:opacity-80"
                        style={{ color: "#C85B46" }}
                      >
                        <LinkIcon size={14} />
                        Acessar Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-white" onClick={() => setDialogOpen(false)}>
          <div className="nomad-card max-w-md w-full p-8" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#12141c" }}>
            <h3 className="font-heading font-black text-2xl mb-6 text-white">Publicar Aviso</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white">Título</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Tipo</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none mt-1.5">
                  <option value="update">Atualização / Novo Conteúdo</option>
                  <option value="live">Aviso de Live / Mentoria</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Mensagem</label>
                <textarea required rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none mt-1.5"></textarea>
              </div>
              <div>
                <label className="text-sm font-semibold text-white">Link (opcional)</label>
                <input value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="w-full bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none mt-1.5" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setDialogOpen(false)} className="flex-1 bg-white/10 hover:bg-white/20 transition rounded-xl font-bold py-3">Cancelar</button>
                <button type="submit" className="flex-1 text-white bg-[#C05746] hover:bg-[#a84c3a] rounded-xl font-bold py-3 transition">Publicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MembersAreaLayout>
  );
}
