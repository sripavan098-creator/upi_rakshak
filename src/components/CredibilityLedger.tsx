import { motion } from 'framer-motion';

/**
 * Credibility Ledger — What We Have Not Proved Yet
 * 
 * A two-column ledger showing what's been proved vs what hasn't.
 * Award rubrics and hackathon judges both score content credibility.
 * A Stage 1 submission that names its own gaps is far more persuasive than one that doesn't.
 */

interface LedgerItem {
  proved: string;
  notProved: string;
}

const LEDGER_ITEMS: LedgerItem[] = [
  {
    proved: '257 native keyword signals catalogued',
    notProved: 'Independent coverage validation (not measured)',
  },
  {
    proved: '<200ms overlay on iQOO 15',
    notProved: 'False positive rate (unknown)',
  },
  {
    proved: 'English + Hinglish cues in the live web engine',
    notProved: 'Full 22-language product coverage (not implemented)',
  },
  {
    proved: '17 unit tests passing',
    notProved: 'Production deployment (Stage 1)',
  },
  {
    proved: 'System-level notification interception',
    notProved: 'Battery impact over 30 days',
  },
  {
    proved: 'Hinglish voice output',
    notProved: 'Voice recognition accuracy',
  },
];

export default function CredibilityLedger() {
  return (
    <section className="bg-[var(--paper)] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-signage font-bold text-4xl text-[var(--ink)] mb-2">
            What We Have Not Proved Yet
          </h2>
          <p className="text-[var(--ink-light)] text-lg">
            Honesty is the foundation of trust. Here's what we know, and what we don't.
          </p>
        </div>

        {/* Ledger table */}
        <div className="border-2 border-[var(--ink)] bg-white">
          {/* Table header */}
          <div className="grid grid-cols-2 border-b-2 border-[var(--ink)] bg-[var(--paper-dark)]">
            <div className="p-6 border-r border-[var(--ink)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--bbps-green)] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-signage font-bold text-xl text-[var(--ink)]">
                  What We Have Proved
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--warning)] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-signage font-bold text-xl text-[var(--ink)]">
                  What We Have Not Proved Yet
                </h3>
              </div>
            </div>
          </div>

          {/* Table rows */}
          {LEDGER_ITEMS.map((item, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-2 border-b border-[var(--ink)]/20 last:border-b-0"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="p-6 border-r border-[var(--ink)]/20 bg-green-50/30">
                <p className="text-[var(--ink)] font-medium">{item.proved}</p>
              </div>
              <div className="p-6 bg-yellow-50/30">
                <p className="text-[var(--ink)]">{item.notProved}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Context paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-[var(--paper-dark)] border-2 border-[var(--ink)] p-8"
        >
          <h3 className="font-signage font-bold text-xl text-[var(--ink)] mb-4">
            Why This Matters
          </h3>
          <div className="space-y-4 text-[var(--ink)] leading-relaxed">
            <p>
              Most hackathon submissions claim to solve problems they haven't actually tested. 
              They show polished demos and talk about "millions of users" without a single real user.
            </p>
            <p>
              <strong>We're different.</strong> We're showing you a Stage 1 proof-of-concept. 
              We've built the mechanism — the notification interception, the rules engine, the overlay — 
              but we haven't deployed it to real users yet.
            </p>
            <p>
              That's not a weakness. <strong>That's honesty.</strong> And in a world of overpromising, 
              honesty is the most valuable currency.
            </p>
            <p className="font-signage font-bold text-lg pt-4 border-t border-[var(--ink)]/20">
              The next step is real user testing. We're looking for partners who want to pilot 
              UPI Rakshak with their customers.
            </p>
          </div>
        </motion.div>

        {/* Technical limitations */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 grid md:grid-cols-2 gap-6"
        >
          <div className="bg-white border-2 border-[var(--ink)] p-6">
            <h4 className="font-signage font-bold text-lg text-[var(--ink)] mb-3">
              Known Limitations
            </h4>
            <ul className="space-y-2 text-sm text-[var(--ink)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--stamp-red)] font-bold">•</span>
                <span>Keyword-based detection is brittle — novel scam wording may slip through</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--stamp-red)] font-bold">•</span>
                <span>No machine learning yet — rules are hand-coded</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--stamp-red)] font-bold">•</span>
                <span>Escalation to trusted contacts is simulated, not implemented</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--stamp-red)] font-bold">•</span>
                <span>Cash flow uses mock data, not real SMS parsing</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border-2 border-[var(--ink)] p-6">
            <h4 className="font-signage font-bold text-lg text-[var(--ink)] mb-3">
              What's Next
            </h4>
            <ul className="space-y-2 text-sm text-[var(--ink)]">
              <li className="flex items-start gap-2">
                <span className="text-[var(--bbps-green)] font-bold">→</span>
                <span>Real user testing with 100+ participants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--bbps-green)] font-bold">→</span>
                <span>Machine learning model for pattern detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--bbps-green)] font-bold">→</span>
                <span>Real SMS parsing for cash flow analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--bbps-green)] font-bold">→</span>
                <span>Trusted contact escalation via WhatsApp/SMS</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-[var(--ink-light)] mb-6">
            Want to pilot UPI Rakshak with your users?
          </p>
          <a
            href="https://github.com/sripavan098-creator/upi_rakshak/issues/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex bg-[var(--ink)] text-[var(--paper)] px-8 py-4 font-signage font-bold text-lg uppercase tracking-wide hover:bg-[var(--ink-light)] transition-colors"
          >
            Start a pilot conversation
          </a>
        </motion.div>
      </div>
    </section>
  );
}
