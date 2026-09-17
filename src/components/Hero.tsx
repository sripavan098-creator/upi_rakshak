import { motion } from 'framer-motion';
import { useLanguage } from '../i18n/LanguageContext';

interface HeroProps {
  onExplore: () => void;
}

export default function Hero({ onExplore }: HeroProps) {
  const { t } = useLanguage();
  
  return (
    <section className="min-h-screen flex flex-col justify-center relative pt-14 overflow-hidden">
      {/* Ambient radar rings */}
      <div className="absolute top-20 right-10 w-64 h-64 pointer-events-none" aria-hidden="true">
        <div className="radar-ring absolute inset-0" />
        <div className="radar-ring absolute inset-0" />
        <div className="radar-ring absolute inset-0" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              backgroundColor: 'rgba(232, 163, 61, 0.08)',
              border: '1px solid rgba(232, 163, 61, 0.2)',
              color: 'var(--gold)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Agentic AI Hackathon — Stage 1 Submission
          </motion.div>

          {/* Headline */}
          <h1
            className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-6"
            style={{ maxWidth: '16ch', margin: '0 auto 1.5rem' }}
          >
            <span style={{ color: 'var(--parchment)' }}>{t('appName')}</span>
            <br />
            <span style={{ color: 'var(--gold)' }}>{t('tagline')}</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl leading-relaxed mb-10"
            style={{ color: 'var(--muted)', maxWidth: '54ch', margin: '0 auto 2.5rem' }}
          >
            UPI Rakshak sits between you and the moment of decision — scanning a QR, taking a loan — and tells you, with real numbers, what's actually true. Not after the fact.{' '}
            <span style={{ color: 'var(--parchment)' }}>Right then.</span>
          </p>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-display font-semibold text-sm transition-all"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'var(--ink)',
            }}
          >
            {t('demoButton')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Three value props */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20"
        >
          <ValueCard
            title="Screens payment messages"
            description="Names the exact phrase that triggered each flag — never a vague 'this looks risky.'"
            color="var(--risk-high)"
          />
          <ValueCard
            title="Projects cash flow"
            description="Surfaces shortfalls days before they happen — not after a payment bounces."
            color="var(--risk-med)"
          />
          <ValueCard
            title="Computes true loan cost"
            description="Converts marketing rates into actual rupee totals — principal + interest + all fees."
            color="var(--safe)"
          />
        </motion.div>
      </div>
    </section>
  );
}

function ValueCard({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <div
      className="p-5 rounded-[14px] transition-all duration-200 chip"
      style={{
        backgroundColor: 'var(--ink-1)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: color }} />
      <h3 className="font-display font-semibold text-base mb-1.5" style={{ color: 'var(--parchment)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {description}
      </p>
    </div>
  );
}
