import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LANGUAGES, TRANSLATIONS } from './translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('ek_lang');
    return LANGUAGES.some((l) => l.code === saved) ? saved : 'en';
  });
  const meta = LANGUAGES.find((l) => l.code === lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
    localStorage.setItem('ek_lang', lang);
  }, [lang, meta]);

  const t = useCallback((key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t, rtl: meta.rtl }}>{children}</LanguageContext.Provider>;
};

export const useLang = () => useContext(LanguageContext);
