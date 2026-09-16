import { motion } from 'framer-motion';
import { Calculator, AlertTriangle } from 'lucide-react';
import type { LoanResult } from '../lib/agent';

interface LoanCostBreakdownProps {
  loanResult: LoanResult;
}

export default function LoanCostBreakdown({ loanResult }: LoanCostBreakdownProps) {
  const { principal, interest, processingFee, flatFee, totalCost, effectiveRate, emi } = loanResult;
  
  if (principal === 0) return null;

  const totalRepayment = principal + totalCost;
  const costPercentage = (totalCost / principal) * 100;

  const breakdownItems = [
    { label: 'Principal', value: principal, color: 'text-white' },
    { label: 'Interest', value: interest, color: 'text-amber-400' },
    { label: 'Processing Fee', value: processingFee, color: 'text-orange-400' },
    { label: 'Flat Fee', value: flatFee, color: 'text-red-400' },
  ];

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-cyan-400" />
        True Loan Cost
      </h3>

      {/* Effective rate callout */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-500/20 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">Hidden Cost Revealed</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{effectiveRate}%</span>
          <span className="text-sm text-slate-400">effective annual rate</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Headline said 30%, but fees push it to {effectiveRate}%
        </p>
      </motion.div>

      {/* Cost breakdown */}
      <div className="space-y-2 mb-4">
        {breakdownItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{item.label}</span>
            <span className={`text-sm font-medium ${item.color}`}>
              ₹{item.value.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-slate-700 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Total Extra Cost</span>
            <span className="text-sm font-bold text-red-400">₹{totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Principal</span>
          <span>+{costPercentage.toFixed(1)}% extra</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 rounded-l-full"
            style={{ width: `${(principal / totalRepayment) * 100}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-r-full"
            style={{ width: `${(totalCost / totalRepayment) * 100}%` }}
          />
        </div>
      </div>

      {/* EMI */}
      <div className="bg-slate-800/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Monthly EMI</span>
          <span className="text-lg font-bold text-white">₹{emi.toLocaleString()}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Total repayment: ₹{totalRepayment.toLocaleString()} over 3 months
        </p>
      </div>
    </div>
  );
}
