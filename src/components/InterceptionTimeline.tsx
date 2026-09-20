import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * The Interception Timeline — The Signature Moment
 * 
 * Shows the scam detection mechanism running in real-time:
 * 1. Sticky phone with scam message
 * 2. Scroll through 3 rules, each phrase underlines in stamp-red
 * 3. Millisecond counter ticks: 0 → 40 → 120 → 190
 * 4. Overlay slides down
 * 5. FRAUD seal lands off-axis
 * 6. Verdict panel rises
 */

const SCAM_MESSAGE = `URGENT: Your electricity connection will be disconnected within 24 hours. Scan the QR code below and enter your UPI PIN to receive your refund adjustment of ₹2,500. Act immediately or your meter will be shut off. Forwarded from BSES Official.`;

const RULES = [
  {
    id: 1,
    title: 'Rule 1: Receiving money never requires a PIN',
    phrase: 'enter your UPI PIN to receive',
    explanation: 'UPI PIN is only for sending money. Anyone asking for your PIN to "receive" a refund is lying.',
    timestamp: 40,
  },
  {
    id: 2,
    title: 'Rule 2: Scanning a QR code sends money, not receives it',
    phrase: 'Scan the QR code below',
    explanation: 'QR codes are for payments TO someone, not FROM someone. This is backwards.',
    timestamp: 120,
  },
  {
    id: 3,
    title: 'Rule 3: Official notices don\'t come via forwarded messages',
    phrase: 'Forwarded from BSES Official',
    explanation: 'Electricity boards don\'t forward messages. They send bills to your registered number.',
    timestamp: 190,
  },
];

