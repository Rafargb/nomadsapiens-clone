import React from "react";
import { Link } from "react-router-dom";
import MembersAreaLayout from "../components/MembersAreaLayout";
import PromoCarousel from "../components/PromoCarousel";
import {
  Lock,
  ChevronRight,
  Settings,
  Image as ImageIcon,
  BookOpen,
  Mic,
  Video,
  Database,
  Eye
} from "lucide-react";
import { getCourses } from "../lib/courseStore";
import { getUserCourses } from "../lib/enrollmentStore";
import { useAuth } from "../context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();
  
  const [courses, setCourses] = React.useState([]);
  const [promoCourses, setPromoCourses] = React.useState([]);

  const loadCourses = React.useCallback(() => {
    if (user?.role === 'producer' || user?.role === 'admin') {
      getCourses().then((all) => {
        setCourses(all);
        setPromoCourses(all);
      });
    } else {
      Promise.all([getUserCourses(user?.id), getCourses()]).then(([enrolled, all]) => {
        setCourses(enrolled);
        const enrolledIds = enrolled.map(c => c.id || c.course_id);
        const enrolledProducerIds = new Set(enrolled.map(c => c.producerId).filter(Boolean));
        
        const unpurchased = all.filter(c => !enrolledIds.includes(c.id));
        
        let recommended = [];
        if (enrolledProducerIds.size > 0) {
          // Filtrar não comprados do mesmo produtor
          recommended = unpurchased.filter(c => enrolledProducerIds.has(c.producerId));
        }

        // Se não tiver nenhum recomendado do mesmo produtor, cai pro fallback (outros cursos)
        setPromoCourses(recommended.length > 0 ? recommended : unpurchased);
      });
    }
  }, [user]);

  React.useEffect(() => {
    loadCourses();
    
    const handleStorageChange = () => {
      loadCourses();
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("courses_updated", handleStorageChange);
    window.addEventListener("enrollments_updated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("courses_updated", handleStorageChange);
      window.removeEventListener("enrollments_updated", handleStorageChange);
    };
  }, [loadCourses]);

  const handleItemClick = (e, item) => {
    if (item.locked) {
      e.preventDefault();
      // Em um ambiente real, pegaria a URL de checkout do item configurada no painel
      alert(`Redirecionando para a página de vendas/checkout deste item...`);
    }
  };

  return (
    <MembersAreaLayout>
      <div className="bg-[#08080a] min-h-screen text-white relative">
        
        {/* Full-width Top Promotional Banner / Hero */}
        <div className="w-full">
          <PromoCarousel courses={promoCourses} />
        </div>

        {/* Content Wrapper */}
        <div className="p-6 md:p-10 relative z-20 -mt-20 md:-mt-32">
          <div className="space-y-12 max-w-[1600px] mx-auto">

          {(!courses || courses.length === 0) && (
            <div className="text-center py-20 bg-[#12141c] rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Você ainda não tem cursos liberados.</h2>
              <p className="text-[#8f929d] mb-8">Navegue pelo nosso catálogo e descubra novos horizontes.</p>
              <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C05746] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Explorar Catálogo
              </Link>
            </div>
          )}

          {courses && courses.map((course) => {
            // If the course has no modules, don't render the section
            if (!course.modules || course.modules.length === 0) return null;

            return (
              <section key={course.id} className="bg-[#12141c] rounded-2xl p-6 md:p-8 relative shadow-sm">
                {/* Section Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="font-heading font-bold text-[22px] md:text-2xl text-white tracking-tight">
                      {course.title}
                    </h2>
                    {course.category && (
                      <div 
                        className="font-bold tracking-wider uppercase rounded-full flex-shrink-0 bg-[#C05746] text-white"
                        style={{ 
                          fontSize: "10px", 
                          padding: "3px 10px",
                          marginTop: "2px"
                        }}
                      >
                        {course.category}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-[#8f929d] mt-1">
                    {course.description}
                  </p>
                </div>

                {/* Native Horizontal Scroll Container for Vertical Posters */}
                <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x relative">
                {course.modules.map((mod) => (
                  <Link
                    key={mod.id}
                    to={mod.locked ? "#" : `/dashboard/courses/${course.id}/modules/${mod.id}`}
                    onClick={(e) => handleItemClick(e, mod)}
                    className="group flex flex-col snap-start transition-transform duration-300 hover:-translate-y-1"
                    style={{ width: "240px", minWidth: "240px" }}
                  >
                    {/* Clean Image Container - Fixed Dimensions to prevent flex distortion */}
                    <div 
                      className="relative w-full rounded-xl overflow-hidden bg-[#0c0d12] shadow-md flex-shrink-0"
                      style={{ height: "426px" }}
                    >
                      {mod.posterVertical ? (
                        <img 
                          src={mod.posterVertical} 
                          alt="" 
                          className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${mod.locked ? 'opacity-50 group-hover:opacity-70' : 'opacity-100 group-hover:opacity-90'}`}
                          style={mod.locked ? { filter: "grayscale(100%)" } : {}}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#08080a]">
                          <Video size={40} className="text-[#8f929d] opacity-30" />
                        </div>
                      )}
                      
                      {/* Lock Icon Overlay (Stays on image) */}
                      {mod.locked && (
                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center shadow-sm z-20 border border-white/10">
                          <Lock size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Subtle Tags Below Image */}
                    <div className="flex items-center justify-between px-1" style={{ marginTop: "14px" }}>
                      <div className={`flex items-center gap-1.5 font-medium tracking-wide ${mod.locked ? 'text-[#8f929d]' : 'text-white'}`} style={{ fontSize: "11px" }}>
                         <span className="truncate max-w-[200px] uppercase group-hover:text-[#F56D41] transition-colors">{mod.title}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Navigation Chevron (Right edge fader) */}
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#12141c] to-transparent pointer-events-none flex items-center justify-end pr-4 z-30">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg pointer-events-auto cursor-pointer transition text-[#EBE1D5] bg-[#2C3A32] hover:bg-[#C85B46] hover:text-white"
                >
                  <ChevronRight size={20} />
                </div>
              </div>

            </section>
          );
          })}

          </div>
        </div>
      </div>
    </MembersAreaLayout>
  );
}
