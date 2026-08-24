const STORAGE_KEY = "nomad_sapiens_courses_v11";

export const COURSE_CATEGORIES = [
  "INTELIGÊNCIA ARTIFICIAL",
  "IMERSÃO",
  "CARREIRA",
  "IDIOMAS",
  "FINANÇAS",
  "SAÚDE",
  "COMUNIDADE",
  "MENTORIA"
];

const INITIAL_COURSES = [
  {
    id: "ugc-mastery",
    producerId: "prod-1",
    title: "UGC REALISTIC AI MASTERY",
    category: "INTELIGÊNCIA ARTIFICIAL",
    courseLanguage: "both",
    description_en: "Master the creation of hyper-realistic AI influencers and videos. Use the DNA-Lock System to forge high-converting UGC ads, flawless social media content, and earn income 💰",
    description_pt: "Domine a criação de influenciadores de IA e vídeos hiper-realistas. Use o Sistema DNA-Lock para criar anúncios UGC de alta conversão, conteúdo impecável e gerar renda 💰",
    price: "$67",
    stripeLink: "https://buy.stripe.com/test_eVaeYpeHccwE8w0eUU",
    level: "BEGINNER",
    duration_hours: "45",
    thumbnailHorizontal: "/miniatura.png",
    promoVideo: "https://www.loom.com/embed/e0838a4ac97647beb59ed491e6407579?autoplay=0&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true",
    gallery: [
      "/miniatura.png",
      "/comparativo.png",
      "/depoimentos.png",
      "/garant.png"
    ],
    aboutContent: `
      <div style="font-family: Arial, sans-serif; color: #202124; line-height: 1.6;">
        <p style="margin-bottom: 8px; font-weight: bold; font-size: 17px;">
          ⭐ The Official UGC Realistic AI Mastery Program
        </p>
        <p style="margin-bottom: 8px;">
          🥇 Powered by the exclusive <span style="font-weight: bold; color: #F56D41;">DNA-Lock™ System</span>
        </p>
        <p style="margin-bottom: 24px;">
          🏆 Built for content creators and entrepreneurs scaling globally
        </p>
        
        <div style="background-color: #FFF3E0; border-left: 4px solid #F56D41; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin-bottom: 8px; font-weight: bold; color: #D32F2F;">
            🚨 VIP Founders Batch: Limited spots available at $67
          </p>
          <p style="margin-bottom: 0; font-weight: bold;">
            ‼️ Once this batch is full, the price auto-updates to the official $497
          </p>
        </div>

        <p style="margin-bottom: 16px; font-weight: bold; font-size: 17px;">
          What's inside? 🚀
        </p>

        <ul style="list-style-type: none; padding-left: 0; margin-bottom: 16px;">
          <li style="margin-bottom: 12px;">✅ Create and monetize hyper-realistic AI influencers & UGC ads</li>
          <li style="margin-bottom: 12px;">✅ Forge your digital human's exact "Genetic Code" (textures, lighting, anatomy)</li>
          <li style="margin-bottom: 12px;">✅ Master 100% character consistency with the DNA-Lock System</li>
          <li style="margin-bottom: 12px;">✅ Put your character in any environment, outfit, or angle flawlessly</li>
          <li style="margin-bottom: 12px;">✅ Animate your AI with fluid movement and perfect lip-sync</li>
          <li style="margin-bottom: 12px;">✅ Direct, no-fluff workflow to get fast results from anywhere in the world</li>
          <li style="margin-bottom: 12px;">✅ Learn Expert-level prompting with my personal Copy & Paste Vault</li>
          <li style="margin-bottom: 12px;">✅ Build AI UGC ads that global brands actually pay for</li>
          <li style="margin-bottom: 12px;">✅ Lifetime access + The Official Workflow Checklist</li>
        </ul>
      </div>
    `,
    modules: [
      {
        id: "mod-1-1",
        title: "VISÃO GERAL",
        iconName: "Eye",
        posterVertical: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=600&fit=crop&q=80",
        locked: false,
        lessons: [
          { id: "les-1-1-1", title: "O que é o nomadismo digital?", duration: "12:45", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", videoUrl_pt: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", videoUrl_en: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
          { id: "les-1-1-2", title: "Mitos e Verdades", duration: "15:20", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
        ]
      },
      {
        id: "mod-1-2",
        title: "MINDSET E ESTRATÉGIA",
        iconName: "BookOpen",
        posterVertical: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80",
        locked: false,
        lessons: [
          { id: "les-1-2-1", title: "Preparando a mentalidade", duration: "10:00", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
        ]
      },
      {
        id: "mod-1-3",
        title: "FERRAMENTAS SECRETAS",
        iconName: "Settings",
        posterVertical: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=600&fit=crop&q=80",
        locked: true,
        price: 27,
        lessons: []
      }
    ]
  },
  {
    id: "course-2",
    producerId: "prod-1",
    title: "Freelancing Masters",
    category: "CARREIRA",
    courseLanguage: "pt",
    description: "Master the art of acquiring high-paying international clients.",
    price: "$59.00",
    level: "INTERMEDIATE",
    duration_hours: "30",
    thumbnailHorizontal: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80",
    aboutContent: `
      <div style="margin-bottom: 24px;">
        <div style="width: 100%; height: 300px; background: #E4E4E6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #5D6068; font-weight: bold;">[Placeholder Vídeo de Introdução]</div>
      </div>
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #161111;">Domine o Freelancing</h2>
      <p style="margin-bottom: 16px; line-height: 1.6; color: #333;">Aprenda a arte de adquirir clientes internacionais que pagam em Dólar e Euro.</p>
    `,
    modules: [
      {
        id: "mod-2-1",
        title: "PRIMEIROS CLIENTES",
        iconName: "Briefcase",
        posterVertical: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&q=80",
        locked: false,
        lessons: []
      },
      {
        id: "mod-2-2",
        title: "GRUPO DE MENTORIA VIP",
        iconName: "Star",
        posterVertical: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=600&fit=crop&q=80",
        locked: true,
        price: 97.00,
        bumpDescription: "Acesso por 1 ano ao nosso grupo secreto no Discord para networking com outros freelancers.",
        lessons: []
      },
      {
        id: "mod-2-3",
        title: "PACK DE CONTRATOS (PDF)",
        iconName: "FileText",
        posterVertical: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=400&h=600&fit=crop&q=80",
        locked: true,
        price: 19.90,
        bumpDescription: "Modelos validados de contratos internacionais em Inglês e Espanhol prontos para uso.",
        lessons: []
      }
    ]
  },
  {
    id: "course-3",
    producerId: "prod-2",
    title: "Nomadismo para Iniciantes",
    category: "LIFESTYLE",
    courseLanguage: "pt",
    description: "Tudo o que você precisa saber para começar sua jornada nômade.",
    price: "$29.00",
    level: "BEGINNER",
    duration_hours: "15",
    thumbnailHorizontal: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    aboutContent: "<p>Conteúdo fictício.</p>",
    modules: []
  },
  {
    id: "course-4",
    producerId: "prod-3",
    title: "Global Taxation Strategies",
    category: "FINANÇAS",
    courseLanguage: "en",
    description: "Learn how to legally optimize your taxes as a digital nomad.",
    price: "$199.00",
    level: "ADVANCED",
    duration_hours: "40",
    thumbnailHorizontal: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=800&q=80",
    aboutContent: "<p>Mock content.</p>",
    modules: []
  },
  {
    id: "course-5",
    producerId: "prod-4",
    title: "Digital Marketing Fast Track",
    category: "CARREIRA",
    courseLanguage: "en",
    description: "Launch your first digital marketing agency from anywhere.",
    price: "$49.00",
    level: "INTERMEDIATE",
    duration_hours: "20",
    thumbnailHorizontal: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
    aboutContent: "<p>Mock content.</p>",
    modules: []
  }
];

import { supabase } from "./supabaseClient";

export async function getCourses() {
  let dbCourses = null;
  
  // Fast fail if Supabase is not configured to avoid long timeouts blocking the UI
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                              import.meta.env.VITE_SUPABASE_URL !== "https://YOUR_SUPABASE_PROJECT.supabase.co" &&
                              !import.meta.env.VITE_SUPABASE_URL.includes("placeholder");

  if (isSupabaseConfigured) {
    try {
      const fetchPromise = supabase.from('courses').select('*');
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1500));
      
      const { data: courses, error } = await Promise.race([fetchPromise, timeoutPromise]);
      if (!error && courses && courses.length > 0) {
        dbCourses = courses;
      }
    } catch (e) {
      console.warn("Supabase fetch courses failed or timed out");
    }
  }

  const localStr = localStorage.getItem(STORAGE_KEY);
  let localCourses = null;
  if (localStr) {
    try {
      localCourses = JSON.parse(localStr);
    } catch (e) {
      console.warn("Invalid courses in localStorage, ignoring.");
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Prioritize localCourses (which contains producer creations) over INITIAL_COURSES
  if (localCourses) {
    let cacheUpdated = false;
    localCourses.forEach(c => {
      if ((c.id === "ugc-mastery" || c.course_id === "ugc-mastery") && c.category === "IMERSÃO") {
        c.category = "INTELIGÊNCIA ARTIFICIAL";
        cacheUpdated = true;
      }
    });
    if (cacheUpdated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localCourses));
    }
  }

  const baseCourses = dbCourses || localCourses || INITIAL_COURSES;

  return baseCourses.map(course => {
    const initialMatch = INITIAL_COURSES.find(c => c.id === course.id || c.course_id === course.id);
    return {
      ...initialMatch, 
      ...course,       
      promoVideo: course.promoVideo || initialMatch?.promoVideo || null,
      gallery: course.gallery || initialMatch?.gallery || [],
      modules: course.modules || initialMatch?.modules || [],
      aboutContent: course.aboutContent || initialMatch?.aboutContent || null,
      price: course.price ? (course.price.toString().startsWith('$') ? course.price : `$${course.price}`) : (initialMatch?.price || "$0"),
      formattedPrice: course.price ? (course.price.toString().startsWith('$') ? course.price : `$${course.price}`) : (initialMatch?.price || "$0")
    };
  });
}

export async function saveCourses(coursesArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coursesArray));
  console.log("Saved courses to local cache");
}
