import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getCourses } from "../../lib/courseStore";
import { hasCourseAccess, getPurchasedBumps } from "../../lib/enrollmentStore";
import { toast } from "sonner";
import {
  Compass,
  Home,
  GraduationCap,
  HelpCircle,
  LogOut,
  User,
  CheckCircle2,
  X,
  Play,
  Volume2,
  Maximize,
  ChevronRight,
  ChevronLeft,
  Menu,
  ChevronDown,
  Camera,
  FileText,
  Headphones,
  ExternalLink,
  Flame,
  Send,
  Lock,
  ListVideo
} from "lucide-react";
import { api } from "../../lib/api";


export default function CoursePlayer() {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  const [course, setCourse] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedLessons, setCompletedLessons] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const chatContainerRef = useRef(null);

  const [modules, setModules] = useState([]);
  const [purchasedBumps, setPurchasedBumps] = useState([]);

  // Load course details
  useEffect(() => {
    const loadData = async () => {
      // Check access
      if (user?.role !== 'producer' && user?.role !== 'admin') {
        const hasAccess = await hasCourseAccess(user?.id, courseId);
        if (!hasAccess) {
          navigate(`/courses/${courseId}`); // Redirect to sales page
          return;
        }
      }

      const bumps = await getPurchasedBumps(user?.id, courseId);
      setPurchasedBumps(bumps);

      const courses = await getCourses();
      const foundCourse = courses.find(c => c.id === courseId);

      if (foundCourse) {
        setCourse({ title: foundCourse.title, course_id: courseId, image: foundCourse.thumbnailHorizontal });
        setModules(foundCourse.modules || []);
      } else {
        setCourse({ title: "Curso não encontrado", course_id: courseId });
        setModules([]);
      }
    };

    loadData();
    window.addEventListener("storage", loadData);
    window.addEventListener("courses_updated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("courses_updated", loadData);
    };
  }, [courseId]);

  // Load completion state from localstorage
  useEffect(() => {
    const state = {};
    modules.forEach(m => {
      (m.lessons || []).forEach(l => {
        const val = localStorage.getItem(`nomad_complete_${courseId}_${l.id}`);
        if (val === "true") {
          state[l.id] = true;
        }
      });
    });
    setCompletedLessons(state);
  }, [courseId]);

  // Handle active lesson selection and redirect if no lessonId present
  useEffect(() => {
    if (!modules || modules.length === 0) return;

    let targetLesson = null;
    let targetModule = null;

    if (lessonId) {
      // Find exact lesson
      for (const m of modules) {
        const match = (m.lessons || []).find(l => l.id === lessonId);
        if (match) {
          targetLesson = match;
          targetModule = m;
          break;
        }
      }
    } else if (moduleId) {
      // Find first lesson of specific module
      targetModule = modules.find(m => m.id === moduleId);
      if (targetModule && targetModule.lessons && targetModule.lessons.length > 0) {
        targetLesson = targetModule.lessons[0];
      }
    }

    if (!targetLesson) {
      // Default to first lesson of first module
      const firstModule = modules[0];
      const firstLesson = firstModule?.lessons?.[0];
      if (firstLesson) {
        navigate(`/dashboard/courses/${courseId}/modules/${firstModule.id}/lessons/${firstLesson.id}`, { replace: true });
      }
    } else {
      setActiveLesson(targetLesson);
      
      // Auto expand the active lesson's module
      const modIndex = modules.findIndex(m => m.id === targetModule.id);
      if (modIndex !== -1) {
        setExpandedModules(prev => ({ ...prev, [modIndex]: true }));
      }
      
      // Reset Chat for new lesson
      setChatMessages([
        {
          id: 1,
          sender: "sapiens",
          text: `Olá! Sou o Tutor Sapiens. Qual a sua dúvida sobre a aula "${targetLesson.title}"?`
        }
      ]);
      setChatInput("");
    }
  }, [courseId, moduleId, lessonId, navigate, modules]);

  // Scroll Chat to bottom without scrolling the whole page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: "user", text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate Sapiens typing
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "sapiens",
          text: "Estou analisando o conteúdo desta aula para te dar a melhor resposta. Esta funcionalidade será conectada ao Vector DB na próxima fase!"
        }
      ]);
    }, 1500);
  };

  const toggleComplete = (lId) => {
    const newStatus = !completedLessons[lId];
    const updated = { ...completedLessons, [lId]: newStatus };
    setCompletedLessons(updated);
    if (newStatus) {
      localStorage.setItem(`nomad_complete_${courseId}_${lId}`, "true");
    } else {
      localStorage.removeItem(`nomad_complete_${courseId}_${lId}`);
    }

    // Update progress percentage on backend if user is authenticated
    const totalCount = modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);
    const completedCount = Object.values(updated).filter(Boolean).length;
    
    // Dispatch event to sync MyCourses and other tabs
    window.dispatchEvent(new Event("progress_updated"));
  };

  const getModuleCompletedCount = (modIndex) => {
    const m = modules[modIndex];
    if (!m) return "0/0";
    const total = m.lessons.length;
    const done = m.lessons.filter(l => completedLessons[l.id]).length;
    return `${done}/${total}`;
  };

  // Calculate next/prev lessons
  let nextLesson = null;
  let prevLesson = null;
  
  if (modules.length > 0 && activeLesson) {
    let allLessonsFlat = [];
    modules.forEach(m => {
       (m.lessons || []).forEach(l => {
          allLessonsFlat.push({ lesson: l, moduleId: m.id });
       });
    });
    const currentIdx = allLessonsFlat.findIndex(item => item.lesson.id === activeLesson.id);
    if (currentIdx > 0) prevLesson = allLessonsFlat[currentIdx - 1];
    if (currentIdx < allLessonsFlat.length - 1) nextLesson = allLessonsFlat[currentIdx + 1];
  }

  const navigateToLesson = (lessonItem) => {
    if (!lessonItem) return;
    navigate(`/dashboard/courses/${courseId}/modules/${lessonItem.moduleId}/lessons/${lessonItem.lesson.id}`);
  };

  if (!course) {
    return (
      <div className="min-h-screen player-container flex items-center justify-center text-white" style={{ backgroundColor: "#08080a" }}>
        <div className="animate-spin text-[#C85B46]"><Compass size={40} /></div>
      </div>
    );
  }

  if (!activeLesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white" style={{ backgroundColor: "#08080a" }}>
        <Compass size={60} className="text-[#F56D41] opacity-50 mb-4" />
        <h2 className="text-2xl font-bold font-heading mb-2">Conteúdo em Breve</h2>
        <p className="text-[#8f929d] mb-6 max-w-md text-center">Este curso ainda não possui aulas cadastradas. O produtor está preparando tudo para você!</p>
        <Link to="/dashboard" className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition font-bold">Voltar para Área Inicial</Link>
      </div>
    );
  }

  // Find module title for current lesson
  const currentMod = modules.find(m => m.lessons.some(l => l.id === activeLesson.id));

  return (
    <div className="min-h-screen player-container flex flex-col select-none overflow-hidden bg-[#08080a]">
      {/* 1. Top Header (Netflix Style) */}
      <header className="h-20 shrink-0 z-50 bg-[#0c0d12]/90 backdrop-blur-md flex items-center justify-between px-6 md:px-10 sticky top-0 transition-colors border-b border-transparent">
        
        {/* Left Side: Logo and Navigation Back */}
        <div className="flex items-center gap-10">
          <Link to="/dashboard" className="flex items-center gap-3 transition hover:opacity-80">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1a1c24] text-white shadow-lg hover:bg-white/10 transition">
                <ChevronLeft size={22} />
             </div>
             <img src="/nomad-sapiens-white.png" alt="Nomad Sapiens" className="hidden sm:block object-contain" style={{ height: '40px' }} />
          </Link>

          <div className="hidden md:flex items-center gap-4">
             <span className="font-heading font-bold text-lg text-white truncate max-w-md">
               {currentMod ? currentMod.module_title : ""}
             </span>
          </div>
        </div>

        {/* Right Side: Actions and Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition"
            >
              <ListVideo size={18} />
              <span className="hidden sm:inline font-bold text-sm">Aulas</span>
            </button>
            {/* Complete / Concluir Toggle */}
            <button
              onClick={() => toggleComplete(activeLesson.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold border transition ${
                completedLessons[activeLesson.id]
                  ? "bg-white border-white"
                  : "border-white/20 bg-transparent text-white hover:border-white"
              }`}
              style={completedLessons[activeLesson.id] ? { color: '#000000' } : {}}
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">{completedLessons[activeLesson.id] ? "Concluído" : "Concluir"}</span>
            </button>

            {/* User Profile */}
            <Link to="/dashboard/account" className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition cursor-pointer hidden md:flex">
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

            {/* Exit Player Button */}
            <Link
              to="/dashboard"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8f929d] hover:text-[#F56D41] hover:bg-[#F56D41]/10 transition"
              title="Sair da Aula"
            >
              <X size={20} />
            </Link>
        </div>
      </header>

      {/* 2. Main Player Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Content Columns: Left Player, Right Catalog list */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Video Frame Column */}
          <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto" style={{ backgroundColor: '#000000' }}>
            {/* Video container */}
            <div className="relative aspect-video w-full shrink-0 rounded-2xl overflow-hidden bg-[#0c0d12] border border-white/5 shadow-2xl group flex flex-col justify-between">
              {/* Actual HTML5 Video element */}
              {activeLesson.videoUrl || activeLesson.videoUrl_pt || activeLesson.videoUrl_en ? (
                <video
                  key={activeLesson.id}
                  src={language === 'pt' ? (activeLesson.videoUrl_pt || activeLesson.videoUrl) : (activeLesson.videoUrl_en || activeLesson.videoUrl)}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                  <Play size={48} className="text-[#F56D41] opacity-50 mb-4" />
                  <p className="text-white font-bold">Nenhum vídeo cadastrado nesta aula.</p>
                  <p className="text-[#8f929d] text-sm mt-2">Edite a aula na Área do Produtor e faça o upload do vídeo.</p>
                </div>
              )}

              {/* Watermark Floating anti-piracy overlay */}
              <div className="absolute pointer-events-none text-white/10 text-xs font-mono px-4 py-2 bottom-4 left-4 select-none animate-pulse">
                Nome: {user?.name || "Gustavo Gomes"} | Email: {user?.email || "coven688@gmail.com"}
              </div>
            </div>

            {/* Lesson Navigation (Prev / Next) */}
            <div className="mt-6 flex items-center justify-between">
               <button 
                 onClick={() => navigateToLesson(prevLesson)}
                 disabled={!prevLesson}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border transition ${!prevLesson ? 'opacity-30 cursor-not-allowed border-white/5 text-[#8f929d]' : 'border-white/20 text-white hover:bg-white/10 hover:border-white/40'}`}
               >
                 <ChevronLeft size={16} /> Aula Anterior
               </button>
               
               <button 
                 onClick={() => {
                   if (!completedLessons[activeLesson.id]) {
                     toggleComplete(activeLesson.id);
                   }
                   navigateToLesson(nextLesson);
                 }}
                 disabled={!nextLesson}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition ${!nextLesson ? 'opacity-30 cursor-not-allowed bg-white/5 text-[#8f929d]' : 'bg-white hover:opacity-90'}`}
                 style={!nextLesson ? {} : { color: '#000000' }}
               >
                 {completedLessons[activeLesson.id] ? "Próxima Aula" : "Concluir e Avançar"} <ChevronRight size={16} />
               </button>
            </div>

            {/* Lesson Title Description below the player */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <h2 className="font-heading font-black text-2xl text-white">
                  {activeLesson.title}
                </h2>
                <p className="text-[#8f929d] text-sm mt-2">
                  Duração da aula: {activeLesson.duration} | Assistido no Duda AEO Player.
                </p>
              </div>

              {/* Lesson Resources / Materials */}
              <div className="flex flex-wrap gap-3">
                {activeLesson.pdfUrl && (
                  <a href={activeLesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition bg-white/5 text-[#F56D41] border border-[#F56D41]/30 hover:border-[#F56D41]">
                    <FileText size={16} />
                    <span>Material PDF</span>
                  </a>
                )}
                {activeLesson.audioUrl && (
                  <a href={activeLesson.audioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition bg-white/5 text-[#C05746] border border-[#C05746]/30 hover:border-[#C05746]">
                    <Headphones size={16} />
                    <span>Áudio (MP3)</span>
                  </a>
                )}
                {activeLesson.externalLink && (
                  <a href={activeLesson.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition bg-white/5 text-[#8f929d] border border-white/10 hover:text-white">
                    <ExternalLink size={16} />
                    <span>Link Útil</span>
                  </a>
                )}
                {(!activeLesson.pdfUrl && !activeLesson.audioUrl && !activeLesson.externalLink) && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition opacity-50 cursor-not-allowed bg-[#12141c] text-[#8f929d] border">
                    <FileText size={16} />
                    <span>Sem materiais extras</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tutor Sapiens Lesson Chat */}
            <div 
              className="mt-8 rounded-2xl border flex flex-col shrink-0 overflow-hidden shadow-2xl bg-[#0c0d12]" 
              style={{ borderColor: "rgba(255,255,255,0.05)", height: "550px", maxHeight: "550px" }}
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 shrink-0 bg-[#12141c]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[#1a1c24] border border-white/10">
                  <Flame size={20} className="text-[#F56D41]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm">Tutor IA</h3>
                  <p className="text-xs text-[#8f929d]">Assistente focado nesta aula</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div 
                ref={chatContainerRef}
                className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto min-h-0 bg-[#0c0d12]"
              >
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} shrink-0`}>
                    <div 
                      className="px-5 py-3 rounded-2xl max-w-[90%] text-[15px] shadow-sm leading-relaxed"
                      style={{
                        backgroundColor: msg.sender === 'user' ? '#1a1c24' : '#12141c',
                        color: msg.sender === 'user' ? '#fff' : '#EBE1D5',
                        border: '1px solid #1a1c24',
                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                        borderBottomLeftRadius: msg.sender === 'sapiens' ? '4px' : '20px',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 shrink-0 bg-[#12141c]">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Faça sua pergunta sobre esta aula..."
                    className="flex-1 bg-[#08080a] border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#F56D41] transition"
                  />
                  <button 
                    type="submit"
                    className="px-5 rounded-xl flex items-center justify-center transition hover:opacity-90 shadow-md bg-[#F56D41] text-white"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Playlist Sidebar Column */}
          {!sidebarCollapsed && (
            <div className="w-80 shrink-0 flex flex-col h-full overflow-y-auto bg-[#12141c] border-l border-white/5 transition-all">
            <div className="p-4">
              <h3 className="font-heading font-bold text-sm tracking-wide text-[#8f929d] uppercase">
                Conteúdo do Curso
              </h3>
            </div>

            <div className="flex-1">
              {modules.map((m, mIdx) => {
                const isExpanded = !!expandedModules[mIdx];
                const isModuleLocked = m.locked && !purchasedBumps.includes(m.id) && user?.role !== 'producer' && user?.role !== 'admin';
                
                return (
                  <div key={mIdx} style={{ backgroundColor: "#12141c" }}>
                    {/* Collapsible Module Header */}
                    <button
                      onClick={() => {
                        if (isModuleLocked) {
                          toast.error("Este módulo é Premium. Adquira no checkout para desbloquear.");
                          return;
                        }
                        setExpandedModules(prev => ({ ...prev, [mIdx]: !prev[mIdx] }));
                      }}
                      className={`w-full px-4 py-4 flex items-center justify-between text-left transition ${isModuleLocked ? 'opacity-60 cursor-not-allowed hover:bg-transparent' : 'hover:bg-white/5'}`}
                    >
                      <div className="pr-2 truncate">
                        <div className="font-heading font-bold text-sm text-white truncate flex items-center gap-2">
                          {isModuleLocked && <Lock size={14} className="text-[#F56D41]" />}
                          {m.title}
                        </div>
                        <div className="text-xs text-[#8f929d] mt-1">
                          {isModuleLocked ? 'Módulo Premium' : `Aulas concluídas: ${getModuleCompletedCount(mIdx)}`}
                        </div>
                      </div>
                      <div className="text-[#8f929d]">
                        {isModuleLocked ? null : (isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />)}
                      </div>
                    </button>

                    {/* Lesson checklist items */}
                    {isExpanded && (
                      <div className="pb-2 bg-[#08080a]">
                        {(m.lessons || []).map((l) => {
                          const isActive = activeLesson.id === l.id;
                          const isDone = completedLessons[l.id];
                          return (
                            <Link
                              key={l.id}
                              to={`/dashboard/courses/${courseId}/modules/${m.id}/lessons/${l.id}`}
                              className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 transition border-l-2 cursor-pointer ${
                                isActive
                                  ? "bg-white/5 border-[#F56D41]"
                                  : "border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3 pr-2 truncate">
                                {/* Completion Circular Checkbox */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleComplete(l.id);
                                  }}
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                    isDone
                                      ? "bg-[#F56D41] border-[#F56D41] text-white"
                                      : "border-[#8f929d] hover:border-white bg-transparent"
                                  }`}
                                >
                                  {isDone && <CheckCircle2 size={12} />}
                                </button>

                                <div className="truncate">
                                  <div
                                    className={`text-sm truncate ${
                                      isActive ? "text-[#F56D41] font-bold" : "text-white"
                                    }`}
                                  >
                                    {l.title}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-[#8f929d] font-mono shrink-0">
                                {l.duration}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
