import { motion } from 'framer-motion';

export default function Impact() {
  const impacts = [
    {
      title: 'Fraud interrupted at the moment of decision',
      description: 'The scam explanation arrives before the QR is scanned, not as after-the-fact awareness content. Names the specific phrase that triggered the flag so it\'s checkable rather than just assertion.',
      metric: 'Real-time',
      metricLabel: 'intervention',
      color: 'var(--risk-high)',
    },
    {
      title: 'Predatory borrowing made visible',
      description: 'Converting a marketing rate into an actual rupee total turns an abstract percentage into a comparable, concrete cost — the same framing effect that makes APR disclosure requirements effective.',
      metric: '₹700+',
      metricLabel: 'hidden cost revealed',
      color: 'var(--risk-med)',
    },
    {
      title: 'Shortfalls surfaced days early',
      description: 'Cash flow projection exists so the "I didn\'t see it coming" failure mode has a chance to be replaced by a few days\' notice and a real alternative.',
      metric: '3–5 days',
      metricLabel: 'early warning',
      color: 'var(--safe)',
    },
    {
      title: 'A second line of defense',
      description: 'For the first-time/lower-fluency persona, protection doesn\'t depend entirely on the primary user\'s judgment in the moment — a trusted contact gets a chance to intervene before money moves.',
      metric: '2nd line',
      metricLabel: 'of defense',
      color: '#A78BFA',
    },
  ];

  const personas = [
    {
      title: 'Paycheck-to-paycheck salaried',
      description: 'Predictable monthly income, but rent/EMI/recharge dates cluster in ways that create real multi-day windows of low balance. Most exposed to instant-loan advertising during those windows.',
      color: 'var(--risk-med)',
    },
    {
      title: 'First-time / lower-fluency UPI users',
      description: 'Often older family members or people newer to smartphones. Most likely to take an official-looking message at face value. Benefit most from plain-language explanations.',
      color: '#A78BFA',
    },
    {
      title: 'Small business owners',
      description: 'Receive many genuine payment/QR-scan requests daily, so tolerance for false positives is much lower. Not deeply addressed by the current MVP — flagged as an open gap.',
      color: '#22D3EE',
    },
  ];

  return (
    <section className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--parchment)' }}>
            Expected Impact
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: '54ch', margin: '0 auto' }}>
            Mechanisms the design targets, stated as hypotheses to test — not measured outcomes. This is a hackathon proof-of-concept with no live user base yet.
          </p>
        </div>

        {/* Impact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {impacts.map((impact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="rounded-[14px] p-5 chip"
              style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: impact.color }} />
                <div className="text-right">
                  <p className="font-display font-bold text-lg" style={{ color: 'var(--parchment)' }}>{impact.metric}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>{impact.metricLabel}</p>
                </div>
              </div>
              <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--parchment)' }}>
                {impact.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                {impact.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Personas */}
        <div className="mb-12">
          <h3 className="font-display font-bold text-xl mb-6 text-center" style={{ color: 'var(--parchment)' }}>
            Target Personas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {personas.map((persona, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="rounded-[14px] p-5"
                style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
              >
                <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: persona.color }} />
                <h4 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--parchment)' }}>
                  {persona.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {persona.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Honesty note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-[14px] p-6 mb-12"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(232, 163, 61, 0.1)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm mb-2" style={{ color: 'var(--parchment)' }}>
                Honesty Note
              </h3>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
                Validating any of these as <em>actual</em> impact (fraud rate reduction, borrowing rate change) would require a real pilot with real users — explicitly out of scope for this Stage 1 submission, and called out as such rather than implied.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Proof-of-concept demonstrates the mechanism',
                  'All numbers are deterministic, verifiable',
                  'Full agent trace is auditable',
                  'Limitations explicitly acknowledged',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: 'var(--muted)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Known limitations */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-[14px] p-6"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-sm mb-4" style={{ color: 'var(--parchment)' }}>
            Known Limitations — Stage 1
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'No persistence layer — every request is stateless; no user account, no history, no real trusted-contact delivery mechanism.',
              'No authentication — the web console is a single-user local demo, not a multi-tenant product. Deliberate scope cut.',
              'The scam-pattern list is fixed and hand-authored — it will not catch novel scam wording it hasn\'t been told about.',
              'forecast_cash_flow takes expenses as a flat list the model extracts from free text; no recurring-expense model or historical data.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--muted-2)' }}>—</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
