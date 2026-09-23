import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import InterceptionTimeline from './InterceptionTimeline';
import CashFlowRuler from './CashFlowRuler';
import LoanReceipt from './LoanReceipt';
import CredibilityLedger from './CredibilityLedger';
import QrCodeScanner from './QrCodeScanner';
import NoticeVoicePanel from './NoticeVoicePanel';
import NoticeAttackSimulation from './NoticeAttackSimulation';
import MessageAnalysisWorkbench from './MessageAnalysisWorkbench';

/**
 * The Notice — Landing Page
 * 
 * Inspired by Indian public notices, registrar documents, and official stamps.
 * The alert is the product. Everything else is quiet so it can shout.
 */

export default function TheNoticeLanding() {
  const [attackOpen, setAttackOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="notice-nav" aria-label="Primary navigation">
      <header className="notice-nav">
        <a className="notice-brand" href="#top" aria-label="UPI Rakshak home">
          <span className="notice-brand__seal" aria-hidden="true">र</span>
          <span>UPI Rakshak</span>
        </a>
        <nav className="notice-nav__links" aria-label="Primary navigation">
          <a href="#scanner">Live scanner</a>
          <a href="#cash-flow">Cash flow</a>
          <a href="#loans">Loan receipt</a>
          <a href="https://github.com/sripavan098-creator/upi_rakshak" target="_blank" rel="noreferrer">Source</a>
          <a className="notice-nav__primary" href="#scanner">Run defense</a>
          <span className={`notice-offline-status ${isOnline ? 'is-online' : 'is-offline'}`} aria-live="polite">
            {isOnline ? 'LOCAL RULES READY' : 'OFFLINE MODE'}
          </span>
        </nav>
        {/* Mobile section menu — desktop links are hidden under 680px */}
        <details
          className="notice-nav__mobile"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) e.currentTarget.removeAttribute('open');
          }}
        >
          <summary aria-label="Open section menu">☰<span className="visually-hidden"> Menu</span></summary>
          <div className="notice-nav__mobile-sheet">
            <a href="#interception">Interception</a>
            <a href="#scanner">Live scanner</a>
            <a href="#cash-flow">Cash flow</a>
            <a href="#loans">Loan receipt</a>
            <a href="https://github.com/sripavan098-creator/upi_rakshak" target="_blank" rel="noreferrer">Source ↗</a>
          </div>
        </details>
      </header>
      <main id="main">
      {/* Hero Section */}
      <section id="top" className="hero-section flex items-center px-4 py-14 sm:py-16 scroll-mt-16">
        <div className="hero-grid max-w-6xl mx-auto w-full">
          <div className="hero-copy text-center md:text-left">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="notice-kicker mx-auto md:mx-0"
          >
            <span>Agentic AI Hackathon 2025</span>
            <span aria-hidden="true">•</span>
            <span>FinTech &amp; Commerce</span>
          </motion.div>
          {/* Official seal */}
          <motion.div
            initial={false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-block mb-6"
          >
            <div
              className="w-20 h-20 rounded-full bg-[var(--seal-gold)] flex items-center justify-center mx-auto md:mx-0"
              style={{ boxShadow: 'var(--shadow-seal)' }}
            >
              <span className="text-white font-signage font-bold text-3xl">र</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-signage font-bold text-5xl sm:text-6xl md:text-7xl text-[var(--ink)] mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Stop the scam<br />before you pay.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-[var(--ink-light)] mb-5 max-w-2xl mx-auto md:mx-0"
          >
            UPI Rakshak is a decision-time safety layer for India's digital economy.
          </motion.p>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="max-w-2xl mx-auto md:mx-0 text-base sm:text-lg text-[var(--ink-light)] leading-relaxed"
          >
            A safety layer that stops fraud <strong>before you pay</strong> — by explaining the exact trap in the message, not just showing another warning after the money is gone.
          </motion.p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-7 mb-7">
            <a className="notice-cta notice-cta--primary" href="#scanner">Run the live defense</a>
            <a className="notice-cta notice-cta--secondary" href="#cash-flow">See the money layer</a>
          </div>

          <div className="hero-proofline" aria-label="Product guarantees">
            <span><b>LOCAL</b> deterministic rules</span>
            <span><b>EXPLAINS</b> the exact trap</span>
            <span><b>ACTS</b> before approval</span>
          </div>

          {/* Hindi tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[var(--ink)] mb-7 hindi"
          >
            आपके पैसों का रक्षक
          </motion.p>

          {/* Evidence register */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="notice-register max-w-4xl mx-auto md:mx-0"
          >
            <div><span>01 / NATIVE REGISTER</span><strong>257</strong><em>keyword signals</em></div>
            <div><span>02 / RESPONSE TIME</span><strong>&lt;200ms</strong><em>overlay detection</em></div>
            <div><span>03 / LIVE WEB CUES</span><strong>2</strong><em>English + Hinglish</em></div>
            <div><span>04 / VALIDATION</span><strong>48</strong><em>unit tests passing</em></div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <p className="text-sm text-[var(--ink-light)] mb-2">Scroll to see the mechanism</p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl"
            >
              ↓
            </motion.div>
          </motion.div>
          </div>

          <motion.aside
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="hero-preview"
            aria-label="UPI Rakshak scam interception preview"
          >
            <div className="hero-preview__topline">
              <span>LIVE DEFENSE / 01</span>
              <span className="hero-preview__status">● ARMED</span>
            </div>
            <div className="hero-preview__phone">
              <div className="hero-preview__phonebar"><span>WhatsApp</span><span>9:41 AM</span></div>
              <div className="hero-preview__message">
                <span className="hero-preview__sender">Unknown sender</span>
                <p>URGENT: Scan this QR and enter your UPI PIN to receive your electricity refund.</p>
              </div>
              <div className="hero-preview__alert">
                <strong>RAKSHAK ALERT</strong>
                <span>QR codes send money. A PIN is never needed to receive a refund.</span>
              </div>
            </div>
            <div className="hero-preview__verdict">
              <span className="hero-preview__seal">!</span>
              <div><strong>HIGH RISK</strong><small>3 payment traps intercepted before approval</small></div>
            </div>
            <button type="button" className="hero-preview__action" onClick={() => setAttackOpen(true)}>
              Simulate scam attack ↓
            </button>
            <p className="hero-preview__footer">The product moment: explain the trap before the money leaves.</p>
          </motion.aside>
        </div>
      </section>

      {/* The Interception Timeline — Signature Moment */}
      <div id="interception" className="scroll-mt-16"><InterceptionTimeline /></div>

      {/* Real-Time QR Scanner & Status Indicator */}
      <section id="scanner" className="py-20 px-4 bg-[var(--ink)] border-t-2 border-b-2 border-[rgba(233, 231, 219, 0.18)] scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-[var(--seal-gold)] text-[var(--ink)] font-mono text-xs font-bold uppercase tracking-widest mb-3">
              LIVE OPTICAL DEFENSE
            </span>
            <h2 className="font-signage font-bold text-4xl sm:text-5xl text-[var(--paper)] mb-4">
              Real-Time QR Scanner & Safety Scoring
            </h2>
            <p className="text-base sm:text-lg text-[var(--paper-dark)] max-w-2xl mx-auto">
              Scan any merchant or payment QR code with your device camera. Rakshak parses the payload, identifies reversed payment traps, detects unauthorized VPA handles, and renders the live safety score in &lt;180ms.
            </p>
          </div>

          <MessageAnalysisWorkbench />
          <NoticeVoicePanel />
          <QrCodeScanner id="live-qr-scanner-section" />
        </div>
      </section>

      {/* Cash Flow Ruler */}
      <div id="cash-flow" className="scroll-mt-16"><CashFlowRuler /></div>

      {/* Loan Receipt */}
      <div id="loans" className="scroll-mt-16"><LoanReceipt /></div>

      <section className="notice-annex" aria-labelledby="iqoo-title">
        <div className="max-w-5xl mx-auto">
          <span className="notice-annex__label">ANDROID ANNEX / iQOO + FUNTOUCH OS</span>
          <h2 id="iqoo-title">The guard has to survive the phone.</h2>
          <p>For the iQOO battle, the native layer keeps Rakshak alive between notifications: autostart whitelist, battery-optimization exemption, notification priority, and overlay permission are the product—not setup trivia.</p>
          <div className="notice-annex__facts"><span>01 / AUTOSTART</span><span>02 / BATTERY EXEMPTION</span><span>03 / PRIORITY OVERLAY</span></div>
        </div>
      </section>

      {/* Credibility Ledger */}
      <CredibilityLedger />

      {/* Footer */}
      </main>
      <footer className="bg-[var(--ink)] text-[var(--paper)] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-signage font-bold text-2xl mb-4">
            The notice is served. The guard is posted.
          </p>
          <p className="text-lg mb-8">
            The scam ends here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/sripavan098-creator/upi_rakshak"
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--paper)] text-[var(--ink)] px-6 py-3 font-signage font-bold uppercase tracking-wide hover:bg-[var(--paper-dark)] transition-colors"
            >
              View Source
            </a>
            <a
              href="https://www.cybercrime.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--bbps-green)] text-white px-6 py-3 font-signage font-bold uppercase tracking-wide hover:bg-[var(--ink)] transition-colors"
            >
              Report a Scam
            </a>
          </div>
          <p className="mt-8 text-sm text-[var(--paper)]/60">
            Built for the Agentic AI Hackathon • FinTech & Commerce Domain
          </p>
        </div>
      </footer>
      <NoticeAttackSimulation open={attackOpen} onClose={() => setAttackOpen(false)} />
    </div>
  );
}
