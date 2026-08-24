import React, { createContext, useContext, useState } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("nomad_lang");
    if (saved === "en" || saved === "pt") return saved;
    const systemLang = navigator.language || "";
    return systemLang.startsWith("en") ? "en" : "pt";
  });

  const setLanguage = (lang) => {
    if (lang === "en" || lang === "pt") {
      setLanguageState(lang);
      localStorage.setItem("nomad_lang", lang);
    }
  };

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
