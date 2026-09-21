import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { speakWarning } from '../lib/voice';

type Stage = 'notification' | 'fraud' | 'verdict';

interface NoticeAttackSimulationProps {
  open: boolean;
  onClose: () => void;
}

export default function NoticeAttackSimulation({ open, onClose }: NoticeAttackSimulationProps) {
  const [stage, setStage] = useState<Stage>('notification');

  useEffect(() => {
    if (!open) return;
    setStage('notification');
    const fraudTimer = window.setTimeout(() => {
      setStage('fraud');
      speakWarning('Yeh message fraud ho sakta hai. QR code scan karke ya UPI PIN dekar paisa receive nahi hota.', 'hi-IN');
    }, 1700);
    const verdictTimer = window.setTimeout(() => setStage('verdict'), 3400);
    return () => {
      window.clearTimeout(fraudTimer);
      window.clearTimeout(verdictTimer);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="notice-attack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="attack-title">
          <motion.div className="notice-attack__window" initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.96 }}>
            <div className="notice-attack__header">
              <div><span className="notice-attack__code">LIVE DEFENSE / SIMULATION</span><h2 id="attack-title">The decision moment</h2></div>
              <button type="button" className="notice-attack__close" onClick={onClose} aria-label="Close scam simulation">×</button>
            </div>
            <div className="notice-attack__phone" aria-live="assertive">
              <div className="notice-attack__phonebar"><span>{stage === 'notification' ? 'WhatsApp' : 'UPI Rakshak'}</span><span>9:41 AM</span></div>
              <AnimatePresence mode="wait">
                {stage === 'notification' && <motion.div key="notification" className="notice-attack__notification" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                  <span className="notice-attack__sender">Unknown sender · now</span>
                  <p>URGENT: Your electricity connection will be disconnected tonight. Scan this QR and enter your UPI PIN to receive a refund.</p>
                </motion.div>}
                {stage === 'fraud' && <motion.div key="fraud" className="notice-attack__fraud" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <span className="notice-attack__fraud-mark">!</span><div><strong>RAKSHAK ALERT</strong><p>FRAUD HO SAKTA HAI</p><small>QR codes send money. A PIN is never needed to receive a refund.</small></div>
                </motion.div>}
                {stage === 'verdict' && <motion.div key="verdict" className="notice-attack__verdict" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  <span className="notice-attack__stamp">FRAUD</span><h3>HIGH RISK / STOP</h3><ul><li>Receiving money never requires a UPI PIN.</li><li>Scanning a QR code debits your account.</li><li>Forwarded official notices are a trap signal.</li></ul><p className="notice-attack__safe">SAFE ACTION: Close the message. Use the official BSES app or call 1930.</p>
                </motion.div>}
              </AnimatePresence>
            </div>
            <div className="notice-attack__progress"><span className={stage === 'notification' ? 'is-active' : 'is-done'}>01 / NOTIFICATION</span><span className={stage === 'fraud' ? 'is-active' : stage === 'verdict' ? 'is-done' : ''}>02 / INTERCEPT</span><span className={stage === 'verdict' ? 'is-active' : ''}>03 / VERDICT</span></div>
            <p className="notice-attack__caption">A controlled recreation of the Android notification flow. No real notification is sent.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
