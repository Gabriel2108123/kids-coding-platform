import React, { useState, useContext, createContext, ReactNode } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE, translations, TranslationKey } from '../constants/languages';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    // Try to get language from localStorage or browser locale
    const savedLanguage = localStorage.getItem('bugsby-language') as LanguageCode;
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    
    // Try to match browser language
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    if (translations[browserLang]) {
      return browserLang;
    }
    
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
    localStorage.setItem('bugsby-language', language);
  };

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage][key] || translations[DEFAULT_LANGUAGE][key] || key;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { currentLanguage, setLanguage, t } },
    children
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
