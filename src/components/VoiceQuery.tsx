import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VoiceQueryProps {
  onQuery: (transcript: string) => void;
}

/**
 * Voice input component using Web Speech API.
 * Supports Hindi/Hinglish recognition.
 */
export default function VoiceQuery({ onQuery }: VoiceQueryProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Hindi/Hinglish
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const exampleQueries = [
    'Is this payment safe?',
    'Can I afford this EMI?',
    'Mere paise mahine ke end tak chalenge?',
  ];

  if (!isSupported) {
    return (
      <div
        className="rounded-lg p-4 text-center"
        style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--muted-2)' }}>
          Voice input not supported in this browser. Try Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium" style={{ color: 'var(--parchment)' }}>
          🎤 Ask Rakshak (Hindi/English)
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startListening}
          disabled={isListening}
          className="relative w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
          style={{
            backgroundColor: isListening ? 'var(--risk-high)' : 'var(--gold)',
            color: isListening ? 'white' : 'var(--ink)',
          }}
          aria-label={isListening ? 'Listening...' : 'Start voice input'}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </motion.div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </motion.button>
      </div>

      {isListening && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center mb-3"
          style={{ color: 'var(--risk-high)' }}
        >
          Listening... Speak now
        </motion.p>
      )}

      {/* Example queries */}
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map((query, i) => (
          <button
            key={i}
            onClick={() => onQuery(query)}
            className="chip px-3 py-1.5 rounded-md text-[11px] font-medium"
            style={{
              backgroundColor: 'var(--ink)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
