import { motion } from 'framer-motion';

export default function Architecture() {
  const phases = [
    { phase: 'OBSERVE', color: '#60A5FA', description: 'Scenario text becomes the first user-role message in the conversation.' },
    { phase: 'DECIDE', color: '#A78BFA', description: 'Claude (tool-use) picks 0+ tools from TOOL_SCHEMAS based on what this specific situation needs.' },
    { phase: 'ACT', color: 'var(--safe)', description: 'Each chosen tool call is dispatched to agent/tools.py. The real, deterministic result is recorded.' },
    { phase: 'EVALUATE', color: 'var(--gold)', description: 'Once Claude stops calling tools, its final text is the answer. If max_turns is hit first, that is surfaced explicitly.' },
    { phase: 'ADAPT', color: '#22D3EE', description: 'System prompt instructs Claude to check whether its first recommendation actually resolves the situation — and if not, look for a further option.' },
  ];

  return (
    <section className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--parchment)' }}>
            System Architecture
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: '54ch', margin: '0 auto' }}>
            The observe → decide → act → evaluate → adapt loop. Not a single-turn Q&A — a genuine agentic cycle that checks its own work.
          </p>
        </div>

        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[14px] p-6 mb-12"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          {/* Browser */}
          <div className="rounded-lg p-4 mb-4 text-center" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
            <p className="font-display font-semibold text-xs" style={{ color: 'var(--parchment)' }}>Browser (index.html)</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted-2)' }}>scan-console UI, JS</p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <div className="flex flex-col items-center">
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
              <p className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted-2)' }}>
                POST /api/analyze
              </p>
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          </div>

          {/* Flask */}
          <div className="rounded-lg p-4 mb-4 text-center" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
            <p className="font-display font-semibold text-xs" style={{ color: 'var(--parchment)' }}>Flask app (app.py)</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted-2)' }}>input validation, error → JSON mapping</p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <div className="flex flex-col items-center">
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
              <p className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted-2)' }}>
                RakshakAgent(scenario_text).run()
              </p>
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          </div>

          {/* Agent loop */}
          <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
            <p className="font-display font-semibold text-xs mb-3 text-center" style={{ color: 'var(--parchment)' }}>
              agent/agent.py — RakshakAgent
            </p>
            <div className="space-y-2">
              {phases.map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <div>
                    <p className="text-[10px] font-display font-bold" style={{ color: p.color }}>{p.phase}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>
                loop (max 8 turns): DECIDE → ACT → (results fed back) → DECIDE → …
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-2">
            <div className="flex flex-col items-center">
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
              <p className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted-2)' }}>
                calls
              </p>
              <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
            </div>
          </div>

          {/* Tools */}
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
            <p className="font-display font-semibold text-xs" style={{ color: 'var(--parchment)' }}>agent/tools.py</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--muted-2)' }}>deterministic — no LLM involved</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {['analyze_payment_message', 'suggest_safe_alternative', 'forecast_cash_flow', 'compute_true_loan_cost', 'escalate_to_trusted_contact'].map((tool, i) => (
                <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--ink)', color: 'var(--muted-2)' }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key design principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <PrincipleCard
            title="Deterministic Math"
            description="Every rupee figure is computed by Python functions, never generated by the LLM. The LLM decides which tool to call and how to explain the result — never invents a number."
            color="var(--safe)"
          />
          <PrincipleCard
            title="Auditable Trace"
            description="Every step is logged with phase, detail, tool, and result. The full reasoning chain is inspectable — not a black box that produces an answer from nowhere."
            color="var(--gold)"
          />
          <PrincipleCard
            title="Self-Checking"
            description="The system prompt explicitly instructs Claude to check whether its first recommendation actually resolves the situation — and if not, look for a further option or state what it couldn't resolve."
            color="#A78BFA"
          />
        </div>

        {/* Why agentic */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-[14px] p-6"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--parchment)' }}>
            Why this loop, not a single prompt
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-display font-bold mb-2" style={{ color: 'var(--risk-high)' }}>
                Single LLM Call
              </h4>
              <ul className="space-y-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                <li>• Fixed prompt, fixed output format</li>
                <li>• Cannot chain tool outputs dependently</li>
                <li>• No self-checking mechanism</li>
                <li>• May generate plausible-sounding but wrong numbers</li>
                <li>• Cannot go back and fix an incomplete answer</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-display font-bold mb-2" style={{ color: 'var(--safe)' }}>
                Agentic Loop (UPI Rakshak)
              </h4>
              <ul className="space-y-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                <li>• Dynamic tool selection per input</li>
                <li>• Sequential, dependency-chained computation</li>
                <li>• Self-checks recommendation against actual data</li>
                <li>• All numbers from deterministic functions</li>
                <li>• Adapts when first answer is incomplete</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PrincipleCard({ title, description, color }: { title: string; description: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[14px] p-5"
      style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
    >
      <div className="w-2 h-2 rounded-full mb-3" style={{ backgroundColor: color }} />
      <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--parchment)' }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{description}</p>
    </motion.div>
  );
}