export default function InterceptionTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress to timeline stages
  const currentRule = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);
  const overlayY = useTransform(scrollYProgress, [0.75, 0.85], [-100, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);
  const sealScale = useTransform(scrollYProgress, [0.85, 0.95], [1.5, 1]);
  const sealOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const verdictY = useTransform(scrollYProgress, [0.9, 1], [50, 0]);
  const verdictOpacity = useTransform(scrollYProgress, [0.9, 1], [0, 1]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[300vh] bg-[var(--paper)]"
      style={{ fontFamily: 'var(--font-legal)' }}
    >
      {/* Sticky phone container */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          {/* Phone mockup */}
          <div
            className="relative bg-white border-2 border-[var(--ink)] overflow-hidden"
            style={{ borderRadius: 'var(--radius-phone)' }}
          >
            {/* Phone header */}
            <div className="bg-[var(--ink)] text-[var(--paper)] px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-mono">WhatsApp</span>
              <span className="text-xs font-mono">9:41 AM</span>
            </div>

            {/* Message bubble */}
            <div className="p-4 bg-[var(--paper-dark)] min-h-[300px]">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm text-[var(--ink)] leading-relaxed">
                  {SCAM_MESSAGE.split(' ').map((word, i) => {
                    const fullText = SCAM_MESSAGE.toLowerCase();
                    const wordIndex = fullText.indexOf(word.toLowerCase());
                    
                    // Check if this word is part of an incriminating phrase
                    const isIncriminating = RULES.some(rule => {
                      const phraseLower = rule.phrase.toLowerCase();
                      const wordStart = wordIndex;
                      const wordEnd = wordIndex + word.length;
                      
                      return phraseLower.includes(word.toLowerCase()) &&
                             wordStart >= fullText.indexOf(phraseLower) &&
                             wordEnd <= fullText.indexOf(phraseLower) + phraseLower.length;
                    });

                    return (
                      <span key={i}>
                        <motion.span
                          className={isIncriminating ? 'inline-block' : ''}
                          style={{
                            background: isIncriminating
                              ? 'linear-gradient(to bottom, transparent 60%, var(--stamp-red) 60%)'
                              : 'none',
                            padding: isIncriminating ? '0 0.1em' : '0',
                            fontWeight: isIncriminating ? 600 : 400,
                          }}
                          animate={{
                            background: isIncriminating
                              ? [
                                  'linear-gradient(to bottom, transparent 60%, transparent 60%)',
                                  'linear-gradient(to bottom, transparent 60%, var(--stamp-red) 60%)',
                                ]
                              : 'none',
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {word}
                        </motion.span>{' '}
                      </span>
                    );
                  })}
                </p>
              </div>
            </div>

            {/* Overlay - slides down */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-[var(--stamp-red)] text-white p-4 shadow-lg"
              style={{
                y: overlayY,
                opacity: overlayOpacity,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <p className="font-signage font-bold text-lg uppercase tracking-wide">
                    Rakshak Alert
                  </p>
                  <p className="text-sm mt-1 opacity-90">
                    Yeh message fraud hai. Kisi ko bhi OTP ya UPI PIN mat do.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* FRAUD seal - lands off-axis */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                scale: sealScale,
                opacity: sealOpacity,
                rotate: -12,
              }}
            >
              <div
                className="bg-[var(--stamp-red)] text-white px-8 py-4 font-signage font-bold text-4xl uppercase tracking-widest border-4 border-white"
                style={{
                  boxShadow: 'var(--shadow-stamp)',
                }}
              >
                FRAUD
              </div>
            </motion.div>
          </div>

          {/* Timestamp counter */}
          <motion.div
            className="absolute -bottom-16 left-0 right-0 text-center font-mono text-2xl text-[var(--ink)]"
            style={{
              fontFamily: 'var(--font-machine)',
            }}
          >
            <motion.span>
              {useTransform(scrollYProgress, [0, 1], [0, 190])}
            </motion.span>
            <span className="text-sm ml-2">ms</span>
          </motion.div>
        </div>
      </div>

      {/* Rules - scroll through these */}
      <div className="relative z-10 space-y-[100vh] pt-[50vh] pb-[50vh]">
        {RULES.map((rule, index) => (
          <motion.div
            key={rule.id}
            className="max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50%' }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-[var(--paper)] border-2 border-[var(--ink)] p-6 shadow-[var(--shadow-paper)]">
              {/* Rule number and timestamp */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--ink)]">
                <span className="font-signage font-bold text-lg text-[var(--ink)]">
                  Rule {rule.id}
                </span>
                <span
                  className="font-mono text-sm text-[var(--ink-light)]"
                  style={{ fontFamily: 'var(--font-machine)' }}
                >
                  t = {rule.timestamp}ms
                </span>
              </div>

              {/* Rule title */}
              <h3 className="font-signage font-bold text-xl text-[var(--ink)] mb-3">
                {rule.title}
              </h3>

              {/* Incriminating phrase */}
              <div className="bg-[var(--paper-dark)] p-3 mb-3 border-l-4 border-[var(--stamp-red)]">
                <p className="font-mono text-sm text-[var(--ink)]" style={{ fontFamily: 'var(--font-machine)' }}>
                  "{rule.phrase}"
                </p>
              </div>

              {/* Explanation */}
              <p className="text-[var(--ink)] leading-relaxed">
                {rule.explanation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Verdict panel - rises at the end */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-[var(--paper)] border-t-2 border-[var(--ink)] p-6 shadow-lg"
        style={{
          y: verdictY,
          opacity: verdictOpacity,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-signage font-bold text-2xl text-[var(--ink)] mb-2">
                Verdict: HIGH RISK
              </h3>
              <p className="text-[var(--ink)] mb-4">
                3 rules violated. This is a confirmed scam.
              </p>
              <div className="flex gap-3">
                <a 
                  href="tel:1930" 
                  className="bg-[var(--bbps-green)] text-white px-6 py-3 font-signage font-bold uppercase tracking-wide hover:bg-[var(--ink)] transition-colors inline-block"
                >
                  Report to 1930
                </a>
                <button 
                  onClick={() => alert('Detailed threat analysis would open here with full context, timeline, and recommended actions.')}
                  className="bg-[var(--ink)] text-[var(--paper)] px-6 py-3 font-signage font-bold uppercase tracking-wide hover:bg-[var(--ink-light)] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
