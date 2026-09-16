import { motion } from 'framer-motion';

export default function ProjectOverview() {
  const docs = [
    { name: 'README.md', desc: 'Setup, run instructions, test commands', icon: '📖' },
    { name: 'BRIEF.md', desc: 'Problem, target users, why agentic, expected impact, demo storylines', icon: '📋' },
    { name: 'ARCHITECTURE.md', desc: 'System diagram, request lifecycle, tool schemas, failure handling, limitations', icon: '🏗️' },
    { name: 'DESIGN.md', desc: 'Design tokens, motifs, animation, voice/copy, accessibility, component handoff', icon: '🎨' },
    { name: 'docs/RESEARCH_NOTES.md', desc: 'Personas, design assumptions, open validation questions', icon: '🔬' },
    { name: 'PROJECT_OVERVIEW.md', desc: 'The end-to-end summary tying all of the above together', icon: '📑' },
  ];

  const tests = [
    { name: 'test_tools.py', count: 10, desc: 'Scam detection, cash flow, loan cost, escalation gating' },
    { name: 'test_app.py', count: 5, desc: 'Flask API validation, error handling, round-trip' },
  ];

  const openQuestions = [
    'Does the small-business persona need an entirely different flow?',
    'Is a text-first interface accessible to the lower-fluency persona it\'s trying to protect?',
    'Do users find the adaptation-step suggestions genuinely actionable?',
    'Does the escalation message need recipient context to be acted on?',
    'Does showing the trace increase trust or read as technical noise?',
    'How often would keyword-based detection flag legitimate messages?',
  ];

  return (
    <section className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--parchment)' }}>
            Project Overview
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: '60ch', margin: '0 auto' }}>
            One document covering the problem, the solution, the architecture, the design system, the implementation, the tests, and the open research questions — end to end.
          </p>
        </div>

        {/* Quick summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[14px] p-6 mb-8"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--gold)' }}>
            What this is
          </h3>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--muted)' }}>
            UPI Rakshak is a real-time financial safety agent for everyday UPI users in India, built for the <strong style={{ color: 'var(--parchment)' }}>Agentic AI Hackathon (FinTech & Commerce domain)</strong>. It takes a real situation — a pasted payment message, a cash-flow question, or both, often in code-mixed Hindi/English — and screens for scams, projects cash flow, computes true loan costs, recommends safer paths, and escalates when needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {['Screens messages', 'Projects cash flow', 'Computes loan costs', 'Recommends paths', 'Escalates risk'].map((item, i) => (
              <div key={i} className="rounded-lg p-2.5 text-center" style={{ backgroundColor: 'var(--ink-2)' }}>
                <p className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why agentic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-[14px] p-6 mb-8"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg mb-3" style={{ color: 'var(--gold)' }}>
            Why it's agentic, in one paragraph
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            A single LLM call can summarize a message or answer a question, but it can't decide <em>which</em> of several real checks apply to a specific situation, chain those checks so later ones use earlier ones' actual results, or notice that its first-draft answer doesn't fully solve the problem and go back for a better one. UPI Rakshak implements a genuine <strong style={{ color: 'var(--parchment)' }}>observe → decide → act → evaluate → adapt</strong> loop: Claude (via tool use) decides which of five deterministic Python tools to call and in what order, based on the specific input, and the system prompt explicitly requires it to check its own recommendation against the user's real numbers before finalizing.
          </p>
        </motion.div>

        {/* Document map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="font-display font-bold text-xl mb-4 text-center" style={{ color: 'var(--parchment)' }}>
            Document Map
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {docs.map((doc, i) => (
              <div
                key={i}
                className="rounded-lg p-4 chip"
                style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{doc.icon}</span>
                  <div className="flex-1">
                    <p className="font-mono text-xs font-semibold mb-1" style={{ color: 'var(--gold)' }}>
                      {doc.name}
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {doc.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="rounded-[14px] p-6 mb-8"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
            <span className="text-xl">✅</span>
            Proof it works: 15 passing tests
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            None of which call the real Anthropic API — all deterministic, all fast.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test, i) => (
              <div key={i} className="rounded-lg p-4" style={{ backgroundColor: 'var(--ink-2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs font-semibold" style={{ color: 'var(--safe)' }}>
                    {test.name}
                  </p>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(63, 167, 150, 0.15)', color: 'var(--safe)' }}
                  >
                    {test.count} passing
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {test.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--ink-2)' }}>
            <p className="text-[10px] font-mono" style={{ color: 'var(--muted-2)' }}>
              $ python -m pytest tests/ -v
            </p>
          </div>
        </motion.div>

        {/* Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="rounded-[14px] p-6 mb-8"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
            <span className="text-xl">🚀</span>
            Running it
          </h3>
          <div className="space-y-2">
            {[
              'pip install -r requirements.txt',
              'cp .env.example .env   # add your ANTHROPIC_API_KEY',
              '',
              'python main.py --scenario data/sample_scenario.txt   # CLI, full JSON trace',
              'python app.py                                        # web console at :5000',
              'python -m pytest tests/ -v                           # test suite',
            ].map((line, i) => (
              <p key={i} className="text-[11px] font-mono leading-relaxed" style={{ color: line ? 'var(--muted)' : 'transparent' }}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
            Two ready-made scenarios ship in <code className="font-mono text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--ink-2)', color: 'var(--gold)' }}>data/</code>: the primary scam + rent-gap demo storyline, and a failure/adaptation case where avoiding the loan alone doesn't fully resolve the shortfall.
          </p>
        </motion.div>

        {/* Open questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="rounded-[14px] p-6"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
            <span className="text-xl">🔬</span>
            What's still open
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            This is a Stage 1 hackathon build. Several things are deliberately scoped out or left as open questions rather than glossed over:
          </p>
          <div className="space-y-2 mb-4">
            {[
              'No persistence, no auth, no real escalation delivery — stateless by design for this stage.',
              'Fixed, hand-authored scam-phrase list — won\'t catch novel wording it hasn\'t been told about.',
              'No real user research yet — personas and assumptions are hypotheses to test, not validated findings.',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--muted-2)' }}>—</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{item}</p>
              </div>
            ))}
          </div>
          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--gold)' }}>
              Six specific open questions worth validating before a wider release:
            </p>
            <ol className="space-y-2">
              {openQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--gold)' }}>{i + 1}.</span>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{q}</p>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
