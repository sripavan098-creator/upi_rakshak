/**
 * Language-aware voice output using Web Speech API
 * Supports 22 Indian languages with graceful fallback
 */

const VOICE_LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
  ur: 'ur-IN',
  ne: 'ne-NP',
  sa: 'sa-IN',
};

export function speak(text: string, languageCode: string = 'en'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set language
  const targetLocale = VOICE_LOCALE_MAP[languageCode] || 'en-IN';
  utterance.lang = targetLocale;
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Find the best matching voice
  const voices = window.speechSynthesis.getVoices();
  
  // Priority: exact match > language prefix match > Hindi fallback > English fallback
  const preferred = 
    voices.find(v => v.lang === targetLocale) ||
    voices.find(v => v.lang.startsWith(targetLocale.split('-')[0])) ||
    voices.find(v => v.lang.startsWith('hi')) ||
    voices.find(v => v.lang.startsWith('en'));

  if (preferred) {
    utterance.voice = preferred;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isVoiceAvailable(languageCode: string): boolean {
  if (!('speechSynthesis' in window)) return false;
  
  const voices = window.speechSynthesis.getVoices();
  const target = VOICE_LOCALE_MAP[languageCode] || 'en-IN';
  
  return voices.some(v => 
    v.lang === target || 
    v.lang.startsWith(target.split('-')[0])
  );
}

// Preload voices (some browsers need this)
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
