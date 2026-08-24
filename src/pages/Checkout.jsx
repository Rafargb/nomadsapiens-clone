import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCourses } from "../lib/courseStore";
import Navbar from "../components/Navbar";
import { ShieldCheck, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });

  useEffect(() => {
    getCourses().then(allCourses => {
      const foundCourse = allCourses.find(c => c.id === courseId || c.course_id === courseId);
      
      if (foundCourse) {
        setCourse({
          ...foundCourse,
          thumbnail: foundCourse.thumbnailHorizontal || foundCourse.thumbnail,
          formattedPrice: foundCourse.price || foundCourse.formattedPrice,
        });
      }
      setLoading(false);
    });
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!formData.cardNumber || !formData.expiry || !formData.cvc) {
      toast.error("Please fill in all payment details.");
      return;
    }

    setPaying(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      const mockSessionId = `mock-session-id-${Date.now()}`;
      navigate(`/checkout/success?session_id=${mockSessionId}&course_id=${courseId}`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#202124]" size={32} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link to="/courses" className="btn-primary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <Navbar />
      <div className="pt-28 pb-16 px-4 md:px-8 max-w-5xl mx-auto">
        <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-[#5D6068] hover:text-[#202124] mb-6 text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Course
        </Link>
        
        <div className="bg-white rounded-2xl border border-[#E4E4E6] shadow-md overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Payment Form */}
          <div className="flex-1 p-8 md:p-10 border-b md:border-b-0 md:border-r border-[#E4E4E6]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-[#E5F3F7] text-[#2E6EF5] flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <h1 className="text-xl font-bold text-[#202124]">Payment Details</h1>
            </div>

            <form onSubmit={handlePay} className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#202124] mb-3 uppercase tracking-wider">Personal Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5D6068] mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-md border border-[#E4E4E6] focus:border-[#202124] focus:ring-1 focus:ring-[#202124] outline-none transition-all text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5D6068] mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-md border border-[#E4E4E6] focus:border-[#202124] focus:ring-1 focus:ring-[#202124] outline-none transition-all text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E4E4E6]">
                <h3 className="text-sm font-bold text-[#202124] mb-3 uppercase tracking-wider">Card Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5D6068] mb-1">Card Number</label>
                    <input 
                      type="text" 
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                      maxLength="19"
                      className="w-full px-3 py-2.5 rounded-md border border-[#E4E4E6] focus:border-[#202124] focus:ring-1 focus:ring-[#202124] outline-none transition-all text-sm font-mono"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[#5D6068] mb-1">Expiry</label>
                      <input 
                        type="text" 
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        required
                        maxLength="5"
                        className="w-full px-3 py-2.5 rounded-md border border-[#E4E4E6] focus:border-[#202124] focus:ring-1 focus:ring-[#202124] outline-none transition-all text-sm font-mono"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-[#5D6068] mb-1">CVC</label>
                      <input 
                        type="text" 
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleChange}
                        required
                        maxLength="4"
                        className="w-full px-3 py-2.5 rounded-md border border-[#E4E4E6] focus:border-[#202124] focus:ring-1 focus:ring-[#202124] outline-none transition-all text-sm font-mono"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={paying}
                className="w-full h-12 mt-6 bg-[#202124] text-white rounded-md font-bold text-[15px] hover:bg-[#333] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paying ? (
                  <><Loader2 className="animate-spin mr-2" size={18} /> Processing...</>
                ) : (
                  `Pay ${course.formattedPrice}`
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-[#909090] text-xs">
                <ShieldCheck size={14} className="text-[#2D4A22]" />
                Payments are secure and encrypted.
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full md:w-[360px] bg-[#FDFDFD] p-8 md:p-10 flex-shrink-0">
            <h3 className="text-lg font-bold text-[#202124] mb-6">Summary</h3>
            
            <div className="mb-6">
              <div className="w-full aspect-video rounded-md overflow-hidden bg-[#161111] mb-4">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-[#202124] leading-tight text-lg">{course.title}</h4>
              <p className="text-sm text-[#5D6068] mt-1">{course.formattedPrice} / month</p>
            </div>

            <div className="space-y-2 border-t border-[#E4E4E6] pt-4 mb-4 text-[#5D6068] text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#202124]">{course.formattedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span className="font-medium text-[#202124]">$0.00</span>
              </div>
            </div>

            <div className="border-t border-[#E4E4E6] pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-[#202124]">Total Due Today</span>
              <span className="text-xl font-black text-[#202124]">{course.formattedPrice}</span>
            </div>
            
            <div className="mt-6 text-xs text-[#909090] leading-relaxed">
              By completing your purchase you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
