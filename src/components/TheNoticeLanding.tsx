import { motion } from 'framer-motion';
import InterceptionTimeline from './InterceptionTimeline';
import CashFlowRuler from './CashFlowRuler';
import LoanReceipt from './LoanReceipt';
import CredibilityLedger from './CredibilityLedger';

/**
 * The Notice — Landing Page
 * 
 * Inspired by Indian public notices, registrar documents, and official stamps.
 * The alert is the product. Everything else is quiet so it can shout.
 */

export default function TheNoticeLanding() {
  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Official seal */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="inline-block mb-8"
          >
            <div
              className="w-24 h-24 rounded-full bg-[var(--seal-gold)] flex items-center justify-center mx-auto"
              style={{ boxShadow: 'var(--shadow-seal)' }}
            >
              <span className="text-white font-signage font-bold text-3xl">र</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-signage font-bold text-6xl md:text-7xl text-[var(--ink)] mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            UPI Rakshak
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-[var(--ink-light)] mb-8 max-w-2xl mx-auto"
          >
            The real-time financial safety layer for India's digital economy
          </motion.p>

          {/* Hindi tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[var(--ink)] mb-12 hindi"
          >
            आपके पैसों का रक्षक
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            <div className="bg-white border-2 border-[var(--ink)] p-4">
              <p className="font-signage font-bold text-3xl text-[var(--ink)]">200+</p>
              <p className="text-sm text-[var(--ink-light)]">Fraud Patterns</p>
            </div>
            <div className="bg-white border-2 border-[var(--ink)] p-4">
              <p className="font-signage font-bold text-3xl text-[var(--ink)]">&lt;200ms</p>
              <p className="text-sm text-[var(--ink-light)]">Detection Time</p>
            </div>
            <div className="bg-white border-2 border-[var(--ink)] p-4">
              <p className="font-signage font-bold text-3xl text-[var(--ink)]">22</p>
              <p className="text-sm text-[var(--ink-light)]">Indian Languages</p>
            </div>
            <div className="bg-white border-2 border-[var(--ink)] p-4">
              <p className="font-signage font-bold text-3xl text-[var(--ink)]">17</p>
              <p className="text-sm text-[var(--ink-light)]">Unit Tests</p>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16"
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
      </section>

      {/* The Interception Timeline — Signature Moment */}
      <InterceptionTimeline />

      {/* Cash Flow Ruler */}
      <CashFlowRuler />

      {/* Loan Receipt */}
      <LoanReceipt />

      {/* Credibility Ledger */}
      <CredibilityLedger />

      {/* Footer */}
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
              href="https://github.com/yourusername/upi-rakshak"
              className="bg-[var(--paper)] text-[var(--ink)] px-6 py-3 font-signage font-bold uppercase tracking-wide hover:bg-[var(--paper-dark)] transition-colors"
            >
              View Source
            </a>
            <a
              href="https://t.me/upirakshak"
              className="bg-[var(--bbps-green)] text-white px-6 py-3 font-signage font-bold uppercase tracking-wide hover:bg-[var(--ink)] transition-colors"
            >
              Join Pilot Program
            </a>
          </div>
          <p className="mt-8 text-sm text-[var(--paper)]/60">
            Built for the Agentic AI Hackathon • FinTech & Commerce Domain
          </p>
        </div>
      </footer>
    </div>
  );
}
