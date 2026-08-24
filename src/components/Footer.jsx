import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Compass, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer data-testid="main-footer" className="bg-[#161111] text-[#FBF9F6]">
      <div className="nomad-container py-16 md:py-24 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <img src="/nomad-sapiens-white.png" alt="Nomad Sapiens" className="object-contain" style={{ height: '60px' }} />
          </div>
          <p className="mt-5 text-[#E6D7C3] leading-relaxed text-sm max-w-xs">
            {t("footer.description")}
          </p>
        </div>

        <div>
          <h4 className="font-heading font-bold mb-4 text-sm tracking-[0.2em] uppercase text-[#E6D7C3]">
            {t("footer.platform")}
          </h4>
          <ul className="space-y-2.5 text-sm text-[#FBF9F6]/80">
            <li><Link to="/courses" className="hover:text-[#C05746] transition">{t("navbar.courses")}</Link></li>
            <li><Link to="/affiliates" className="hover:text-[#C05746] transition">{t("landing.beAffiliate")}</Link></li>
            <li><Link to="/register" className="hover:text-[#C05746] transition">{t("navbar.start")}</Link></li>
            <li><Link to="/login" className="hover:text-[#C05746] transition">{t("navbar.signin")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold mb-4 text-sm tracking-[0.2em] uppercase text-[#E6D7C3]">
            {t("footer.community")}
          </h4>
          <ul className="space-y-2.5 text-sm text-[#FBF9F6]/80">
            <li>{t("footer.discord")}</li>
            <li>{t("footer.newsletter")}</li>
            <li>{t("footer.meetups")}</li>
            <li>{t("footer.mentors")}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold mb-4 text-sm tracking-[0.2em] uppercase text-[#E6D7C3]">
            {t("footer.social")}
          </h4>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full border border-[#E6D7C3]/30 flex items-center justify-center hover:bg-[#C05746] hover:border-[#C05746] transition">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-[#E6D7C3]/30 flex items-center justify-center hover:bg-[#C05746] hover:border-[#C05746] transition">
              <Youtube size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full border border-[#E6D7C3]/30 flex items-center justify-center hover:bg-[#C05746] hover:border-[#C05746] transition">
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#FBF9F6]/10">
        <div className="nomad-container py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-[#FBF9F6]/50">
          <span>© {new Date().getFullYear()} Nomad Sapiens. {t("footer.madeForFree")}</span>
          <span>{t("footer.earnDollars")}</span>
        </div>
      </div>
    </footer>
  );
}
