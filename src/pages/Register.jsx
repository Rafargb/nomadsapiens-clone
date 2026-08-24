import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatError } from "../lib/api";
import Navbar from "../components/Navbar";
import { Compass, User, Share2, Briefcase, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import heroImg from "../assets/hero.png";

export default function Register() {
  const { register } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") || "student";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ["student", "affiliate", "producer"].includes(initialRole) ? initialRole : "student",
  });
  const [loading, setLoading] = useState(false);
  const redirect = params.get("redirect") || "/dashboard";

  const rolesList = [
    { value: "student", label: t("auth.student"), desc: t("auth.studentDesc"), icon: GraduationCap },
    { value: "affiliate", label: t("auth.affiliate"), desc: t("auth.affiliateDesc"), icon: Share2 },
    { value: "producer", label: t("auth.producer"), desc: t("auth.producerDesc"), icon: Briefcase },
  ];

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(language === "pt" ? "Bem-vindo à tribo nômade!" : "Welcome to the nomad tribe!");
      navigate(redirect);
    } catch (e) {
      toast.error(formatError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex text-[#161111] overflow-hidden relative border-t-[8px] border-[#00D4C5]">
      {/* Background Cyan Squiggles */}
      <svg className="absolute top-0 left-1/4 w-96 h-96 text-[#a5f3fc]/60 -translate-y-1/2 pointer-events-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 20 180 Q 80 180 80 120 Q 80 60 140 60 T 260 60" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-[500px] h-[300px] text-[#a5f3fc]/60 translate-y-1/4 -translate-x-1/4 pointer-events-none" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 100 Q 50 180 100 100 T 200 100 T 300 100 T 400 100" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      </svg>

      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col pt-20 pb-12 px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 h-full overflow-y-auto">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 tracking-[0.2em] font-semibold text-xs">
          <span className="text-[#00D4C5]">SIGN-UP</span><span className="text-[#161111]">/SIGN-IN</span>
        </div>

        <div className="w-full max-w-[400px] mx-auto my-auto mt-20">
          <div className="mb-8">
            <h1 className="font-semibold text-3xl mb-1.5 text-[#161111] tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Get Started Now
            </h1>
            <p className="text-[#5D6068] text-[13px] font-medium">
              Enter your Credentials to Create your account
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-[#5D6068] mb-1.5 block">Name</label>
              <input
                data-testid="register-name"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                className="w-full bg-white border border-[#b8b8b8] rounded-[6px] py-2.5 px-3 text-[#161111] placeholder-[#D1D1D6] focus:outline-none focus:border-[#00D4C5] transition-all font-medium text-[13px]"
                placeholder="Name"
              />
            </div>
            
            <div>
              <label className="text-[13px] font-semibold text-[#5D6068] mb-1.5 block">Email address</label>
              <input
                data-testid="register-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                className="w-full bg-white border border-[#b8b8b8] rounded-[6px] py-2.5 px-3 text-[#161111] placeholder-[#D1D1D6] focus:outline-none focus:border-[#00D4C5] transition-all font-medium text-[13px]"
                placeholder="xyz@xyz.com"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-[13px] font-semibold text-[#5D6068] mb-1.5 block">Instagram ID</label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#b8b8b8] rounded-[6px] py-2.5 px-3 text-[#161111] placeholder-[#D1D1D6] focus:outline-none focus:border-[#00D4C5] transition-all font-medium text-[13px]"
                  placeholder="@"
                />
              </div>
              <div className="w-1/2">
                <label className="text-[13px] font-semibold text-[#5D6068] mb-1.5 block">Date of Birth</label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#b8b8b8] rounded-[6px] py-2.5 px-3 text-[#161111] placeholder-[#D1D1D6] focus:outline-none focus:border-[#00D4C5] transition-all font-medium text-[13px]"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[13px] font-semibold text-[#5D6068]">Password</label>
                <Link to="/forgot-password" className="text-[10px] font-medium text-[#00D4C5]">forgot password</Link>
              </div>
              <input
                data-testid="register-password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                className="w-full bg-white border border-[#b8b8b8] rounded-[6px] py-2.5 px-3 text-[#161111] placeholder-[#D1D1D6] focus:outline-none focus:border-[#00D4C5] transition-all font-medium text-[13px]"
                placeholder="Password"
              />
            </div>
            
            <button
              data-testid="register-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#00D4C5] hover:bg-[#00b5a8] text-white font-medium text-[14px] rounded-[6px] py-3 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (language === "pt" ? "Criando..." : "Creating...") : "Sign Up"}
            </button>
          </form>

          <div className="text-center mt-12 text-[13px] font-semibold text-[#333333]">
            Have a account?{" "}
            <Link to="/login" className="text-[#00D4C5] hover:text-[#00b5a8] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side: Image (Desktop Only) */}
      <div className="hidden lg:block lg:w-1/2 p-6 z-10 h-screen">
        <div className="w-full h-full relative rounded-[20px] overflow-hidden">
          <img 
            src={heroImg} 
            alt="Nomad Sapiens" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
