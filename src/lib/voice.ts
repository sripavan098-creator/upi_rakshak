/**
 * UPI Rakshak — Voice Interface
 * 
 * Uses Web Speech API for text-to-speech warnings in Hindi/English.
 * Browser-native, no external dependencies.
 */

/**
 * Speak a warning message aloud.
 * Prefers Hindi voice if available, falls back to English.
 */
/**
 * Voice availability is exposed so UI can adapt (e.g. show a notice on
 * browsers/contexts where speech cannot run).
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Chrome loads voices asynchronously — getVoices() returns [] until
 * `voiceschanged` fires. We cache them and refresh on that event so the
 * first spoken warning still gets the right (Hindi) voice.
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

function refreshVoices(): void {
  if (!isSpeechSupported()) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (isSpeechSupported()) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

function pickVoice(lang: 'hi-IN' | 'en-IN'): SpeechSynthesisVoice | null {
  if (lang === 'hi-IN') {
    return (
      cachedVoices.find((v) => v.lang.startsWith('hi')) ||
      cachedVoices.find((v) => /hindi/i.test(v.name)) ||
      null // engine falls back to default voice rather than a wrong-language one
    );
  }
  return (
    cachedVoices.find((v) => v.lang === 'en-IN') ||
    cachedVoices.find((v) => v.lang === 'en_IN') ||
    cachedVoices.find((v) => v.lang.startsWith('en-IN')) ||
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith('en') && /india/i.test(v.name)) ||
    cachedVoices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

/**
 * Speak a warning message aloud.
 * Prefers Hindi voice if available, falls back to English.
 * Safe to call repeatedly — cancels any in-flight utterance first.
 */
export function speakWarning(text: string, lang: 'hi-IN' | 'en-IN' = 'hi-IN'): void {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  // Long text gets truncated on some engines — chunk at a safe length.
  const CHUNK = 220;
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > CHUNK) {
    const boundary = remaining.lastIndexOf(' ', CHUNK);
    const end = boundary > 0 ? boundary : CHUNK;
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  if (remaining) chunks.push(remaining);

  const voice = pickVoice(lang);
  chunks.forEach((chunk) => {
    const utterance = new SpeechSynthesisUtterance(chunk.trim());
    utterance.lang = voice?.lang ?? lang;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    utterance.onerror = (e) => {
      // 'interrupted'/'canceled' are expected from stopSpeaking(); log the rest
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e.error);
      }
    };
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

