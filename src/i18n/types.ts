export type LanguageCode =
  | 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'pa' | 'or' | 'as'
  | 'ur' | 'ne' | 'sa' | 'kok' | 'mai' | 'doi' | 'brx' | 'mni' | 'sat' | 'ks' | 'sd';

export interface LanguageMeta {
  code: LanguageCode;
  label: string;       // English name
  nativeLabel: string; // Native script name
  dir: 'ltr' | 'rtl';
}

export interface TranslationKeys {
  // App identity
  appName: string;
  tagline: string;
  
  // Status messages
  protectionActive: string;
  setupRequired: string;
  
  // Actions
  simulateScamAttack: string;
  scanQrCode: string;
  grantPermission: string;
  check: string;
  speakAgain: string;
  reportTo1930: string;
  
  // Features
  cashFlowForecast: string;
  loans: string;
  language: string;
  
  // Threat levels
  threatDetected: string;
  safe: string;
  suspicious: string;
  
  // UI elements
  voiceWarning: string;
  daysRunway: string;
  askAboutPurchase: string;
  
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  demoButton: string;
  
  // Navigation
  home: string;
  console: string;
  howItWorks: string;
  architecture: string;
  impact: string;
  project: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  close: string;
}
