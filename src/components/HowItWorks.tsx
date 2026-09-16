import { motion } from 'framer-motion';

const tools = [
  {
    name: 'analyze_payment_message',
    title: 'Screen Message',
    description: 'Checks the message against known UPI scam patterns. Names the exact phrase that triggered each flag.',
    inputs: 'message_text',
    outputs: 'flags[] + verdict',
    color: 'var(--risk-high)',
  },
  {
    name: 'suggest_safe_alternative',
    title: 'Safe Alternative',
    description: 'Returns the legitimate way to accomplish what the message claims — always the biller\'s own official channel.',
    inputs: 'context',
    outputs: 'safe_channel + explanation',
    color: 'var(--safe)',
  },
  {
    name: 'forecast_cash_flow',
    title: 'Project Cash Flow',
    description: 'Walks your balance forward through each upcoming expense. Reports whether it goes negative before income arrives.',
    inputs: 'balance, expenses[], days_to_income',
    outputs: 'timeline + shortfall warning',
    color: 'var(--risk-med)',
  },
  {
    name: 'compute_true_loan_cost',
    title: 'True Loan Cost',
    description: 'Standard amortizing EMI formula + processing fee + flat fees → one real total. No marketing headline rate.',
    inputs: 'principal, rate, tenure, fees',
    outputs: 'EMI, total cost, effective rate',
    color: 'var(--gold)',
  },
  {
    name: 'escalate_to_trusted_contact',
    title: 'Escalate Alert',
    description: 'Gate: only medium/high risk verdicts produce an alert. Low risk returns escalated: false explicitly.',
    inputs: 'summary, risk_verdict',
    outputs: 'escalated + alert message',
    color: '#A78BFA',
  },
];

export default function HowItWorks() {
  return (
    <section className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--parchment)' }}>
            The Agent's Action Space
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: '54ch', margin: '0 auto' }}>
            Five deterministic tools. Claude selects zero or more per turn based on what the specific scenario actually contains — not a fixed script.
          </p>
        </div>

        {/* Tool grid (1px gap trick) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="how-grid"
        >
          {tools.map((tool, i) => (
            <div key={i} className="p-5">
              <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: tool.color }} />
              <h3 className="font-display font-semibold text-sm mb-1" style={{ color: 'var(--parchment)' }}>
                {tool.title}
              </h3>
              <p className="text-[10px] font-mono mb-2" style={{ color: 'var(--muted-2)' }}>
                {tool.name}
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
                {tool.description}
              </p>
              <div className="space-y-1">
                <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>
                  <span className="font-medium">In:</span> {tool.inputs}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>
                  <span className="font-medium">Out:</span> {tool.outputs}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Key point */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 p-5 rounded-[14px]"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--gold)' }}>
            Why dynamic selection matters
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            A pure "can I afford rent?" question has no message to scan. A pure "is this SMS legit?" question has no loan to cost out. 
            The right <em>set</em> of checks is a function of the specific input — decided per-situation, not a fixed if/else script, 
            and not "run everything just in case" (which would produce irrelevant output for cases that don't apply).
          </p>
        </motion.div>
      </div>
    </section>
  );
}
