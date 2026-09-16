import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, Calculator, ArrowRight } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
}

export default function Hero({ onExplore }: HeroProps) {
  return (
    <section className="min-h-screen flex flex-col justify-center relative pt-16">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
          >
            <Shield className="w-4 h-4" />
            Agentic AI Hackathon — Stage 1 Submission
          </motion.div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Your Financial
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Safety Guardian
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            UPI Rakshak sits between you and the moment of decision — scanning a QR, 
            taking a loan — and tells you, with real numbers, what's actually true.
            Not after the fact. <span className="text-white font-medium">Right then.</span>
          </p>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
          >
            See It In Action
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          <FeatureCard
            icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
            title="Scam Detection"
            description="Screens payment messages for UPI fraud patterns — names the exact phrase that triggered each flag."
            color="red"
          />
          <FeatureCard
            icon={<TrendingDown className="w-6 h-6 text-amber-400" />}
            title="Cash Flow Projection"
            description="Surfaces shortfalls days before they happen — not after a payment bounces."
            color="amber"
          />
          <FeatureCard
            icon={<Calculator className="w-6 h-6 text-cyan-400" />}
            title="True Loan Cost"
            description="Converts marketing rates into actual rupee totals — principal + interest + all fees."
            color="cyan"
          />
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const borderColors: Record<string, string> = {
    red: 'border-red-500/20 hover:border-red-500/40',
    amber: 'border-amber-500/20 hover:border-amber-500/40',
    cyan: 'border-cyan-500/20 hover:border-cyan-500/40',
  };

  const bgColors: Record<string, string> = {
    red: 'bg-red-500/5',
    amber: 'bg-amber-500/5',
    cyan: 'bg-cyan-500/5',
  };

  return (
    <div className={`p-6 rounded-2xl border ${borderColors[color]} ${bgColors[color]} backdrop-blur-sm transition-all duration-300`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
