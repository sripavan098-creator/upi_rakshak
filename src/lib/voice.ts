/**
 * UPI Rakshak — Voice Interface
 * 
 * Uses Web Speech API for text-to-speech warnings in Hindi/English.
 * Browser-native, no external dependencies.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speak a warning message aloud.
 * Prefers Hindi voice if available, falls back to English.
 */
export function speakWarning(text: string, lang: 'hi-IN' | 'en-IN' = 'hi-IN'): void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to find a Hindi voice
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang.startsWith('hi'));
  const englishVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
  
  if (lang === 'hi-IN' && hindiVoice) {
    utterance.voice = hindiVoice;
  } else if (englishVoice) {
    utterance.voice = englishVoice;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

/**
 * Check if speech synthesis is available.
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}
