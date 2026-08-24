import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { getLocalizedCourse } from "../lib/translations";
import { getCourses } from "../lib/courseStore";
import { getSiteSettings } from "../lib/settingsStore";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowRight,
  MapPin,
  TrendingUp,
  Users,
  Briefcase,
  Globe2,
  Sparkles,
  ArrowUpRight,
  Share2,
  DollarSign,
  Zap,
} from "lucide-react";

const HERO_IMG = "/hero-nomad.jpg";

export default function Landing() {
  const { language, t } = useLanguage();
  const [rawCourses, setRawCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getCourses().then(r => {
      setRawCourses(r);
    });
    getSiteSettings().then(setSettings);
  }, []);

  useEffect(() => {
    // Filter courses by the active language (pt or en), supporting 'both'
    let filtered = rawCourses.filter(c => {
      const lang = c.courseLanguage || 'en';
      return lang === 'both' || lang === language;
    });
    
    // Fallback: If no courses match the language, just show the available ones
    // instead of an empty section which looks like a bug
    if (filtered.length === 0 && rawCourses.length > 0) {
      filtered = rawCourses;
    }
    
    setCourses(filtered.slice(0, 3));
  }, [rawCourses, language]);

  const localizedDestinations = [
    {
      city: "Bali",
      country: language === "pt" ? "Indonésia" : "Indonesia",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      stat: language === "pt" ? "2.4k nômades ativos" : "2.4k active nomads",
    },
    {
      city: language === "pt" ? "Lisboa" : "Lisbon",
      country: "Portugal",
      img: "https://images.pexels.com/photos/17564678/pexels-photo-17564678.jpeg?auto=compress&cs=tinysrgb&w=940",
      stat: language === "pt" ? "1.9k nômades ativos" : "1.9k active nomads",
    },
    {
      city: "Medellín",
      country: language === "pt" ? "Colômbia" : "Colombia",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
      stat: language === "pt" ? "1.1k nômades ativos" : "1.1k active nomads",
    },
  ];

  const localizedTestimonials = [
    {
      name: "Sarah Jenkins",
      role: language === "pt" ? "Escritora Freelance" : "Freelance Writer",
      location: language === "pt" ? "Bali, Indonésia" : "Bali, Indonesia",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&auto=format&fit=crop&q=60",
      quote: language === "pt"
        ? "Troquei o 9-5 pelo 5 da manhã assistindo o sol nascer em Canggu. Hoje ganho em USD e pago aluguel em rúpias."
        : "Traded the 9-to-5 for 5 AM watching the sunrise in Canggu. Today I earn in USD and pay rent in rupees.",
    },
    {
      name: "Marcus Chen",
      role: language === "pt" ? "Desenvolvedor" : "Software Developer",
      location: "Lisboa, Portugal",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60",
      quote: language === "pt"
        ? "Com os cursos da Nomad Sapiens, fechei meu primeiro contrato internacional em 6 semanas. Hoje vivo em Alfama."
        : "With Nomad Sapiens courses, I closed my first international contract in 6 weeks. Today I live in Alfama.",
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Digital",
      location: language === "pt" ? "Medellín, Colômbia" : "Medellín, Colombia",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60",
      quote: language === "pt"
        ? "O sistema de afiliados transformou minha audiência em receita recorrente. 50% de comissão muda tudo."
        : "The affiliate system transformed my audience into recurring revenue. 50% commission changes everything.",
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section data-testid="landing-hero" className="relative pt-32 md:pt-48 min-h-[100vh] flex flex-col justify-start">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232F2A] via-transparent to-transparent" />
        </div>

        <div className="relative nomad-container py-12 md:py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8 text-white animate-fade-in-up">
            <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tighter">
              {settings?.hero_title || <>{t("landing.heroTitle1")}<br /><span className="italic font-serif font-light">{t("landing.heroTitle2")}</span> {t("landing.heroTitle3")}</>}
            </h1>

            <p className="mt-7 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              {settings?.hero_subtitle || t("landing.heroDesc")}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register" data-testid="hero-cta-primary" className="btn-primary text-base">
                {t("landing.startEvolution")} <ArrowRight size={18} />
              </Link>
              <Link to="/courses" data-testid="hero-cta-secondary" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold px-6 py-3.5 rounded-full border border-white/30 hover:bg-white/10 transition-all">
                {t("landing.viewCourses")} <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-xl">
              {[
                { k: "12.5k+", v: t("landing.activeNomads") },
                { k: "47", v: t("landing.countries") },
                { k: language === "pt" ? "R$ 8M+" : "$1.6M+", v: t("landing.paidAffiliates") },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl md:text-4xl font-heading font-black text-[#E6D7C3]">
                    {s.k}
                  </div>
                  <div className="text-xs uppercase tracking-wider text-white/60 mt-1">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COURSES STRIP (Dark Layout) */}
      <section className="bg-[#232F2A] text-white py-16 md:py-24 grain">
        <div className="nomad-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="overline text-[#E6D7C3]">{t("landing.pathsTitle")}</div>
              <h2 className="font-heading font-black text-4xl md:text-5xl mt-3">
                {t("landing.pathsSubtitle1")}<br />
                <span className="italic font-serif font-light">{t("landing.pathsSubtitle2")}</span>
              </h2>
            </div>
            <Link to="/courses" className="text-sm text-[#E6D7C3] hover:text-white inline-flex items-center gap-1 font-semibold">
              {t("landing.exploreAll")} <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className={`grid gap-5 ${courses.length === 1 ? 'md:grid-cols-1' : courses.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {courses.map((c, i) => (
              <Link
                key={c.id || c.course_id || i}
                to={`/courses/${c.id || c.course_id}`}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer block"
              >
                <img
                  src={c.thumbnailHorizontal || c.thumbnail}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161111] via-[#161111]/40 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-1.5 text-[#E6D7C3] text-xs uppercase tracking-wider font-bold">
                    <Briefcase size={14} /> {c.category}
                  </div>
                  <div className="font-heading font-black text-3xl md:text-4xl mt-3 text-white leading-tight">
                    {c.title}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-white/70 text-sm">
                    <span>{c.level || "BEGINNER"} <span className="mx-2">•</span> {c.duration_hours || "10"}{t("courses.hours")}</span>
                    <span className="font-heading font-black text-white text-xl">{c.price || c.formattedPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* METHOD BENTO */}
      <section className="py-20 md:py-32 bg-[#F3EFEA]">
        <div className="nomad-container">
          <div className="overline">{t("landing.methodTitle")}</div>
          <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter mt-3 max-w-3xl">
            {t("landing.methodSubtitle1")}<br />
            <span className="italic font-serif font-light">{t("landing.methodSubtitle2")}</span>
          </h2>

          <div className="grid md:grid-cols-6 gap-5 mt-14">
            <div className="md:col-span-3 bg-[#232F2A] text-white rounded-3xl p-8 md:p-12 relative overflow-hidden min-h-[340px] grain">
              <Globe2 size={44} className="text-[#E6D7C3] mb-6" />
              <h3 className="font-heading font-black text-3xl md:text-4xl">
                {t("landing.pilar1Title")}
              </h3>
              <p className="text-white/70 mt-4 max-w-md leading-relaxed">
                {t("landing.pilar1Desc")}
              </p>
            </div>

            <div className="md:col-span-3 bg-[#C05746] text-white rounded-3xl p-8 md:p-12 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
              <DollarSign size={44} className="text-white/80" />
              <div>
                <h3 className="font-heading font-black text-3xl md:text-4xl">
                  {t("landing.pilar2Title")}
                </h3>
                <p className="text-white/85 mt-4 leading-relaxed">
                  {t("landing.pilar2Desc")}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#E6D7C3] min-h-[260px] flex flex-col justify-between">
              <Users size={32} className="text-[#2D4A22]" />
              <div>
                <h3 className="font-heading font-bold text-xl">{t("landing.pilar3Title")}</h3>
                <p className="text-nomad-muted text-sm mt-2">
                  {t("landing.pilar3Desc")}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl overflow-hidden border border-[#E6D7C3] min-h-[260px]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-[#E6D7C3] min-h-[260px] flex flex-col justify-between">
              <TrendingUp size={32} className="text-[#C05746]" />
              <div>
                <h3 className="font-heading font-bold text-xl">{t("landing.pilar4Title")}</h3>
                <p className="text-nomad-muted text-sm mt-2">
                  {t("landing.pilar4Desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AFFILIATE CTA */}
      <section id="affiliates" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FBF9F6] via-[#E6D7C3]/30 to-[#FBF9F6]" />
        <div className="nomad-container relative">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6">
              <div className="overline">{t("landing.affiliateTitle")}</div>
              <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter mt-3">
                {t("landing.affiliateSubtitle1")}<br />
                <span className="italic font-serif font-light">{t("landing.affiliateSubtitle2")}</span>
              </h2>
              <p className="mt-6 text-nomad-muted text-lg leading-relaxed max-w-lg">
                {t("landing.affiliateDesc")}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" data-testid="affiliate-cta-btn" className="btn-primary">
                  {t("landing.beAffiliate")} <ArrowRight size={18} />
                </Link>
                <Link to="/courses" data-testid="producer-cta-btn" className="btn-secondary">
                  {t("landing.beProducer")} <Briefcase size={16} />
                </Link>
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-[#E6D7C3] hover:border-[#C05746] transition group">
                  <Share2 size={28} className="text-[#C05746]" />
                  <div className="mt-4 font-heading font-black text-2xl md:text-3xl leading-tight">{t("landing.tribeBox1Value")}</div>
                  <div className="text-sm text-nomad-muted mt-2">{t("landing.tribeBox1Label")}</div>
                </div>
                <div className="bg-[#232F2A] text-white rounded-2xl p-6 col-span-1 mt-8">
                  <Globe2 size={28} className="text-[#E6D7C3]" />
                  <div className="mt-4 font-heading font-black text-2xl md:text-3xl leading-tight">{t("landing.tribeBox2Value")}</div>
                  <div className="text-sm text-white/70 mt-2">{t("landing.tribeBox2Label")}</div>
                </div>
                <div className="bg-[#C05746] text-white rounded-2xl p-6">
                  <Users size={28} />
                  <div className="mt-4 font-heading font-black text-2xl md:text-3xl leading-tight">{t("landing.tribeBox3Value")}</div>
                  <div className="text-sm text-white/80 mt-2">{t("landing.tribeBox3Label")}</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-[#E6D7C3] mt-[-2rem]">
                  <Sparkles size={28} className="text-[#2D4A22]" />
                  <div className="mt-4 font-heading font-black text-2xl md:text-3xl leading-tight">{t("landing.tribeBox4Value")}</div>
                  <div className="text-sm text-nomad-muted mt-2">{t("landing.tribeBox4Label")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-32">
        <div className="nomad-container">
          <div className="overline">{t("landing.testimonialsTitle")}</div>
          <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter mt-3 max-w-3xl">
            {t("landing.testimonialsSubtitle1")}<br />
            <span className="italic font-serif font-light">{t("landing.testimonialsSubtitle2")}</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {localizedTestimonials.map((t, i) => (
              <div key={i} className="nomad-card p-6 hover:-translate-y-1 transition-all">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-5">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-nomad-ink leading-relaxed italic text-[15px]">
                  "{t.quote}"
                </p>
                <div className="mt-5 pt-5 border-t border-[#E6D7C3]">
                  <div className="font-heading font-bold">{t.name}</div>
                  <div className="text-sm text-nomad-muted">{t.role}</div>
                  <div className="text-xs text-[#C05746] mt-1 flex items-center gap-1">
                    <MapPin size={10} /> {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-32 bg-[#232F2A] text-white relative overflow-hidden grain">
        <div className="nomad-container text-center">
          <div className="overline text-[#E6D7C3]">{t("landing.finalTitle")}</div>
          <h2 className="font-heading font-black text-5xl md:text-7xl tracking-tighter mt-4 max-w-4xl mx-auto leading-[0.95]">
            {t("landing.finalSubtitle1")}<br />
            <span className="italic font-serif font-light">{t("landing.finalSubtitle2")}</span>
          </h2>
          <div className="mt-10">
            <Link to="/register" className="btn-primary text-base">
              {t("landing.startNow")} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
