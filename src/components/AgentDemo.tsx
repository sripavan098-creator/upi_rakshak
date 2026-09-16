import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RotateCcw, Eye, Brain, Wrench, CheckCircle, RefreshCw,
  AlertTriangle, Shield, TrendingDown, Calculator, Send,
  ChevronRight, Zap, Clock, IndianRupee
} from 'lucide-react';
import ScamFlags from './ScamFlags';
import CashFlowChart from './CashFlowChart';
import LoanCostBreakdown from './LoanCostBreakdown';
import AgentTrace from './AgentTrace';
import { runAgentSimulation, type AgentStep, type SimulationResult } from '../lib/agent';

const SAMPLE_MESSAGE = `URGENT: Your electricity connection will be disconnected within 24 hours. 
Scan the QR code below and enter your UPI PIN to receive your refund adjustment of ₹2,500. 
Act immediately or your meter will be shut off. Forwarded from BSES Official.`;

const SAMPLE_CONTEXT = {
  currentBalance: 8500,
  upcomingExpenses: [
    { label: 'Rent', amount: 7000, dueIn: 3 },
    { label: 'Phone Recharge', amount: 599, dueIn: 1 },
    { label: 'Electricity Bill', amount: 1200, dueIn: 5 },
  ],
  loanOffer: {
    principal: 10000,
    interestRate: 30,
    processingFee: 500,
    flatFee: 200,
    tenureMonths: 3,
  },
};

export default function AgentDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [message, setMessage] = useState(SAMPLE_MESSAGE);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setSteps([]);
    setResult(null);

    const simResult = runAgentSimulation(message, SAMPLE_CONTEXT);
    
    for (let i = 0; i < simResult.steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSteps(prev => [...prev, simResult.steps[i]]);
      setCurrentStep(i + 1);
    }
    
    setResult(simResult);
    setIsRunning(false);
  }, [message]);

  const reset = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setSteps([]);
    setResult(null);
  };

  const stepIcons: Record<string, React.ReactNode> = {
    'observe': <Eye className="w-4 h-4" />,
    'decide': <Brain className="w-4 h-4" />,
    'act': <Wrench className="w-4 h-4" />,
    'evaluate': <CheckCircle className="w-4 h-4" />,
    'adapt': <RefreshCw className="w-4 h-4" />,
  };

  const stepColors: Record<string, string> = {
    'observe': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'decide': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'act': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'evaluate': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'adapt': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  return (
    <section className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Live Agent Simulation
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Watch the agentic observe → decide → act → evaluate → adapt loop process a real scenario step by step.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Input & Controls */}
          <div className="space-y-6">
            {/* Message Input */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  Input Message
                </h3>
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {showCustomInput ? 'Use Sample' : 'Custom Input'}
                </button>
              </div>
              
              {showCustomInput ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Paste a payment message or describe your financial situation..."
                />
              ) : (
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">W</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">WhatsApp Message</p>
                      <p className="text-red-300 font-medium">{SAMPLE_MESSAGE}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Context Card */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <IndianRupee className="w-5 h-5 text-amber-400" />
                Financial Context
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Current Balance</p>
                  <p className="text-xl font-bold text-white">₹{SAMPLE_CONTEXT.currentBalance.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Loan Offered</p>
                  <p className="text-xl font-bold text-white">₹{SAMPLE_CONTEXT.loanOffer.principal.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-2">Upcoming Expenses</p>
                  <div className="space-y-2">
                    {SAMPLE_CONTEXT.upcomingExpenses.map((exp, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-3 py-2">
                        <span className="text-sm text-slate-300">{exp.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white">₹{exp.amount.toLocaleString()}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exp.dueIn}d
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                {isRunning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Agent
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Agent Trace & Results */}
          <div className="space-y-6">
            {/* Agent Loop Visualization */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                Agent Reasoning Loop
              </h3>
              
              {/* Step indicators */}
              <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {['observe', 'decide', 'act', 'evaluate', 'adapt'].map((phase, i) => (
                  <div key={phase} className="flex items-center">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
                      currentStep > i 
                        ? stepColors[phase]
                        : 'text-slate-600 bg-slate-800/30 border-slate-700/50'
                    }`}>
                      {stepIcons[phase]}
                      <span className="capitalize">{phase}</span>
                    </div>
                    {i < 4 && <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5" />}
                  </div>
                ))}
              </div>

              {/* Step details */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-3 rounded-xl border ${stepColors[step.phase]} bg-opacity-50`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="capitalize text-xs font-bold opacity-80 min-w-[60px]">
                          {step.phase}
                        </span>
                        <p className="text-sm text-slate-300">{step.description}</p>
                      </div>
                      {step.toolUsed && (
                        <div className="mt-2 ml-[68px] text-xs text-slate-500 bg-slate-800/50 rounded-lg px-2 py-1 inline-block">
                          🔧 {step.toolUsed}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Final Recommendation */}
                  <div className={`p-4 rounded-2xl border ${
                    result.riskLevel === 'critical' 
                      ? 'bg-red-500/5 border-red-500/20' 
                      : result.riskLevel === 'high'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={`w-5 h-5 ${
                        result.riskLevel === 'critical' ? 'text-red-400' :
                        result.riskLevel === 'high' ? 'text-amber-400' : 'text-emerald-400'
                      }`} />
                      <span className={`font-bold ${
                        result.riskLevel === 'critical' ? 'text-red-400' :
                        result.riskLevel === 'high' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        Risk Level: {result.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{result.recommendation}</p>
                    {result.escalated && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-4 h-4" />
                        Escalated to trusted contact for additional safety
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Panels - Full Width */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10"
            >
              <ScamFlags flags={result.scamFlags} />
              <CashFlowChart data={result.cashFlowData} />
              <LoanCostBreakdown loanResult={result.loanResult} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Trace Detail */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <AgentTrace steps={steps} result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
