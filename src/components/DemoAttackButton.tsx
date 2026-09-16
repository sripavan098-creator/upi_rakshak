import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScamOverlay from './ScamOverlay';
import { analyzeMessage, type ThreatAnalysis } from '../lib/rulesEngine';
import { stopSpeaking } from '../lib/voice';
import { simulateScam } from '../lib/nativeBridge';
import Rakshak, { isNativeAvailable } from '../lib/rakshakNative';

const SCAM_MESSAGE = '⚡ URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici';

/**
 * Demo Attack Simulator — the hackathon-winning moment.
 * Simulates a scam attack with fake WhatsApp notification → Rakshak overlay → full explanation.
 *
 * Flow:
 * 1. Click button → stage = 'whatsapp' (fake WhatsApp notification)
 * 2. After 1.5s → stage = 'rakshak' (red overlay slides down)
 * 3. If user TAPS the overlay → immediately stage = 'explanation' (cancels 3s timer)
 * 4. If user does NOT tap → after 3s total, auto-advance to stage = 'explanation'
 * 5. Dismiss button → stage = 'idle'
 */
export default function DemoAttackButton() {
  const [stage, setStage] = useState<'idle' | 'whatsapp' | 'rakshak' | 'explanation'>('idle');
  const [analysis, setAnalysis] = useState<ThreatAnalysis | null>(null);

  // Timer refs so we can clear them
  const rakshakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const explanationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (rakshakTimerRef.current) clearTimeout(rakshakTimerRef.current);
      if (explanationTimerRef.current) clearTimeout(explanationTimerRef.current);
    };
  }, []);

  const clearAllTimers = () => {
    if (rakshakTimerRef.current) {
      clearTimeout(rakshakTimerRef.current);
      rakshakTimerRef.current = null;
    }
    if (explanationTimerRef.current) {
      clearTimeout(explanationTimerRef.current);
      explanationTimerRef.current = null;
    }
  };

  const showExplanation = () => {
    clearAllTimers();
    const result = analyzeMessage('WhatsApp', SCAM_MESSAGE);
    setAnalysis(result);
    setStage('explanation');
  };

  const runDemo = async () => {
    clearAllTimers();
    setStage('whatsapp');
    setAnalysis(null);

    // If native is available, trigger the real Android overlay
    if (isNativeAvailable()) {
      const analysis = analyzeMessage('WhatsApp', SCAM_MESSAGE);
      try {
        await Rakshak.showOverlay({
          message: SCAM_MESSAGE,
          level: analysis.level,
          officialRoute: analysis.officialRoute,
        });
      } catch (e) {
        console.error('Failed to show native overlay:', e);
      }
    }

    // Also trigger web simulation as fallback
    simulateScam();

    // After 1.5s, show Rakshak overlay (web)
    rakshakTimerRef.current = setTimeout(() => {
      setStage('rakshak');

      // After another 1.5s (3s total), auto-advance to explanation
      explanationTimerRef.current = setTimeout(() => {
        showExplanation();
      }, 1500);
    }, 1500);
  };

  const handleOverlayTap = () => {
    // User tapped the rakshak overlay — immediately show explanation
    showExplanation();
  };

  const dismiss = () => {
    clearAllTimers();
    stopSpeaking();
    setStage('idle');
    setAnalysis(null);
  };

  // Check if native overlay is available (Android WebView)
  const hasNativeOverlay = typeof window !== 'undefined' && !!window.RakshakNative;

  const triggerNativeOverlay = () => {
    if (hasNativeOverlay) {
      window.RakshakNative!.log(`Triggering native overlay for: ${SCAM_MESSAGE}`);
      // The Android side will handle the actual overlay display
      // via NotificationListenerService → RakshakOverlayService
    } else {
      alert('Native overlay requires the Android wrapper. This is the web fallback.');
    }
  };

  return (
    <>
      {/* Overlays */}
      <ScamOverlay
        visible={stage === 'whatsapp'}
        message={SCAM_MESSAGE}
        variant="whatsapp"
      />
      <ScamOverlay
        visible={stage === 'rakshak'}
        message={SCAM_MESSAGE}
        variant="rakshak"
        onTap={handleOverlayTap}
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
            <p className="text-[10px] mt-1" style={{ color: isNativeAvailable() ? 'var(--safe)' : 'var(--muted-2)' }}>
              {isNativeAvailable()
                ? '✓ Uses real Android overlay (visible over WhatsApp)'
                : 'ℹ Uses web simulation (for desktop preview)'}
            </p>
          </div>
          <div className="flex gap-2">
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
            {hasNativeOverlay && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={triggerNativeOverlay}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-display font-semibold text-xs"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                }}
              >
                <span>📱</span>
                Native Overlay
              </motion.button>
            )}
          </div>
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
