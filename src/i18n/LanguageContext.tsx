import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, TranslationKeys } from './types';
import { LANGUAGE_LIST } from './languages';
import { translations } from './translations';
import { en } from './translations/en';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: keyof TranslationKeys) => string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'upi-rakshak-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && translations[saved]) {
      return saved;
    }
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    if (browserLang && translations[browserLang]) {
      return browserLang;
    }
    // Default to English
    return 'en';
  });

  const direction = LANGUAGE_LIST.find(l => l.code === currentLanguage)?.dir || 'ltr';

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, currentLanguage);
    // Apply direction to document
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, direction]);

  const setLanguage = (code: LanguageCode) => {
    setCurrentLanguage(code);
  };

  const t = (key: keyof TranslationKeys): string => {
    const langTranslations = translations[currentLanguage];
    const value = langTranslations?.[key];
    // Fallback to English if translation is missing
    return value || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
