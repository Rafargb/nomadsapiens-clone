import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { api, persistRef, getPersistedRef, formatError } from "../lib/api";
import { getCourses } from "../lib/courseStore";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Clock, BarChart3, Layers, CheckCircle2, ArrowRight, ShieldCheck, Globe2 } from "lucide-react";
import CheckoutModal from "../components/CheckoutModal";

export default function CourseDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { language, t } = useLanguage();
  const [rawCourse, setRawCourse] = useState(null);
  const [course, setCourse] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      persistRef(ref);
      api.post("/track/click", { ref_code: ref, course_id: id, source: "course-detail" }).catch(() => {});
    }
    setLoading(true);

    getCourses().then(allCourses => {
      const foundCourse = allCourses.find(c => c.id === id || c.course_id === id);
      
      if (foundCourse) {
        // Map to expected format for rendering
        setCourse({
          ...foundCourse,
          thumbnail: foundCourse.thumbnailHorizontal || foundCourse.thumbnail,
          formattedPrice: foundCourse.price || foundCourse.formattedPrice,
          modules: foundCourse.modules || []
        });

        if (foundCourse.promoVideo) {
          setActiveMedia({ type: 'video', url: foundCourse.promoVideo });
        } else if (foundCourse.gallery && foundCourse.gallery.length > 0) {
          setActiveMedia({ type: 'image', url: foundCourse.gallery[0] });
        }
      } else {
        setCourse(null);
      }
      setLoading(false);
    });
  }, [id, params]);

  const handleBuy = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }
    // Open the Skool-style Checkout Modal
    setShowCheckout(true);
  };

  if (loading) return (<div><Navbar /><div className="pt-40 nomad-container">{t("courseDetail.loading")}</div></div>);
  if (!course) return (<div><Navbar /><div className="pt-40 nomad-container">{t("courseDetail.notFound")}</div></div>);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div style={{ paddingTop: '96px', paddingBottom: '48px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: '1085px', gap: '40px', padding: '0 16px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Rich Content Feed (max 770px) */}
          <div style={{ flex: '2 1 100%', minWidth: '471px', maxWidth: '770px' }}>
            <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: '#E4E4E6' }}>
              
              {/* Skool Title */}
              <h1 style={{ fontFamily: 'Roboto, Arial, sans-serif', fontSize: '23px', fontWeight: 'bold', marginBottom: '24px', color: '#202124', textTransform: 'uppercase' }}>
                {course.title}
              </h1>

              {/* Video Player Placeholder / Embedded Video */}
              {activeMedia ? (
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                  {activeMedia.type === 'video' ? (
                    <iframe 
                      src={activeMedia.url} 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      title="Promo Video" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen>
                    </iframe>
                  ) : (
                    <img 
                      src={activeMedia.url} 
                      alt="Gallery" 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  )}
                </div>
              ) : (
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#E4E4E6', borderRadius: '10px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#909090' }}>No Media Available</span>
                </div>
              )}

              {/* Thumbnails Gallery Row */}
              {course.gallery && course.gallery.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }} className="scrollbar-hide">
                  {course.promoVideo && (
                    <div 
                      onClick={() => setActiveMedia({ type: 'video', url: course.promoVideo })}
                      style={{ 
                        position: 'relative', height: '90px', width: '90px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${course.gallery[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', 
                        border: activeMedia?.url === course.promoVideo ? '3px solid #202124' : '3px solid transparent',
                        cursor: 'pointer'
                      }}>
                      <div style={{ backgroundColor: 'white', borderRadius: '4px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 33 23" fill="currentColor" style={{ width: '24px', color: '#202124' }} xmlns="http://www.w3.org/2000/svg"><path d="M13.0333 17.9688V5.03125L22.8083 11.5L13.0333 17.9688ZM29.325 0.575C28.3475 0.2875 22.3196 0 16.2917 0C10.2637 0 4.23583 0.273125 3.25833 0.54625C0.716833 1.29375 0 6.325 0 11.5C0 16.6606 0.716833 21.7063 3.25833 22.4394C4.23583 22.7269 10.2637 23 16.2917 23C22.3196 23 28.3475 22.7269 29.325 22.4394C31.8665 21.7063 32.5833 16.6606 32.5833 11.5C32.5833 6.325 31.8665 1.30813 29.325 0.575Z" fill="#202124"></path></svg>
                      </div>
                    </div>
                  )}
                  {course.gallery.slice(course.promoVideo ? 1 : 0).map((imgUrl, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveMedia({ type: 'image', url: imgUrl })}
                      style={{ 
                        height: '90px', width: '90px', flexShrink: 0, borderRadius: '10px', backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                        border: activeMedia?.url === imgUrl ? '3px solid #202124' : '3px solid transparent',
                        cursor: 'pointer'
                      }}>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Bar (Private, Members, Price, Author) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '24px', alignItems: 'center', fontSize: '16px', fontWeight: '500', color: '#202124' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} />
                  <span>Private</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe2 size={20} />
                  <span>{course.modules?.length || 0} modules</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '20px' }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  <span>{course.formattedPrice}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(to bottom right, #C05746, #2D4A22)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px' }}>
                    A
                  </div>
                  <span>By Andy Han 🚀</span>
                </div>
              </div>

              {/* Rich About Content */}
              {course.aboutContent ? (
                <div 
                  style={{ color: '#202124', fontSize: '16px', padding: '14px', borderRadius: '10px', backgroundColor: 'white' }}
                  dangerouslySetInnerHTML={{ __html: course.aboutContent }}
                />
              ) : (
                <div style={{ color: '#5D6068' }}>
                  <p className="mb-4">{language === 'pt' ? (course.description_pt || course.description) : (course.description_en || course.description)}</p>
                </div>
              )}
            </div>
          </div>

            {/* Right Column: Sticky Join Card (exact 273px) */}
            <aside style={{ flexShrink: 0, width: '273px', position: 'sticky', top: '96px' }}>
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E4E4E4' }}>
                {/* Course Image */}
                <div style={{ width: '100%', height: '144px', position: 'relative', backgroundColor: '#161111' }}>
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px 20px 20px 20px' }}>
                  <h2 style={{ fontFamily: 'Roboto, Arial, sans-serif', color: '#202124', fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {course.title}
                  </h2>
                  <div style={{ color: '#909090', fontSize: '13px', fontWeight: 'bold', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    nomadsapiens.com/{course.id}
                  </div>

                  {/* Description */}
                  <div style={{ color: '#202124', fontSize: '16px', lineHeight: '1.5', marginBottom: '20px' }}>
                    {language === 'pt' ? (course.description_pt || course.description) : (course.description_en || course.description)}
                  </div>

                  {/* Stats Row */}
                  <div style={{ display: 'flex', borderTop: '1px solid #E4E4E4', borderBottom: '1px solid #E4E4E4', padding: '12px 0', marginBottom: '20px' }}>
                    <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #E4E4E4' }}>
                      <div style={{ color: '#202124', fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}>2k</div>
                      <div style={{ color: '#909090', fontSize: '13px' }}>Members</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #E4E4E4' }}>
                      <div style={{ color: '#202124', fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}>32</div>
                      <div style={{ color: '#909090', fontSize: '13px' }}>Online</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ color: '#202124', fontSize: '18px', fontWeight: 'bold', lineHeight: '1.2' }}>1</div>
                      <div style={{ color: '#909090', fontSize: '13px' }}>Admin</div>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button
                    data-testid="course-buy-btn"
                    onClick={handleBuy}
                    disabled={paying}
                    style={{ 
                      width: '100%', 
                      height: '48px', 
                      backgroundColor: '#F56D41', 
                      color: '#FFFFFF', 
                      border: 'none', 
                      borderRadius: '4px', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      textTransform: 'uppercase',
                      cursor: paying ? 'not-allowed' : 'pointer',
                      opacity: paying ? 0.7 : 1,
                      boxShadow: '0px 1px 2px rgba(60, 64, 67, 0.32), 0px 2px 6px rgba(60, 64, 67, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => { if(!paying) e.currentTarget.style.backgroundColor = '#E2592D'; }}
                    onMouseOut={(e) => { if(!paying) e.currentTarget.style.backgroundColor = '#F56D41'; }}
                  >
                    {paying ? t("courseDetail.processing") : `JOIN ${course.formattedPrice}`}
                  </button>
                </div>
              </div>
              
              {/* Powered By Footer */}
              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#909090' }}>
                Powered by <span style={{ fontWeight: 'bold', color: '#202124' }}>NomadSapiens</span>
              </div>
            </aside>

        </div>
      </div>

      <Footer />

      {/* Render the Checkout Modal if open */}
      {showCheckout && (
        <CheckoutModal 
          course={course} 
          user={user} 
          onClose={() => setShowCheckout(false)} 
        />
      )}
    </div>
  );
}
