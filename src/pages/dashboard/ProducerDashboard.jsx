import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { toast } from "sonner";
import { 
  Plus, Trash2, Settings2, Lock, Unlock, 
  ChevronLeft, LayoutGrid, PlayCircle, Clock, Link as LinkIcon, Edit3, CheckCircle2, Eye, DollarSign, Wallet, History, ArrowUpRight
} from "lucide-react";
import { getCourses, saveCourses, COURSE_CATEGORIES } from "../../lib/courseStore";
import { getProducerStats, requestWithdrawal } from "../../lib/transactionStore";
import { formatCurrency } from "../../lib/api";
import FileUploader from "../../components/FileUploader";
import { useAuth } from "../../context/AuthContext";

export default function ProducerDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    getCourses().then(setCourses);
  }, []);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Navigation State (Drill-down)
  const [activeTab, setActiveTab] = useState("courses");
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);

  // Financial State
  const [stats, setStats] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    if (activeTab === "finance" && user) {
      getProducerStats(user.id).then(setStats);
    }
  }, [activeTab, user]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!walletAddress || !withdrawAmount) return toast.error("Preencha o valor e a carteira.");
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return toast.error("Valor inválido.");
    if (amt > stats.available_balance) return toast.error("Saldo insuficiente.");
    
    await requestWithdrawal(user.id, amt, walletAddress);
    toast.success("Saque solicitado com sucesso! A liberação ocorrerá na sua carteira Liquid em breve.");
    setWithdrawAmount("");
    setWalletAddress("");
    getProducerStats(user.id).then(setStats);
  };

  // Modals
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  // DATA OPERATIONS
  const handleSaveAll = () => {
    saveCourses(courses);
    window.dispatchEvent(new Event("courses_updated"));
    setHasChanges(false);
    toast.success("Alterações salvas com sucesso!");
  };

  const updateCourses = (updater) => {
    setCourses(prev => {
      const next = updater(prev);
      saveCourses(next); // Auto-save to localStorage instantly!
      window.dispatchEvent(new Event("courses_updated")); // Notify other components
      return next;
    });
    setHasChanges(false); // No pending changes anymore
  };

  // -------------------------------------------------------------
  // COURSE ACTIONS (Level 1)
  // -------------------------------------------------------------
  const saveCourse = (e) => {
    e.preventDefault();
    updateCourses(prev => {
      const isNew = !editingCourse.id;
      const finalItem = isNew ? { ...editingCourse, id: `course-${Date.now()}`, producerId: user.id || "prod-1" } : editingCourse;
      return isNew ? [...prev, finalItem] : prev.map(c => c.id === finalItem.id ? finalItem : c);
    });
    setEditingCourse(null);
  };

  const removeCourse = (courseId) => {
    if (!window.confirm("Tem certeza que deseja excluir este curso inteiro e todos os módulos?")) return;
    updateCourses(prev => prev.filter(c => c.id !== courseId));
    if (activeCourseId === courseId) setActiveCourseId(null);
  };

  // -------------------------------------------------------------
  // MODULE ACTIONS (Level 2)
  // -------------------------------------------------------------
  const saveModule = (e) => {
    e.preventDefault();
    updateCourses(prev => {
      return prev.map(c => {
        if (c.id !== activeCourseId) return c;
        const isNew = !editingModule.id;
        const finalMod = isNew ? { ...editingModule, id: `mod-${Date.now()}` } : editingModule;
        const modules = isNew ? [...c.modules, finalMod] : c.modules.map(m => m.id === finalMod.id ? finalMod : m);
        return { ...c, modules };
      });
    });
    setEditingModule(null);
  };

  const removeModule = (moduleId) => {
    if (!window.confirm("Excluir este módulo e todas as suas aulas?")) return;
    updateCourses(prev => {
      return prev.map(c => {
        if (c.id !== activeCourseId) return c;
        return { ...c, modules: c.modules.filter(m => m.id !== moduleId) };
      });
    });
    if (activeModuleId === moduleId) setActiveModuleId(null);
  };

  // -------------------------------------------------------------
  // LESSON ACTIONS (Level 3)
  // -------------------------------------------------------------
  const saveLesson = (e) => {
    e.preventDefault();
    updateCourses(prev => {
      return prev.map(c => {
        if (c.id !== activeCourseId) return c;
        const modules = c.modules.map(m => {
          if (m.id !== activeModuleId) return m;
          const isNew = !editingLesson.id;
          const finalLes = isNew ? { ...editingLesson, id: `les-${Date.now()}` } : editingLesson;
          const lessons = isNew ? [...(m.lessons || []), finalLes] : m.lessons.map(l => l.id === finalLes.id ? finalLes : l);
          return { ...m, lessons };
        });
        return { ...c, modules };
      });
    });
    setEditingLesson(null);
  };

  const removeLesson = (lessonId) => {
    if (!window.confirm("Excluir aula?")) return;
    updateCourses(prev => {
      return prev.map(c => {
        if (c.id !== activeCourseId) return c;
        const modules = c.modules.map(m => {
          if (m.id !== activeModuleId) return m;
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        });
        return { ...c, modules };
      });
    });
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------
  const activeCourse = activeCourseId ? courses.find(c => c.id === activeCourseId) : null;
  const activeModule = activeCourse && activeModuleId ? activeCourse.modules.find(m => m.id === activeModuleId) : null;

  // -------------------------------------------------------------
  // VIEW: LEVEL 3 - LESSONS (Inside a Module)
  // -------------------------------------------------------------
  if (activeCourse && activeModule) {
    return (
      <DashboardLayout title="Gerenciar Aulas" subtitle={`Curso: ${activeCourse.title} / Módulo: ${activeModule.title}`}>
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E4E4E6]">
          <button onClick={() => setActiveModuleId(null)} className="flex items-center gap-2 text-[#161111] font-bold hover:text-[#F56D41] transition">
            <ChevronLeft size={20} /> Voltar para os Módulos
          </button>
          <span className="text-xs text-[#5D6068] font-bold flex items-center gap-1">
            <CheckCircle2 size={14} className="text-emerald-500" /> Salvo Automático
          </span>
        </div>

        <div className="max-w-4xl bg-white border border-[#E4E4E6] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E4E4E6] bg-[#F6F6F8]/50 flex items-center justify-between">
            <h3 className="font-heading font-bold text-[#161111]">Aulas ({activeModule.lessons?.length || 0})</h3>
            <button onClick={() => setEditingLesson({ title: "", duration: "", videoUrl: "" })} className="text-xs font-bold bg-[#161111] text-white px-4 py-2 rounded-full hover:bg-[#F56D41] transition flex items-center gap-2">
              <Plus size={14}/> ADICIONAR AULA
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {(!activeModule.lessons || activeModule.lessons.length === 0) ? (
               <div className="p-8 text-center text-[#5D6068] border border-dashed border-[#E4E4E6] rounded-2xl">Nenhuma aula cadastrada neste módulo.</div>
            ) : (
              activeModule.lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center gap-4 p-4 border border-[#E4E4E6] hover:border-[#F56D41]/50 rounded-2xl transition group">
                  <div className="w-8 flex justify-center text-[#5D6068] font-bold text-xs">{idx + 1}</div>
                  <div className="w-12 h-12 rounded-xl bg-[#161111] flex items-center justify-center border border-[#E4E4E6] shrink-0">
                    <PlayCircle size={20} className="text-[#F56D41]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#161111] text-sm truncate">{lesson.title}</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-[#5D6068] flex items-center gap-1 font-medium"><Clock size={12}/> {lesson.duration}</span>
                      <span className="text-[10px] text-[#5D6068] flex items-center gap-1 truncate max-w-[250px]"><LinkIcon size={12}/> {lesson.videoUrl}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => setEditingLesson(lesson)} className="p-2.5 bg-[#F6F6F8] text-[#161111] hover:bg-[#161111] hover:text-white rounded-xl transition"><Settings2 size={16}/></button>
                     <button onClick={() => removeLesson(lesson.id)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL: Lesson (SPLIT SCREEN) */}
        {editingLesson && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingLesson(null)}>
            <div className="bg-[#F6F6F8] border border-[#E4E4E6] w-full max-w-6xl h-full max-h-[90vh] rounded-[2rem] shadow-2xl flex overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Formulário (Esquerda) */}
              <div className="w-full lg:w-[450px] bg-white p-8 overflow-y-auto shrink-0 border-r border-[#E4E4E6] flex flex-col">
                <h3 className="font-heading font-black text-2xl text-[#161111] mb-6">Informações da Aula</h3>
                <form onSubmit={saveLesson} className="space-y-5 flex-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Título da Aula</label>
                    <input required value={editingLesson.title} onChange={e => setEditingLesson(p => ({...p, title: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" placeholder="Ex: Aula 1 - Boas Vindas" />
                  </div>
                  {activeCourse?.courseLanguage === 'both' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FileUploader 
                          type="video" 
                          label="Vídeo (PT)"
                          value={editingLesson.videoUrl_pt || editingLesson.videoUrl} 
                          onUploadComplete={(url, duration) => setEditingLesson(p => ({
                            ...p, videoUrl_pt: url, videoUrl: url, duration: duration || p.duration 
                          }))} 
                        />
                      </div>
                      <div>
                        <FileUploader 
                          type="video" 
                          label="Vídeo (EN)"
                          value={editingLesson.videoUrl_en} 
                          onUploadComplete={(url, duration) => setEditingLesson(p => ({
                            ...p, videoUrl_en: url, duration: duration || p.duration 
                          }))} 
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FileUploader 
                        type="video" 
                        label="Arquivo do Vídeo"
                        value={editingLesson.videoUrl} 
                        onUploadComplete={(url, duration) => setEditingLesson(p => ({
                          ...p, videoUrl: url, duration: duration || p.duration 
                        }))} 
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FileUploader 
                        type="document" 
                        label="Material (PDF)"
                        value={editingLesson.pdfUrl} 
                        onUploadComplete={(url) => setEditingLesson(p => ({...p, pdfUrl: url}))} 
                      />
                    </div>
                    <div>
                      <FileUploader 
                        type="audio" 
                        label="Áudio (MP3)"
                        value={editingLesson.audioUrl} 
                        onUploadComplete={(url) => setEditingLesson(p => ({...p, audioUrl: url}))} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Link Externo</label>
                    <input value={editingLesson.externalLink || ""} onChange={e => setEditingLesson(p => ({...p, externalLink: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" placeholder="https://..." />
                  </div>
                  
                  <div className="flex gap-3 pt-4 mt-auto">
                    <button type="button" onClick={() => setEditingLesson(null)} className="flex-1 py-3 text-sm font-bold text-[#5D6068] hover:text-[#161111] transition bg-[#161111]/5 rounded-full">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-[#C05746] text-white rounded-full text-sm font-bold hover:opacity-90 transition shadow-lg">Salvar Aula</button>
                  </div>
                </form>
              </div>

              {/* Live Preview (Direita) */}
              <div className="flex-1 hidden lg:flex flex-col bg-[#08080a] overflow-hidden relative">
                 <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white/50 text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-2">
                   <Eye size={14} /> PREVIEW DA ÁREA DE MEMBROS
                 </div>
                 
                 <div className="flex h-full p-6 pt-16 gap-6">
                    {/* Fake Video Player */}
                    <div className="flex-1 flex flex-col gap-4">
                       <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl flex flex-col">
                          {editingLesson.videoUrl || editingLesson.videoUrl_pt ? (
                             <video src={editingLesson.videoUrl_pt || editingLesson.videoUrl} className="w-full h-full object-contain" controls />
                          ) : (
                             <div className="flex-1 flex items-center justify-center">
                               <PlayCircle size={60} className="text-white/20" />
                             </div>
                          )}
                       </div>
                       <div>
                         <h2 className="text-2xl font-bold text-white mb-2">{editingLesson.title || "Sua Nova Aula"}</h2>
                         <p className="text-sm text-gray-400">Módulo: {activeModule.title}</p>
                       </div>
                    </div>
                    {/* Fake Sidebar */}
                    <div className="w-[300px] shrink-0 bg-[#12141c] rounded-2xl border border-white/5 p-4 hidden xl:block overflow-y-auto">
                       <h3 className="text-white font-bold mb-4">{activeCourse.title}</h3>
                       <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#F56D41] font-bold text-sm">
                              <ChevronLeft size={16} className="-rotate-90" />
                              {activeModule.title}
                            </div>
                            <div className="pl-6 space-y-2">
                              {/* Show existing lessons + the one being edited */}
                              {activeModule.lessons.map(l => (
                                <div key={l.id} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${l.id === editingLesson.id ? 'bg-[#F56D41]/20 text-[#F56D41]' : 'text-gray-400'}`}>
                                   <PlayCircle size={14} />
                                   <span className="truncate">{l.id === editingLesson.id ? (editingLesson.title || "Nova Aula...") : l.title}</span>
                                </div>
                              ))}
                              {/* If it's a new lesson not saved yet */}
                              {!editingLesson.id && (
                                <div className="flex items-center gap-3 p-2 rounded-lg text-sm bg-[#F56D41]/20 text-[#F56D41]">
                                   <PlayCircle size={14} />
                                   <span className="truncate">{editingLesson.title || "Nova Aula..."}</span>
                                </div>
                              )}
                            </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LEVEL 2 - MODULES (Inside a Course)
  // -------------------------------------------------------------
  if (activeCourse) {
    return (
      <DashboardLayout title="Módulos do Curso" subtitle={`Gerencie os módulos de: ${activeCourse.title}`}>
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E4E4E6]">
          <button onClick={() => setActiveCourseId(null)} className="flex items-center gap-2 text-[#161111] font-bold hover:text-[#F56D41] transition">
            <ChevronLeft size={20} /> Voltar para Meus Cursos
          </button>
          <div className="flex gap-3">
             <span className="text-xs text-[#5D6068] font-bold flex items-center gap-1">
               <CheckCircle2 size={14} className="text-emerald-500" /> Salvo Automático
             </span>
             <button onClick={() => setEditingModule({ title: "", posterVertical: "", locked: false, iconName: "Eye", lessons: [] })} className="text-sm font-bold text-white bg-[#161111] hover:bg-[#F56D41] px-5 py-2.5 rounded-full transition flex items-center gap-2 shadow-lg">
               <Plus size={14} /> NOVO MÓDULO
             </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-w-7xl">
          {(!activeCourse.modules || activeCourse.modules.length === 0) ? (
             <div className="col-span-full p-12 text-center text-[#5D6068] bg-white border border-dashed border-[#E4E4E6] rounded-2xl">
               Nenhum módulo criado. Crie o primeiro módulo para colocar suas aulas!
             </div>
          ) : (
            activeCourse.modules.map(mod => (
              <div key={mod.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-[#E6D7C3] transition hover:shadow-xl hover:-translate-y-1">
                {/* 9:16 Vertical Poster */}
                {mod.posterVertical ? (
                  <img src={mod.posterVertical} alt="" className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${mod.locked ? 'grayscale opacity-50' : 'opacity-80'}`} />
                ) : (
                  <div className="w-full h-full bg-[#232F2A] flex items-center justify-center opacity-80 group-hover:scale-105 transition duration-500">
                     <PlayCircle size={32} className="text-[#E6D7C3] opacity-30"/>
                  </div>
                )}
                
                {mod.locked && <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md flex items-center justify-center border border-white/10 z-10"><Lock size={12} className="text-white"/></div>}
                
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 z-20">
                   <p className="text-xs font-bold uppercase tracking-wider text-white truncate drop-shadow-md">{mod.title || "Sem Nome"}</p>
                   <p className="text-[9px] text-white/60 uppercase tracking-widest mt-1">{mod.lessons?.length || 0} Aulas</p>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition duration-300 z-30 flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4">
                  <button onClick={() => setActiveModuleId(mod.id)} className="w-full py-2.5 rounded-full bg-[#C05746] text-white font-bold text-xs shadow-xl hover:opacity-90 transition text-center">
                    Ver Aulas
                  </button>
                  <div className="flex w-full gap-2 mt-2">
                    <button onClick={() => setEditingModule(mod)} className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-[10px] uppercase hover:bg-white/20 transition">Editar Capa</button>
                    <button onClick={() => removeModule(mod.id)} className="w-10 h-8 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500/40 transition"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {editingModule && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingModule(null)}>
            <div className="bg-white border border-[#E4E4E6] w-full max-w-lg p-8 rounded-[2rem] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="font-heading font-black text-2xl text-[#161111] mb-6">Informações do Módulo</h3>
              <form onSubmit={saveModule} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Nome do Módulo</label>
                  <input required value={editingModule.title} onChange={e => setEditingModule(p => ({...p, title: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Acesso (Order Bump)?</label>
                    <button type="button" onClick={() => setEditingModule(p => ({...p, locked: !p.locked, price: !p.locked ? p.price || 27 : 0}))} className={`w-full h-[46px] rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition ${editingModule.locked ? "border-red-500/50 bg-red-500/10 text-red-500" : "border-[#E4E4E6] bg-[#F6F6F8]/50 text-[#161111]"}`}>
                      {editingModule.locked ? <Lock size={14}/> : <Unlock size={14}/>} {editingModule.locked ? "Bloqueado" : "Aberto"}
                    </button>
                  </div>
                  {editingModule.locked && (
                    <div className="animate-fade-in">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Preço do Bump ($)</label>
                      <input type="number" step="0.01" min="0" value={editingModule.price || 0} onChange={e => setEditingModule(p => ({...p, price: parseFloat(e.target.value) || 0}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 h-[46px] text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" />
                    </div>
                  )}
                </div>

                {editingModule.locked && (
                  <div className="animate-fade-in">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Descrição do Order Bump</label>
                    <textarea 
                      value={editingModule.bumpDescription || ""} 
                      onChange={e => setEditingModule(p => ({...p, bumpDescription: e.target.value}))} 
                      className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition resize-none h-24" 
                      placeholder="Ex: Acesso exclusivo à nossa comunidade VIP no Discord..."
                    ></textarea>
                  </div>
                )}

                <div>
                  <FileUploader 
                    type="image" 
                    label="Pôster Vertical (Formato Netflix 9:16)"
                    value={editingModule.posterVertical} 
                    onUploadComplete={(base64) => setEditingModule(p => ({...p, posterVertical: base64}))} 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEditingModule(null)} className="flex-1 py-3 text-sm font-bold text-[#5D6068] hover:text-[#161111] transition">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-[#C05746] text-white rounded-full text-sm font-bold hover:opacity-90 transition shadow-lg">Salvar Módulo</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LEVEL 1 - MAIN TABS
  // -------------------------------------------------------------
  return (
    <DashboardLayout title="Área do Produtor" subtitle="Crie e gerencie seus cursos e rendimentos.">
      
      <div className="flex gap-2 border-b border-[#E4E4E6] mb-8">
        <button onClick={() => setActiveTab('courses')} className={`px-6 py-3 font-bold text-sm transition border-b-2 ${activeTab === 'courses' ? 'border-[#F56D41] text-[#F56D41]' : 'border-transparent text-[#5D6068] hover:text-[#161111]'}`}>
          Meus Cursos
        </button>
        <button onClick={() => setActiveTab('finance')} className={`px-6 py-3 font-bold text-sm transition border-b-2 ${activeTab === 'finance' ? 'border-[#F56D41] text-[#F56D41]' : 'border-transparent text-[#5D6068] hover:text-[#161111]'}`}>
          Financeiro (Web3)
        </button>
      </div>

      {activeTab === 'finance' && (
        <div className="max-w-7xl animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-[#E4E4E6] shadow-sm flex flex-col justify-between">
               <div>
                 <div className="flex items-center gap-2 text-[#5D6068] text-xs font-bold uppercase tracking-widest mb-2"><Wallet size={16}/> Saldo Disponível</div>
                 <div className="text-4xl font-heading font-black text-[#161111]">{formatCurrency(stats?.available_balance || 0)}</div>
               </div>
               <div className="mt-4 text-xs font-bold text-emerald-500 bg-emerald-500/10 inline-block px-3 py-1 rounded-full w-max">Pronto para saque na Liquid</div>
            </div>
            <div className="bg-[#F6F6F8]/50 rounded-2xl p-6 border border-[#E4E4E6] shadow-sm flex flex-col justify-between">
               <div>
                 <div className="flex items-center gap-2 text-[#5D6068] text-xs font-bold uppercase tracking-widest mb-2"><History size={16}/> Total Recebido</div>
                 <div className="text-4xl font-heading font-black text-[#161111]">{formatCurrency(stats?.total_earnings || 0)}</div>
               </div>
               <div className="mt-4 text-xs font-bold text-[#5D6068]">Já descontada a taxa da plataforma (10%)</div>
            </div>
            <div className="bg-[#F6F6F8]/50 rounded-2xl p-6 border border-[#E4E4E6] shadow-sm flex flex-col justify-between">
               <div>
                 <div className="flex items-center gap-2 text-[#5D6068] text-xs font-bold uppercase tracking-widest mb-2"><DollarSign size={16}/> Saques Pendentes</div>
                 <div className="text-4xl font-heading font-black text-[#F56D41]">{formatCurrency(stats?.pending_withdrawals || 0)}</div>
               </div>
               <div className="mt-4 text-xs font-bold text-[#5D6068]">Aguardando liberação do admin</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 border border-[#E4E4E6] shadow-sm">
                   <h3 className="font-heading font-black text-xl text-[#161111] mb-6">Solicitar Saque</h3>
                   <form onSubmit={handleWithdraw} className="space-y-4">
                      <div>
                         <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Valor (USD)</label>
                         <input type="number" step="0.01" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-xl px-4 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" placeholder="0.00" />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Carteira Web3 / Liquid</label>
                         <input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-xl px-4 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" placeholder="Endereço DPIX / Liquid..." />
                      </div>
                      <button type="submit" className="w-full py-3 bg-[#C05746] text-white rounded-xl text-sm font-bold hover:opacity-90 transition shadow-lg flex items-center justify-center gap-2 mt-4">
                        <ArrowUpRight size={16}/> SOLICITAR SAQUE
                      </button>
                   </form>
                </div>
             </div>

             <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 border border-[#E4E4E6] shadow-sm h-full">
                   <h3 className="font-heading font-black text-xl text-[#161111] mb-6">Histórico de Transações</h3>
                   <div className="space-y-4">
                      {stats?.withdrawals?.length > 0 || stats?.sales?.length > 0 ? (
                        <>
                          {stats?.withdrawals?.map(w => (
                             <div key={w.id} className="flex items-center justify-between p-4 bg-[#F6F6F8]/50 rounded-xl border border-[#E4E4E6]">
                                <div>
                                   <div className="font-bold text-[#161111] text-sm flex items-center gap-2">
                                     <ArrowUpRight size={14} className="text-red-500" /> Saque para Carteira
                                   </div>
                                   <div className="text-xs text-[#5D6068] truncate max-w-[200px] mt-1">{w.wallet_address}</div>
                                </div>
                                <div className="text-right">
                                   <div className="font-heading font-black text-[#161111]">- {formatCurrency(w.amount)}</div>
                                   <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${w.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{w.status}</div>
                                </div>
                             </div>
                          ))}
                          {stats?.sales?.map(s => (
                             <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E4E4E6]">
                                <div>
                                   <div className="font-bold text-[#161111] text-sm flex items-center gap-2">
                                     <ArrowUpRight size={14} className="text-emerald-500 rotate-180" /> Venda de Curso
                                   </div>
                                   <div className="text-xs text-[#5D6068] mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="text-right">
                                   <div className="font-heading font-black text-emerald-500">+ {formatCurrency(s.amount * 0.9)}</div>
                                   <div className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] mt-1">Líquido (Taxa 10%)</div>
                                </div>
                             </div>
                          ))}
                        </>
                      ) : (
                         <div className="text-center text-[#5D6068] py-8 border border-dashed border-[#E4E4E6] rounded-xl">
                            Nenhuma transação financeira ainda.
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#E4E4E6]">
             <div className="flex items-center gap-3">
               <LayoutGrid size={18} className="text-[#5D6068]" />
               <h3 className="text-[#161111] font-heading font-bold text-lg">Meus Cursos ({courses.length})</h3>
             </div>
             <div className="flex gap-4 items-center">
           <span className="text-xs text-[#5D6068] font-bold flex items-center gap-1 mr-2">
             <CheckCircle2 size={14} className="text-emerald-500" /> Salvo Automático
           </span>
           <button onClick={() => setEditingCourse({ title: "", category: COURSE_CATEGORIES[0], courseLanguage: "pt", price: "$0.00", description: "", thumbnailHorizontal: "", modules: [] })} className="text-sm font-bold text-white bg-[#C05746] hover:opacity-90 px-6 py-3 rounded-full transition flex items-center gap-2 shadow-lg">
             <Plus size={16} /> CRIAR NOVO CURSO
           </button>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl">
        {courses.map(course => (
          <div key={course.id} className="group relative bg-white rounded-2xl overflow-hidden border border-[#E4E4E6] transition hover:shadow-xl hover:-translate-y-1">
            {/* 16:9 Horizontal Thumbnail */}
            <div className="aspect-video relative overflow-hidden bg-[#161111]">
              {course.thumbnailHorizontal ? (
                <img src={course.thumbnailHorizontal} alt="" className="w-full h-full object-cover transition duration-500 group-hover:scale-105 opacity-90" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-30"><PlayCircle size={40} className="text-white" /></div>
              )}
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider">
                {course.category}
              </div>
            </div>
            
            <div className="p-5">
               <h4 className="font-heading font-bold text-[#161111] text-lg truncate mb-1">{course.title || "Curso Sem Nome"}</h4>
               <p className="text-xs text-[#5D6068] mb-4 truncate">{course.description || "Sem descrição"}</p>
               
               <div className="flex items-center justify-between pt-4 pb-4 border-t border-[#E4E4E6]">
                 <span className="text-[10px] font-bold text-[#5D6068] uppercase tracking-widest">{course.modules?.length || 0} Módulos · {course.courseLanguage?.toUpperCase() || 'PT'}</span>
                 <span className="text-sm font-black text-[#F56D41]">{course.price}</span>
               </div>

               <div className="flex gap-2">
                 <button onClick={() => setActiveCourseId(course.id)} className="flex-1 py-2 bg-[#F56D41]/10 text-[#F56D41] font-bold text-xs rounded-lg hover:bg-[#F56D41] hover:text-white transition flex items-center justify-center gap-1">
                   <Edit3 size={14}/> Aulas
                 </button>
                 <button onClick={() => setEditingCourse(course)} className="flex-1 py-2 bg-[#161111]/5 text-[#161111] font-bold text-xs rounded-lg hover:bg-[#161111] hover:text-white transition flex items-center justify-center gap-1">
                   <Settings2 size={14}/> Config
                 </button>
                 <button onClick={() => removeCourse(course.id)} className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                   <Trash2 size={14}/>
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>

        {editingCourse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingCourse(null)}>
            <div className="bg-[#F6F6F8] border border-[#E4E4E6] w-full max-w-6xl h-full max-h-[90vh] rounded-[2rem] shadow-2xl flex overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Lado Esquerdo: Formulário */}
              <div className="w-full lg:w-[450px] bg-white p-8 overflow-y-auto shrink-0 border-r border-[#E4E4E6] flex flex-col">
                <h3 className="font-heading font-black text-2xl text-[#161111] mb-6">Informações do Curso</h3>
                <form onSubmit={saveCourse} className="space-y-5 flex-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Nome do Curso</label>
                    <input required value={editingCourse.title} onChange={e => setEditingCourse(p => ({...p, title: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Categoria</label>
                      <select value={editingCourse.category} onChange={e => setEditingCourse(p => ({...p, category: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-4 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition appearance-none">
                        {COURSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Idioma</label>
                      <select value={editingCourse.courseLanguage || 'pt'} onChange={e => setEditingCourse(p => ({...p, courseLanguage: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-4 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition appearance-none">
                        <option value="pt">PT</option>
                        <option value="en">EN</option>
                        <option value="both">Ambos</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Preço (Ex: $99.00)</label>
                    <input required value={editingCourse.price} onChange={e => setEditingCourse(p => ({...p, price: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition" />
                  </div>

                  {editingCourse.courseLanguage === 'both' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Descrição (PT)</label>
                        <textarea rows={2} required value={editingCourse.description_pt || editingCourse.description} onChange={e => setEditingCourse(p => ({...p, description_pt: e.target.value, description: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition resize-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Descrição (EN)</label>
                        <textarea rows={2} required value={editingCourse.description_en || ''} onChange={e => setEditingCourse(p => ({...p, description_en: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition resize-none" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#5D6068] block mb-2">Descrição Curta</label>
                      <textarea rows={2} required value={editingCourse.description} onChange={e => setEditingCourse(p => ({...p, description: e.target.value}))} className="w-full bg-[#F6F6F8]/50 border border-[#E4E4E6] rounded-2xl px-5 py-3 text-[#161111] text-sm outline-none focus:border-[#F56D41] transition resize-none" />
                    </div>
                  )}

                  <div>
                    <FileUploader 
                      type="image" 
                      label="Capa (16:9)"
                      value={editingCourse.thumbnailHorizontal} 
                      onUploadComplete={(base64) => setEditingCourse(p => ({...p, thumbnailHorizontal: base64}))} 
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4 mt-auto">
                    <button type="button" onClick={() => setEditingCourse(null)} className="flex-1 py-3 text-sm font-bold text-[#5D6068] hover:text-[#161111] transition bg-[#161111]/5 rounded-full">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-[#C05746] text-white rounded-full text-sm font-bold hover:opacity-90 transition shadow-lg">Salvar</button>
                  </div>
                </form>
              </div>

              {/* Lado Direito: Live Preview */}
              <div className="flex-1 hidden lg:flex flex-col bg-[#F6F6F8] overflow-y-auto p-8 relative items-center">
                 <div className="absolute top-4 right-4 bg-black/5 backdrop-blur-sm text-[#161111]/50 text-xs font-bold px-3 py-1.5 rounded-full z-10 flex items-center gap-2">
                   <Eye size={14} /> LIVE PREVIEW
                 </div>
                 
                 <div className="w-full max-w-2xl space-y-12">
                   
                   <div>
                     <h4 className="text-[#5D6068] text-[10px] font-bold uppercase mb-3 tracking-widest">Preview: Banner do Catálogo</h4>
                     <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden bg-[#161111] shadow-2xl">
                        <img src={editingCourse.thumbnailHorizontal || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80"} className="w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center p-8">
                           <div className="max-w-md">
                              <span className="inline-block px-3 py-1 mb-3 rounded-full bg-[#C05746] text-white text-[9px] font-black tracking-widest uppercase shadow-lg">
                                 {editingCourse.category || "Categoria"}
                              </span>
                              <h2 className="text-2xl font-heading font-black text-white mb-2 leading-tight">
                                {editingCourse.title || "Nome do Curso"}
                              </h2>
                              <p className="text-gray-300 text-xs mb-5 line-clamp-2">
                                {editingCourse.courseLanguage === 'both' ? (editingCourse.description_pt || editingCourse.description) : (editingCourse.description || "Sua descrição aparecerá aqui...")}
                              </p>
                              <div className="flex gap-2">
                                <div className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full flex items-center gap-2">
                                  <PlayCircle size={16} /> Assistir
                                </div>
                              </div>
                           </div>
                        </div>
                     </div>
                   </div>

                   <div>
                     <h4 className="text-[#5D6068] text-[10px] font-bold uppercase mb-3 tracking-widest">Preview: Card de Vitrine</h4>
                     <div className="w-[300px] group relative bg-white rounded-2xl overflow-hidden border border-[#E4E4E6] shadow-xl">
                        <div className="aspect-video relative overflow-hidden bg-[#161111]">
                          <img src={editingCourse.thumbnailHorizontal || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80"} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white uppercase">
                            {editingCourse.category || "Categoria"}
                          </div>
                        </div>
                        <div className="p-5">
                           <h4 className="font-heading font-bold text-[#161111] text-lg truncate mb-1">{editingCourse.title || "Nome do Curso"}</h4>
                           <p className="text-xs text-[#5D6068] mb-4 line-clamp-2 min-h-[32px]">
                             {editingCourse.courseLanguage === 'both' ? (editingCourse.description_pt || editingCourse.description) : (editingCourse.description || "Descrição curta...")}
                           </p>
                           <div className="flex items-center justify-between pt-4 border-t border-[#E4E4E6]">
                             <span className="text-[10px] font-bold text-[#5D6068] uppercase tracking-widest">
                               {editingCourse.modules?.length || 0} Módulos · {editingCourse.courseLanguage?.toUpperCase() || 'PT'}
                             </span>
                             <span className="text-sm font-black text-[#F56D41]">{editingCourse.price || "$0.00"}</span>
                           </div>
                        </div>
                     </div>
                   </div>

                 </div>
              </div>

            </div>
          </div>
        )}
        </div>
      )}
    </DashboardLayout>
  );
}
