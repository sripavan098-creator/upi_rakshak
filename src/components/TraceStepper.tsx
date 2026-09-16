import { motion } from 'framer-motion';
import type { TraceEntry } from '../lib/agent';

interface TraceStepperProps {
  steps: TraceEntry[];
  isRunning: boolean;
}

const phaseLabels: Record<string, string> = {
  observe: 'Observe',
  decide: 'Decide',
  decide_final: 'Finalize',
  act: 'Act',
  act_failure: 'Tool Failed',
  evaluate: 'Evaluate',
  adapt: 'Adapt',
};

export default function TraceStepper({ steps, isRunning }: TraceStepperProps) {
  return (
    <ol className="space-y-3">
      {steps.map((step, i) => (
        <motion.li
          key={i}
          data-phase={step.phase}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="trace-step"
        >
          <div className="trace-step__dot" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[10px] font-display font-bold uppercase tracking-wider"
                style={{
                  color: step.phase === 'act' && step.tool
                    ? 'var(--safe)'
                    : step.phase === 'observe' ? '#60A5FA'
                    : step.phase === 'decide' || step.phase === 'decide_final' ? '#A78BFA'
                    : step.phase === 'evaluate' ? 'var(--gold)'
                    : step.phase === 'adapt' ? '#22D3EE'
                    : step.phase === 'act_failure' ? 'var(--risk-high)'
                    : 'var(--muted)',
                }}
              >
                {phaseLabels[step.phase] || step.phase}
              </span>
              {step.tool && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted-2)' }}
                >
                  {step.tool}
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {step.detail}
            </p>
          </div>
        </motion.li>
      ))}

      {/* Running indicator */}
      {isRunning && (
        <li className="trace-step" data-phase="decide">
          <div className="trace-step__dot" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-2)' }}>
              Agent is thinking…
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}
