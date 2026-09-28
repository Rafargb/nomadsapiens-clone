import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCourses } from "../lib/courseStore";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Play, Filter, Info } from "lucide-react";
import { api, persistRef } from "../lib/api";
import PromoCarousel from "../components/PromoCarousel";

export default function Courses() {
  const { language, t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [params] = useSearchParams();

  const categoriesList = language === "pt"
    ? ["Todos", "I.A.", "Nomadismo", "Idiomas", "Carreira", "Finanças"]
    : ["All", "A.I.", "Nomadism", "Languages", "Career", "Finance"];

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      persistRef(ref);
      api.post("/track/click", { ref_code: ref, source: "courses" }).catch(() => {});
    }
  }, [params]);

  useEffect(() => {
    setLoading(true);
    const rawCategories = ["Todos", "IMERSÃO", "IDIOMAS", "CARREIRA", "FINANÇAS", "COMUNIDADE", "MENTORIA"];
    
    // Fallback translation mapping for UI buttons vs internal categories
    const categoryMapping = {
      "Todos": "Todos", "All": "Todos",
      "I.A.": "INTELIGÊNCIA ARTIFICIAL", "A.I.": "INTELIGÊNCIA ARTIFICIAL",
      "Nomadismo": "IMERSÃO", "Nomadism": "IMERSÃO",
      "Idiomas": "IDIOMAS", "Languages": "IDIOMAS",
      "Carreira": "CARREIRA", "Career": "CARREIRA",
      "Finanças": "FINANÇAS", "Finance": "FINANÇAS"
    };

    const uiCategory = categoriesList[activeIndex];
    const backendCat = categoryMapping[uiCategory] || "Todos";

    getCourses().then(allCourses => {
      let filtered = allCourses;

      // Filter by Category
      if (backendCat !== "Todos") {
        filtered = filtered.filter(c => c.category === backendCat);
      }

      setCourses(filtered);
    })
    .catch((err) => {
      console.error("Failed to load courses:", err);
      setCourses([]);
    })
    .finally(() => {
      setLoading(false);
    });
  }, [activeIndex, language]);


  return (
    <div className="bg-white min-h-screen pb-10">
      <Navbar />
      {(courses.length > 0 || loading) && (
        <PromoCarousel courses={courses} />
      )}

      <section data-testid="courses-hero" className="pt-24 md:pt-32 pb-8 nomad-container">
        <h1 
          className="font-black text-5xl md:text-6xl tracking-tighter mt-3 text-[#111]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {t("courses.title")}
        </h1>
        <p className="text-gray-500 mt-4 mb-10 max-w-xl font-medium text-lg leading-relaxed">
          {t("courses.desc")}
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-12">
          {categoriesList.map((cat, idx) => (
            <button
              key={cat}
              data-testid={`filter-${cat.toLowerCase()}`}
              onClick={() => setActiveIndex(idx)}
              style={activeIndex === idx ? { backgroundColor: '#E50914' } : undefined}
              className={`px-5 py-2.5 rounded-md text-xs font-black tracking-widest uppercase transition-all shadow-sm ${
                activeIndex === idx
                  ? "text-white scale-105"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="nomad-container pb-24">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse nomad-card">
                <div className="aspect-[4/3] bg-nomad-sand" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-nomad-sand rounded w-3/4" />
                  <div className="h-4 bg-nomad-sand rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div data-testid="courses-empty" className="text-center py-20 text-nomad-muted">
            {t("courses.empty")}
          </div>
        ) : (
          <div data-testid="courses-grid" className="mb-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <CourseCard key={c.id || c.course_id} c={c} t={t} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function CourseCard({ c, t }) {
  return (
    <Link
      to={`/courses/${c.id || c.course_id}`}
      className="group rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col border h-full"
      style={{ backgroundColor: '#ffffff', borderColor: '#E6D7C3' }}
    >
      {/* Top half: Image strictly contained */}
      <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden" style={{ backgroundColor: '#f3efea' }}>
        <img 
          src={c.thumbnail || c.thumbnailHorizontal} 
          alt={c.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {/* Category Tag */}
        <div className="absolute top-4 left-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-sm shadow-lg drop-shadow-md"
            style={{ backgroundColor: '#dc2626' }}
          >
            <span className="text-white text-[10px] font-black tracking-widest uppercase">{c.category}</span>
          </div>
        </div>
      </div>

      {/* Bottom half: Text Content on solid background */}
      <div className="flex flex-col grow p-5 sm:p-6" style={{ backgroundColor: '#ffffff' }}>
        <h3 
          className="font-black text-2xl leading-tight mb-3 tracking-tight group-hover:text-red-600 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}
        >
          {c.title}
        </h3>
        
        <p 
          className="text-[15px] line-clamp-2 font-medium leading-relaxed mb-6 grow"
          style={{ fontFamily: "'Inter', sans-serif", color: '#5c5c5c' }}
        >
          {c.description}
        </p>
        
        <div className="flex items-center justify-between pt-5 border-t mt-auto" style={{ borderColor: '#E6D7C3' }}>
          <div 
            className="font-black text-[22px] tracking-tighter"
            style={{ fontFamily: "'Inter', sans-serif", color: '#1a1a1a' }}
          >
            {c.price || c.formattedPrice}
          </div>
          
          <button 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-transparent rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 border shrink-0"
            style={{ borderColor: '#E6D7C3', color: '#1a1a1a' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3efea'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Info size={16} />
            <span>Mais Informações</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
