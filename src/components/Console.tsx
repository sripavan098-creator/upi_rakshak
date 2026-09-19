import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runAgent, pickVerdict, DEFAULT_SCENARIO, FAILURE_SCENARIO } from '../lib/agent';
import type { AgentResult, TraceEntry, Verdict } from '../lib/agent';
import { analyzeMessage, type ThreatAnalysis } from '../lib/rulesEngine';
import TraceStepper from './TraceStepper';
import ToolDataCard from './ToolDataCard';

export default function Console() {
  const [inputText, setInputText] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<TraceEntry[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Quick scan state
  const [quickScanText, setQuickScanText] = useState('');
  const [quickScanResult, setQuickScanResult] = useState<ThreatAnalysis | null>(null);

  const handleQuickScan = () => {
    if (!quickScanText.trim()) return;
    const analysis = analyzeMessage('User Input', quickScanText);
    setQuickScanResult(analysis);
  };

  const runRakshak = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsRunning(true);
    setResult(null);
    setVisibleSteps([]);

    const context = {
      ...DEFAULT_SCENARIO,
      message_text: inputText,
    };

    // Simulate async agent run with step-by-step reveal
    const agentResult = runAgent(context);

    // Reveal steps one at a time
    for (let i = 0; i < agentResult.trace.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setVisibleSteps(prev => [...prev, agentResult.trace[i]]);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setResult(agentResult);
    setIsRunning(false);
  }, [inputText]);

  const loadScenario = (type: 'default' | 'failure' | 'clear') => {
    if (type === 'clear') {
      setInputText('');
      setActiveScenario(null);
      setResult(null);
      setVisibleSteps([]);
      return;
    }
    const scenario = type === 'default' ? DEFAULT_SCENARIO : FAILURE_SCENARIO;
    setInputText(scenario.message_text);
    setActiveScenario(type);
    setResult(null);
    setVisibleSteps([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      runRakshak();
    }
  };

  const verdict = result ? pickVerdict(result.trace) : null;

  return (
    <section className="min-h-screen pt-18 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--parchment)' }}>
            Live Console
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)', maxWidth: '48ch', margin: '0 auto' }}>
            Paste a payment message or describe your financial situation. Rakshak will screen, project, and compute — then tell you what's true.
          </p>
        </div>

        {/* Quick Scan Section */}
        <div
          className="rounded-[14px] p-5 mb-6"
          style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Quick Scan — Paste any message for instant analysis
          </h3>
          <textarea
            value={quickScanText}
            onChange={(e) => setQuickScanText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                handleQuickScan();
              }
            }}
            placeholder="Paste any SMS, WhatsApp message, or UPI request here..."
            className="w-full rounded-lg p-3 text-sm leading-relaxed resize-none focus:outline-none"
            style={{
              backgroundColor: 'var(--ink-2)',
              border: '1px solid var(--border)',
              color: 'var(--parchment)',
              minHeight: '80px',
            }}
            rows={3}
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleQuickScan}
              disabled={!quickScanText.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ backgroundColor: 'var(--gold)', color: 'var(--ink)' }}
            >
              Analyze Message
            </button>
            {quickScanResult && (
              <button
                onClick={() => { setQuickScanText(''); setQuickScanResult(null); }}
                className="px-3 py-2 rounded-lg text-xs"
                style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick scan result */}
          {quickScanResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg"
              style={{
                backgroundColor: quickScanResult.level === 'HIGH' ? 'rgba(225, 85, 74, 0.08)' :
                                 quickScanResult.level === 'MEDIUM' ? 'rgba(232, 163, 61, 0.08)' :
                                 'rgba(63, 167, 150, 0.08)',
                border: `1px solid ${
                  quickScanResult.level === 'HIGH' ? 'rgba(225, 85, 74, 0.2)' :
                  quickScanResult.level === 'MEDIUM' ? 'rgba(232, 163, 61, 0.2)' :
                  'rgba(63, 167, 150, 0.2)'
                }`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: quickScanResult.level === 'HIGH' ? 'rgba(225, 85, 74, 0.2)' :
                                     quickScanResult.level === 'MEDIUM' ? 'rgba(232, 163, 61, 0.2)' :
                                     'rgba(63, 167, 150, 0.2)',
                    color: quickScanResult.level === 'HIGH' ? 'var(--risk-high)' :
                           quickScanResult.level === 'MEDIUM' ? 'var(--risk-med)' :
                           'var(--safe)',
                  }}
                >
                  {quickScanResult.level}
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--parchment)' }}>
                  {quickScanResult.suggestedAction.en}
                </span>
              </div>
              {quickScanResult.reasons.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {quickScanResult.reasons.map((reason, i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--muted)' }}>
                      <span className="flex-shrink-0">•</span>
                      <span>{reason.en}</span>
                    </li>
                  ))}
                </ul>
              )}
              {quickScanResult.officialRoute && (
                <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'rgba(63, 167, 150, 0.1)' }}>
                  <p className="text-xs" style={{ color: 'var(--safe)' }}>
                    ✓ {quickScanResult.officialRoute.en}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-5">
          {/* ── Input Panel ── */}
          <div
            className="rounded-[14px] p-5 flex flex-col"
            style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              Input
            </h3>

            {/* Scan-frame textarea */}
            <div className={`scan-frame relative rounded-lg ${isRunning ? 'scanning' : ''}`}>
              <div className="scan-frame-corners" />
              <div className="scan-sweep" />
              <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setActiveScenario(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Paste a payment message, describe your financial situation, or load a sample below…"
                className="w-full rounded-lg p-4 text-sm leading-relaxed resize-y focus:outline-none placeholder:text-[var(--muted-2)]"
                style={{
                  backgroundColor: 'var(--ink-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--parchment)',
                  minHeight: '170px',
                  fontFamily: 'Manrope, sans-serif',
                }}
                maxLength={4000}
                aria-label="Scenario text input"
              />
            </div>

            {/* Sample chips */}
            <div className="mt-3">
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Load a sample situation">
                <button
                  onClick={() => loadScenario('default')}
                  className="chip px-3 py-1.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: activeScenario === 'default' ? 'rgba(232, 163, 61, 0.12)' : 'var(--ink-2)',
                    border: `1px solid ${activeScenario === 'default' ? 'rgba(232, 163, 61, 0.3)' : 'var(--border)'}`,
                    color: activeScenario === 'default' ? 'var(--gold)' : 'var(--muted)',
                  }}
                >
                  ⚡ Primary scenario
                </button>
                <button
                  onClick={() => loadScenario('failure')}
                  className="chip px-3 py-1.5 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: activeScenario === 'failure' ? 'rgba(232, 163, 61, 0.12)' : 'var(--ink-2)',
                    border: `1px solid ${activeScenario === 'failure' ? 'rgba(232, 163, 61, 0.3)' : 'var(--border)'}`,
                    color: activeScenario === 'failure' ? 'var(--gold)' : 'var(--muted)',
                  }}
                >
                  🔄 Failure/adaptation
                </button>
                <button
                  onClick={() => loadScenario('clear')}
                  className="chip px-3 py-1.5 rounded-md text-xs font-medium ml-auto"
                  style={{
                    backgroundColor: 'var(--ink-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted-2)',
                  }}
                >
                  Clear
                </button>
              </div>
              {/* Scenario description */}
              {activeScenario && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] mt-2 leading-relaxed"
                  style={{ color: 'var(--muted-2)' }}
                >
                  {activeScenario === 'default'
                    ? 'User receives a fake electricity disconnection message asking them to scan a QR and enter their UPI PIN "to receive a refund." Simultaneously short on cash before rent, considering a 30% instant loan.'
                    : 'Even avoiding the scam loan doesn\'t fully solve the problem — rent and bills outstrip the balance regardless. Exercises the "evaluate → adapt" step: surfaces the remaining gap and reasons about further options.'}
                </motion.p>
              )}
            </div>

            {/* Validation note */}
            <div className="min-h-[20px] mt-2">
              {inputText.length > 3800 && (
                <p className="text-xs" style={{ color: 'var(--risk-high)' }}>
                  Approaching 4000-char limit ({inputText.length}/4000)
                </p>
              )}
            </div>

            {/* Run button */}
            <button
              onClick={runRakshak}
              disabled={isRunning || !inputText.trim()}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--ink)',
              }}
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--ink)]/30 border-t-[var(--ink)] rounded-full animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Run Rakshak
                </>
              )}
            </button>

            {/* Context info */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--muted-2)' }}>
                Financial context (sample data):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--ink-2)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>Balance</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--parchment)' }}>₹8,500</p>
                </div>
                <div className="rounded-lg p-2.5" style={{ backgroundColor: 'var(--ink-2)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--muted-2)' }}>Loan offered</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--parchment)' }}>₹10,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Results Panel ── */}
          <div
            ref={resultsRef}
            className="rounded-[14px] p-5 flex flex-col min-h-[500px]"
            style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Results
            </h3>

            {/* Empty state */}
            {!result && visibleSteps.length === 0 && !isRunning && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--ink-2)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-2)" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="font-display font-medium text-sm" style={{ color: 'var(--muted)' }}>
                  Nothing checked yet
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-2)', maxWidth: '32ch' }}>
                  Paste a message or load a sample, then hit "Run Rakshak" to see the agent trace unfold.
                </p>
              </div>
            )}

            {/* Verdict badge */}
            {verdict && (
              <VerdictBadge verdict={verdict} />
            )}

            {/* Trace stepper */}
            {(visibleSteps.length > 0 || isRunning) && (
              <div className="flex-1 mt-3 overflow-y-auto custom-scrollbar" aria-label="Agent trace">
                <TraceStepper steps={visibleSteps} isRunning={isRunning} />
              </div>
            )}

            {/* Tool data cards */}
            {result && (
              <div className="mt-4 space-y-3">
                {result.trace
                  .filter(t => t.tool && t.result)
                  .map((entry, i) => (
                    <ToolDataCard key={i} entry={entry} />
                  ))}
              </div>
            )}

            {/* Final answer */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--ink-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--gold)' }}>
                  Final Recommendation
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--parchment)' }}>
                  {result.final_answer}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = {
    low_risk: { color: 'var(--safe)', label: 'Low Risk', bg: 'rgba(63, 167, 150, 0.1)' },
    medium_risk: { color: 'var(--risk-med)', label: 'Medium Risk', bg: 'rgba(232, 163, 61, 0.1)' },
    high_risk: { color: 'var(--risk-high)', label: 'High Risk', bg: 'rgba(225, 85, 74, 0.1)' },
  };
  const c = config[verdict];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${verdict === 'high_risk' ? 'risk-pulse' : ''}`}
      style={{ backgroundColor: c.bg, border: `1px solid ${c.color}33`, color: c.color }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
      {c.label}
    </motion.div>
  );
}
