import React, { useState } from "react";
import MembersAreaLayout from "../../components/MembersAreaLayout";
import { HelpCircle, Mail, MessageCircle, ChevronDown, Sparkles, Send, PlayCircle, Info, User, Flame, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getTickets, getUserTickets, createTicket, replyTicket, closeTicket } from "../../lib/supportStore";
import { toast } from "sonner";

export default function Support() {
  const { user } = useAuth();
  const [chatMessage, setChatMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' or 'tickets'
  const [newTicketMsg, setNewTicketMsg] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [replyMsg, setReplyMsg] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const loadTickets = () => {
    if (user?.role === 'producer' || user?.role === 'admin') {
      setTickets(getTickets());
      setActiveTab("tickets"); // Force tickets tab for producer
    } else if (user) {
      setTickets(getUserTickets(user.id));
    }
  };

  React.useEffect(() => {
    loadTickets();
    window.addEventListener("support_updated", loadTickets);
    return () => window.removeEventListener("support_updated", loadTickets);
  }, [user]);

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicketSubject || !newTicketMsg) return;
    createTicket(user.id, user.name || "Aluno", newTicketSubject, newTicketMsg);
    setNewTicketSubject("");
    setNewTicketMsg("");
    toast.success("Ticket enviado com sucesso! Aguarde a resposta.");
  };

  const handleReply = (e, ticketId) => {
    e.preventDefault();
    if (!replyMsg) return;
    replyTicket(ticketId, replyMsg);
    setReplyMsg("");
    toast.success("Resposta enviada!");
  };

  const handleClose = (ticketId) => {
    closeTicket(ticketId);
    toast.success("Ticket encerrado.");
  };

  return (
    <MembersAreaLayout>
      <div className="bg-[#08080a] min-h-screen text-white p-6 pt-12 md:p-12 md:pt-16 pb-32">
        <div className="max-w-6xl mx-auto flex flex-col" style={{ gap: "2rem" }}>
          
          {/* Header */}
          <div>
            <h1 className="font-sans font-bold text-3xl md:text-4xl text-white tracking-tight flex items-center gap-3">
              <Flame className="text-[#C85B46]" size={32} />
              Central Sapiens
            </h1>
            <p className="text-[#8f929d] mt-2 text-lg">Invoque a sabedoria do Sapiens ou fale com um humano.</p>
          </div>

          {(user?.role !== 'producer' && user?.role !== 'admin') && (
            <div className="flex gap-4 border-b border-white/10 pb-4">
              <button 
                onClick={() => setActiveTab("ai")} 
                className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'ai' ? 'bg-[#C85B46] text-white' : 'bg-white/5 text-[#8f929d] hover:text-white'}`}
              >
                Tutor IA (Sapiens)
              </button>
              <button 
                onClick={() => setActiveTab("tickets")} 
                className={`px-4 py-2 rounded-lg font-bold transition ${activeTab === 'tickets' ? 'bg-[#C85B46] text-white' : 'bg-white/5 text-[#8f929d] hover:text-white'}`}
              >
                Meus Tickets (Humano)
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-3" style={{ gap: "2rem" }}>
            
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: "#2C3A32", border: "1px solid rgba(44,58,50,0.5)", height: "600px" }}>
              
              {activeTab === 'ai' ? (
                <>
                  {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#C85B46" }}>
                    <Flame size={20} color="white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Sapiens</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      <span className="text-xs text-orange-500 font-medium">Fogo aceso. Pronto para ajudar.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto flex flex-col" style={{ gap: "1.5rem" }}>
                
                {/* AI Welcome Message */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ backgroundColor: "rgba(200, 91, 70, 0.1)", border: "1px solid rgba(200, 91, 70, 0.3)" }}>
                    <Flame size={14} color="#C85B46" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed max-w-[85%]" style={{ backgroundColor: "#2C3A32", border: "1px solid rgba(44,58,50,0.5)" }}>
                    <p className="mb-2">Uga! Olá, {user?.name?.split(' ')[0] || 'Nômade'}! Eu sou o <strong>Sapiens</strong>, o guardião do conhecimento da nossa tribo.</p>
                    <p>Eu explorei todas as cavernas (módulos) e gravei cada palavra ensinada aqui. O que você busca?</p>
                    <ul className="mt-3 space-y-2 text-[#8f929d]">
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EBE1D5]"></div> "Em qual aula descubro o fogo da contingência?"</li>
                      <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#EBE1D5]"></div> "Traduza as pinturas rupestres do Módulo 2."</li>
                    </ul>
                  </div>
                </div>

                {/* User Message (Mock) */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed max-w-[85%]" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                    <p>Mestre Sapiens, onde encontro o ritual para instalar o Pixel do Facebook? Estou caçando no escuro.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <User size={14} color="white" />
                  </div>
                </div>

                {/* AI Response (Mock) */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" style={{ backgroundColor: "rgba(200, 91, 70, 0.1)", border: "1px solid rgba(200, 91, 70, 0.3)" }}>
                    <Flame size={14} color="#C85B46" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed max-w-[85%]" style={{ backgroundColor: "#2C3A32", border: "1px solid rgba(44,58,50,0.5)" }}>
                    <p>Achei a trilha! O ancião explica a instalação do Pixel no <strong>Módulo 3: Tráfego Pago Avançado</strong>, na <strong>Aula 05</strong>.</p>
                    <p className="mt-2">A sabedoria prática começa exatamente no <strong>minuto 12:45</strong> da gravação.</p>
                    
                    <button className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition hover:opacity-80" style={{ backgroundColor: "rgba(200, 91, 70, 0.15)", color: "#C85B46", border: "1px solid rgba(200, 91, 70, 0.3)" }}>
                      <PlayCircle size={16} />
                      Viajar para a Aula 05
                    </button>
                  </div>
                </div>

              </div>

              {/* Chat Input Area */}
              <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)" }}>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Pergunte ao Sapiens..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="w-full bg-[#08080a] text-white text-sm rounded-xl py-4 pl-5 pr-14 focus:outline-none transition"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition hover:scale-105"
                    style={{ backgroundColor: chatMessage ? "#C85B46" : "rgba(255,255,255,0.05)", color: chatMessage ? "white" : "#8f929d" }}
                  >
                    <Send size={18} className={chatMessage ? "ml-1" : ""} />
                  </button>
                </div>
                <p className="text-center text-[10px] mt-3" style={{ color: "#8f929d" }}>Até os sábios erram. Sempre verifique as informações.</p>
              </div>
                </>
              ) : (
                <div className="flex flex-col h-full bg-[#12141c]">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1d27]">
                    <h2 className="font-bold text-lg">
                      {user?.role === 'producer' || user?.role === 'admin' ? "Caixa de Entrada (Alunos)" : "Meus Chamados"}
                    </h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {tickets.length === 0 ? (
                      <div className="text-center py-10 text-[#8f929d]">Nenhum ticket encontrado.</div>
                    ) : (
                      tickets.map(t => (
                        <div key={t.id} className="bg-[#0c0d12] border border-white/5 rounded-xl p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg text-white">{t.subject}</h3>
                              <p className="text-xs text-[#8f929d] mt-1">Por: {t.user_name} • {new Date(t.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-500/20 text-orange-400' : t.status === 'answered' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                {t.status === 'open' ? 'Aberto' : t.status === 'answered' ? 'Respondido' : 'Resolvido'}
                              </span>
                              {(user?.role === 'producer' || user?.role === 'admin') && t.status !== 'closed' && (
                                <button onClick={() => handleClose(t.id)} className="btn-ghost text-xs !py-1 !px-2"><Check size={14}/> Fechar</button>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4 mb-4">
                            {t.messages.map((m, i) => (
                              <div key={i} className={`p-4 rounded-xl text-sm ${m.sender === 'student' ? 'bg-white/5 border border-white/10' : 'bg-[#C85B46]/10 border border-[#C85B46]/20'}`}>
                                <div className="font-bold mb-1 text-xs text-[#8f929d]">{m.sender === 'student' ? 'Aluno' : 'Suporte Sapiens'}</div>
                                <p className="text-white/90">{m.text}</p>
                              </div>
                            ))}
                          </div>
                          
                          {(user?.role === 'producer' || user?.role === 'admin') && t.status !== 'closed' && (
                            <form onSubmit={(e) => handleReply(e, t.id)} className="mt-4 flex gap-3">
                              <input required value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Digite sua resposta..." className="flex-1 bg-[#1a1d27] rounded-lg px-4 text-sm border border-white/10 outline-none" />
                              <button type="submit" className="bg-[#C85B46] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#a84c3a] transition">Responder</button>
                            </form>
                          )}
                        </div>
                      ))
                    )}
                    
                    {/* Formulário para Aluno criar novo ticket */}
                    {(user?.role !== 'producer' && user?.role !== 'admin') && (
                      <div className="mt-8 pt-6 border-t border-white/5">
                        <h3 className="font-bold text-lg mb-4">Abrir Novo Chamado</h3>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                          <input required value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} placeholder="Assunto da dúvida" className="w-full bg-[#1a1d27] rounded-lg p-4 text-sm border border-white/10 outline-none" />
                          <textarea required value={newTicketMsg} onChange={e => setNewTicketMsg(e.target.value)} placeholder="Explique sua dúvida com detalhes..." rows={4} className="w-full bg-[#1a1d27] rounded-lg p-4 text-sm border border-white/10 outline-none" />
                          <button type="submit" className="bg-[#C85B46] px-6 py-3 rounded-lg font-bold hover:bg-[#a84c3a] transition">Enviar Chamado</button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Human Support */}
            <div className="lg:col-span-1 flex flex-col" style={{ gap: "1.5rem" }}>
              
              <div className="rounded-2xl p-6" style={{ backgroundColor: "#2C3A32", border: "1px solid rgba(44,58,50,0.5)" }}>
                <h2 className="font-bold text-lg mb-1">Atendimento Humano</h2>
                <p className="text-sm mb-6" style={{ color: "#8f929d" }}>Questões financeiras ou de acesso que a IA não pode resolver.</p>

                <div className="flex flex-col" style={{ gap: "1rem" }}>
                  <a 
                    href="mailto:suporte@intensemodels.com" 
                    className="transition rounded-xl p-4 flex items-center gap-4 group hover:bg-[#1a1d27]"
                    style={{ border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:text-[#C85B46] transition" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">E-mail</h3>
                      <p className="text-xs" style={{ color: "#8f929d" }}>Resposta em até 24h</p>
                    </div>
                  </a>

                  <a 
                    href="#" 
                    className="transition rounded-xl p-4 flex items-center gap-4 group hover:bg-[#1a1d27]"
                    style={{ border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:text-[#C85B46] transition" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">WhatsApp</h3>
                      <p className="text-xs" style={{ color: "#8f929d" }}>Horário comercial</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Info Box */}
              <div className="rounded-2xl p-5 flex items-start gap-3" style={{ backgroundColor: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.1)" }}>
                <Info size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed" style={{ color: "#a1a1aa" }}>
                  <strong className="text-white">Dica:</strong> Se você estiver assistindo a uma aula, pode usar o Tutor IA diretamente no menu lateral do player sem sair do vídeo!
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </MembersAreaLayout>
  );
}
