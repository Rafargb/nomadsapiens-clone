import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PromoCarousel({ courses = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    if (!courses || courses.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [courses]);

  if (!courses || courses.length === 0) {
    // Fallback if no courses provided (e.g., loading or empty)
    return <div className="w-full bg-[#08080a]" style={{ height: '550px' }} />;
  }

  const current = courses[currentIndex];

  const handleNext = () => setCurrentIndex((p) => (p + 1) % courses.length);
  const handlePrev = () => setCurrentIndex((p) => (p - 1 + courses.length) % courses.length);

  // Get current language description
  const currentDescription = language === 'pt' 
    ? (current.description_pt || current.description) 
    : (current.description_en || current.description);

  return (
    <div className="relative w-full overflow-hidden group bg-[#08080a]" style={{ height: '550px' }}>
      {/* Background Images */}
      {courses.map((course, idx) => (
        <div 
          key={course.id || course.course_id}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img 
            src={course.thumbnailHorizontal || course.thumbnail || "/cyber-banner.webp"} 
            alt={course.title} 
            className="w-full h-full object-cover object-right md:object-center opacity-40"
          />
        </div>
      ))}

      {/* Netflix-style ultra-smooth Custom Gradient */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-full z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #08080a 0%, #08080a 5%, rgba(8,8,10,0.8) 20%, rgba(8,8,10,0.5) 40%, rgba(8,8,10,0.1) 70%, transparent 100%)'
        }}
      ></div>
      {/* Left-side dark gradient to make text readable and hide background text clash */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/90 md:via-[#08080a]/70 to-transparent z-0 pointer-events-none" style={{ width: '90%' }}></div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center pt-24 px-6 md:px-10 mx-auto" style={{ maxWidth: '1600px' }}>
        <div className="max-w-2xl w-full transition-all duration-700 transform translate-y-0 opacity-100" style={{ marginLeft: "clamp(0px, 5vw, 80px)" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm mb-4 shadow-lg" style={{ backgroundColor: '#E50914' }}>
            <span className="text-white text-[10px] font-black tracking-widest uppercase">{current.category || "Original SAPIENS"}</span>
          </div>
          
          <h2 
            className="font-black text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight drop-shadow-2xl tracking-tighter"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {current.title}
          </h2>
          
          <p className="text-white/90 text-base md:text-lg mb-8 max-w-xl font-medium drop-shadow-md leading-relaxed line-clamp-3">
            {currentDescription || "Domine as ferramentas secretas e posicione-se no mercado como um profissional de elite."}
          </p>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => navigate(`/courses/${current.id || current.course_id}`)}
              className="flex items-center justify-center gap-2.5 px-6 py-3 md:px-8 md:py-3.5 bg-[#C05746] rounded-xl font-bold text-base md:text-lg transition-all shadow-lg w-auto text-white transform hover:scale-105 active:scale-95"
            >
              <Play size={22} fill="currentColor" stroke="currentColor" />
              <span>Conhecer Curso</span>
            </button>
            <button 
              onClick={() => navigate(`/courses/${current.id || current.course_id}`)}
              className="flex items-center justify-center gap-2.5 px-6 py-3 md:px-8 md:py-3.5 text-white rounded-xl font-bold text-base md:text-lg transition-all shadow-lg w-auto transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(109,109,110,0.7)' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(109,109,110,0.4)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(109,109,110,0.7)'}
            >
              <Info size={22} />
              <span>Mais Informações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {courses.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white/50 hover:bg-black/60 hover:text-white backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white/50 hover:bg-black/60 hover:text-white backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={32} />
          </button>
          
          <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
            {courses.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[#F56D41]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
