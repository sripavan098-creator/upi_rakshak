import { motion } from 'framer-motion';
import { 
  Shield, TrendingDown, Clock, Users, 
  Target, AlertTriangle, CheckCircle, Zap, RefreshCw
} from 'lucide-react';

export default function Impact() {
  const impacts = [
    {
      icon: <Shield className="w-6 h-6 text-red-400" />,
      title: 'Fraud Interrupted at the Moment',
      description: 'The scam explanation arrives before the QR is scanned — not as after-the-fact awareness content. Names the specific phrase that triggered the flag so it\'s checkable, not just assertion.',
      metric: 'Real-time',
      metricLabel: 'intervention',
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-amber-400" />,
      title: 'Predatory Borrowing Made Visible',
      description: 'Converting a marketing rate into an actual rupee total turns an abstract percentage into a comparable, concrete cost — the same framing effect that makes APR disclosure requirements effective.',
      metric: '₹700+',
      metricLabel: 'hidden cost revealed',
    },
    {
      icon: <Clock className="w-6 h-6 text-cyan-400" />,
      title: 'Shortfalls Surfaced Days Early',
      description: 'Cash flow projection exists so the "I didn\'t see it coming" failure mode has a chance to be replaced by a few days\' notice and a real alternative.',
      metric: '3-5 days',
      metricLabel: 'early warning',
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: 'Trusted-Contact Escalation',
      description: 'For first-time/lower-fluency users, protection doesn\'t depend entirely on the primary user catching the pattern themselves — a second person gets a chance to intervene.',
      metric: '2nd line',
      metricLabel: 'of defense',
    },
  ];

  const personas = [
    {
      title: 'Paycheck-to-Paycheck Salaried',
      description: 'Predictable income, but clustered expense dates create real multi-day windows of low balance. Most exposed to instant-loan advertising during those windows.',
      icon: <Target className="w-5 h-5" />,
      color: 'amber',
    },
    {
      title: 'First-Time / Lower-Fluency Users',
      description: 'Often older family members or people newer to smartphones. Most likely to take official-looking messages at face value. Benefit most from plain-language explanations.',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
    },
    {
      title: 'Small Business Owners',
      description: 'Receive many genuine payment requests daily, so tolerance for false positives is much lower. Not deeply addressed by current MVP — noted as an open gap.',
      icon: <Zap className="w-5 h-5" />,
      color: 'cyan',
    },
  ];

  const colorMap: Record<string, string> = {
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  };

  return (
    <section className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Expected Impact
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Mechanisms the design targets, stated as hypotheses to test — not measured outcomes. 
            This is a hackathon proof-of-concept with no live user base yet.
          </p>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {impacts.map((impact, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>{impact.icon}</div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{impact.metric}</p>
                  <p className="text-xs text-slate-500">{impact.metricLabel}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{impact.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{impact.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Target Personas */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Target Personas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personas.map((persona, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`border rounded-2xl p-6 ${colorMap[persona.color]}`}
              >
                <div className="mb-3">{persona.icon}</div>
                <h4 className="font-bold text-white mb-2">{persona.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{persona.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Honesty Note */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Honesty Note</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Validating any of these as <em>actual</em> impact (fraud rate reduction, borrowing rate change) 
                would require a real pilot with real users — explicitly out of scope for this Stage 1 submission, 
                and called out as such rather than implied.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Proof-of-concept demonstrates the mechanism</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">All numbers are deterministic, verifiable</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Full agent trace is auditable</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Limitations explicitly acknowledged</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Scenarios */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Primary Scenario
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              User receives a WhatsApp message claiming electricity disconnection unless they scan a QR 
              and enter UPI PIN "to receive a refund." Simultaneously short on cash before rent, 
              considering a 30% instant loan. Agent flags the scam, confirms shortfall, computes true 
              loan cost, recommends against it, and escalates.
            </p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              Failure/Adaptation Scenario
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Even avoiding the loan doesn't fully solve the problem — rent and bills outstrip the 
              balance regardless. Agent demonstrates the "evaluate → adapt" step honestly: surfaces 
              the remaining gap and reasons about further concrete options, or states plainly what 
              it couldn't resolve.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


