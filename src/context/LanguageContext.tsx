import React, { createContext, useContext, useState, useCallback } from "react";
import { LangCode, TRANSLATIONS, LANGUAGE_NAMES } from "@/lib/translations";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  langName: string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LangCode>("en");

  const t = useCallback(
    (key: string) => {
      const translations = TRANSLATIONS[lang];
      return (translations as any)?.[key] ?? (TRANSLATIONS.en as any)?.[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, langName: LANGUAGE_NAMES[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};
