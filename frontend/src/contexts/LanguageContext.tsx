import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, getLanguage, setLanguage } from '@/utils/language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getLanguage());

  useEffect(() => {
    setLanguage(language);
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    setLanguageState(lang);
  };

  const handleToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    handleSetLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, toggle: handleToggle }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

