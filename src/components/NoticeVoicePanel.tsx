import { useEffect, useRef, useState } from 'react';
import { speakWarning, isSpeechSupported } from '../lib/voice';
import { getSpeechRecognition, type SpeechRecognitionLike } from '../lib/speechRecognition';

const RESPONSES: Record<string, { text: string; speech: string }> = {
  'Is this payment safe?': {
    text: 'Do not approve it yet. Check the payee name and never use a QR code or UPI PIN to receive money.',
    speech: 'Yeh payment safe nahi lagta. QR code scan karke ya UPI PIN dekar paisa receive nahi hota.',
  },
  'Can I afford this EMI?': {
    text: 'The cash-flow ruler below shows the impact of a new EMI before you borrow.',
    speech: 'Neeche cash flow ruler par nayi EMI ka asar dekhiye, loan lene se pehle.',
  },
  'Mere paise mahine ke end tak chalenge?': {
    text: 'Your current illustration shows 63 days of runway. Drag the cash-flow ruler to test a new expense.',
    speech: 'Aapke paise abhi 63 din tak chalne ka estimate hai. Naya kharcha check karne ke liye ruler drag karein.',
  },
};

export default function NoticeVoicePanel() {
  const [selected, setSelected] = useState('Is this payment safe?');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const supported = isSpeechSupported();
  const response = RESPONSES[selected];

  useEffect(() => {
    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript.toLowerCase() ?? '';
      const match = Object.keys(RESPONSES).find(
        (query) =>
          query.toLowerCase().includes(transcript) ||
          transcript.includes(query.toLowerCase().split(' ')[0]),
      );
      if (match) setSelected(match);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const listen = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <section className="notice-voice" aria-labelledby="voice-notice-title">
      <div>
        <span className="notice-voice__eyebrow">VOICE NOTICE / EN + HI</span>
        <h3 id="voice-notice-title">Ask before you approve.</h3>
        <p>Tap a question to hear a spoken answer, or use the microphone in Chrome/Edge.</p>
      </div>
      <div className="notice-voice__controls">
        <div className="notice-voice__wave" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        <button type="button" className="notice-voice__mic" onClick={listen} disabled={!supported || listening} aria-label={listening ? 'Listening for a voice question' : 'Start voice question'}>
          {listening ? 'LISTENING…' : 'MIC / बोलें'}
        </button>
      </div>
      <div className="notice-voice__questions">
        {Object.keys(RESPONSES).map((query) => (
          <button type="button" key={query} onClick={() => setSelected(query)} className={selected === query ? 'is-selected' : ''}>{query}</button>
        ))}
      </div>
      <div className="notice-voice__answer" aria-live="polite">
        <span>RAKSHAK SAYS</span>
        <p>{response.text}</p>
        {supported && <button type="button" onClick={() => speakWarning(response.speech, selected.includes('Mere') ? 'hi-IN' : 'en-IN')}>▶ Hear this answer</button>}
      </div>
    </section>
  );
}

