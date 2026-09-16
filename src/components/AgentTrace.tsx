import { motion } from 'framer-motion';
import { Terminal, Eye, Brain, Wrench, CheckCircle, RefreshCw } from 'lucide-react';
import type { AgentStep, SimulationResult } from '../lib/agent';

interface AgentTraceProps {
  steps: AgentStep[];
  result: SimulationResult;
}

export default function AgentTrace({ steps, result }: AgentTraceProps) {
  const phaseIcons: Record<string, React.ReactNode> = {
    'observe': <Eye className="w-4 h-4" />,
    'decide': <Brain className="w-4 h-4" />,
    'act': <Wrench className="w-4 h-4" />,
    'evaluate': <CheckCircle className="w-4 h-4" />,
    'adapt': <RefreshCw className="w-4 h-4" />,
  };

  const phaseColors: Record<string, string> = {
    'observe': 'border-blue-500/30 bg-blue-500/5',
    'decide': 'border-purple-500/30 bg-purple-500/5',
    'act': 'border-emerald-500/30 bg-emerald-500/5',
    'evaluate': 'border-amber-500/30 bg-amber-500/5',
    'adapt': 'border-cyan-500/30 bg-cyan-500/5',
  };

  const phaseTextColors: Record<string, string> = {
    'observe': 'text-blue-400',
    'decide': 'text-purple-400',
    'act': 'text-emerald-400',
    'evaluate': 'text-amber-400',
    'adapt': 'text-cyan-400',
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
        <Terminal className="w-5 h-5 text-emerald-400" />
        Full Agent Trace
        <span className="text-xs text-slate-500 font-normal ml-2">
          (observe → decide → act → evaluate → adapt)
        </span>
      </h3>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border rounded-xl p-4 ${phaseColors[step.phase]}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${phaseTextColors[step.phase]} bg-slate-800/50`}>
                {phaseIcons[step.phase]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase ${phaseTextColors[step.phase]}`}>
                    {step.phase}
                  </span>
                  {step.toolUsed && (
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                      🔧 {step.toolUsed}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-2">
                  {step.description}
                </p>
                {step.output && (
                  <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-xs font-mono text-slate-400">
                    <span className="text-emerald-500">→</span> {step.output}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Final verdict */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-white">Agent Complete</span>
        </div>
        <p className="text-xs text-slate-400">
          {steps.length} steps executed. {result.escalated ? 'Escalated to trusted contact.' : 'No escalation required.'}
          Risk assessment: <span className={`font-bold ${
            result.riskLevel === 'critical' ? 'text-red-400' :
            result.riskLevel === 'high' ? 'text-amber-400' :
            result.riskLevel === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
          }`}>{result.riskLevel.toUpperCase()}</span>
        </p>
      </motion.div>
    </div>
  );
}
