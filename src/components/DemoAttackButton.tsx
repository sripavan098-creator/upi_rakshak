import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScamOverlay from './ScamOverlay';
import { analyzeMessage } from '../lib/rulesEngine';
import { stopSpeaking } from '../lib/voice';

const SCAM_MESSAGE = '⚡ URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici';

/**
 * Demo Attack Simulator — the hackathon-winning moment.
 * Simulates a scam attack with fake WhatsApp notification → Rakshak overlay → full explanation.
 */
export default function DemoAttackButton() {
  const [stage, setStage] = useState<'idle' | 'whatsapp' | 'rakshak' | 'explanation'>('idle');
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMessage> | null>(null);

  const runDemo = async () => {
    setStage('whatsapp');
    
    // After 1.5s, show Rakshak overlay
    setTimeout(() => {
      setStage('rakshak');
    }, 1500);

    // After 3s total, show full explanation
    setTimeout(() => {
      const result = analyzeMessage('WhatsApp', SCAM_MESSAGE);
      setAnalysis(result);
      setStage('explanation');
    }, 3000);
  };

  const dismiss = () => {
    stopSpeaking();
    setStage('idle');
    setAnalysis(null);
  };

  return (
    <>
      {/* Overlays */}
      <ScamOverlay
        visible={stage === 'whatsapp'}
        message={SCAM_MESSAGE}
        variant="whatsapp"
        onDismiss={() => setStage('rakshak')}
      />
      <ScamOverlay
        visible={stage === 'rakshak'}
        message={SCAM_MESSAGE}
        variant="rakshak"
        onTap={() => {
          const result = analyzeMessage('WhatsApp', SCAM_MESSAGE);
          setAnalysis(result);
          setStage('explanation');
        }}
        onDismiss={() => {
          const result = analyzeMessage('WhatsApp', SCAM_MESSAGE);
          setAnalysis(result);
          setStage('explanation');
        }}
      />

      {/* Demo button — always visible */}
      <div
        className="rounded-[14px] p-5 mb-6"
        style={{
          backgroundColor: 'var(--ink-1)',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--ink-1) 0%, rgba(232, 163, 61, 0.04) 100%)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--gold)' }}>
              Hackathon Demo
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              See how Rakshak intercepts a scam in real-time
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={runDemo}
            disabled={stage !== 'idle'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-display font-semibold text-sm disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #E1554A 0%, #B91C1C 100%)',
              color: 'white',
              boxShadow: '0 4px 15px rgba(225, 85, 74, 0.3)',
            }}
          >
            <span>🎯</span>
            Simulate Scam Attack
          </motion.button>
        </div>
      </div>

      {/* Full explanation modal */}
      <AnimatePresence>
        {stage === 'explanation' && analysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(20, 19, 43, 0.92)', backdropFilter: 'blur(8px)' }}
            onClick={dismiss}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--ink-1)',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              }}
            >
              {/* Red header */}
              <div
                className="px-6 py-5 text-center"
                style={{
                  background: 'linear-gradient(135deg, #E1554A 0%, #B91C1C 100%)',
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block mb-2"
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </motion.div>
                <h2 className="font-display font-bold text-xl text-white">
                  YEH MESSAGE FRAUD HAI
                </h2>
                <p className="text-white/80 text-xs mt-1">
                  This message is a scam
                </p>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Reasons */}
                <div>
                  <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--risk-high)' }}>
                    Why this is dangerous
                  </p>
                  <ul className="space-y-2">
                    {analysis.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--risk-high)' }}>✕</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Safe action */}
                {analysis.officialRoute && (
                  <div
                    className="rounded-lg p-3"
                    style={{
                      backgroundColor: 'rgba(63, 167, 150, 0.08)',
                      border: '1px solid rgba(63, 167, 150, 0.2)',
                    }}
                  >
                    <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--safe)' }}>
                      ✓ Safe Action
                    </p>
                    <p className="text-xs" style={{ color: 'var(--parchment)' }}>
                      {analysis.officialRoute}
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <a
                    href="tel:1930"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--risk-high)',
                      color: 'white',
                    }}
                  >
                    📞 Report to 1930
                  </a>
                  <button
                    onClick={dismiss}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: 'var(--ink-2)',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
