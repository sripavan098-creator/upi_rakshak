import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ScamFlag } from '../lib/agent';

interface ScamFlagsProps {
  flags: ScamFlag[];
}

export default function ScamFlags({ flags }: ScamFlagsProps) {
  const severityConfig = {
    critical: {
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      bg: 'bg-red-500/10 border-red-500/20',
      badge: 'bg-red-500/20 text-red-400',
      label: 'CRITICAL',
    },
    high: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-400',
      label: 'HIGH',
    },
    medium: {
      icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />,
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      badge: 'bg-yellow-500/20 text-yellow-400',
      label: 'MEDIUM',
    },
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-red-400" />
        Scam Detection Results
      </h3>
      
      {flags.length === 0 ? (
        <div className="text-center py-8">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-400 font-medium">No scam patterns detected</p>
          <p className="text-sm text-slate-500 mt-1">Message appears safe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag, i) => {
            const config = severityConfig[flag.severity];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-xl border ${config.bg}`}
              >
                <div className="flex items-start gap-2">
                  {config.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-white font-mono bg-slate-800/50 rounded px-2 py-1 mb-2">
                      "{flag.phrase}"
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {flag.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
