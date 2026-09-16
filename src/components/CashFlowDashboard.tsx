import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseSmsHistory } from '../lib/mockSmsData';

/**
 * Cash Flow Dashboard — shows runway, income vs expenses, and affordability checks.
 */
export default function CashFlowDashboard() {
  const [purchaseQuery, setPurchaseQuery] = useState('');
  const [affordabilityResult, setAffordabilityResult] = useState<string | null>(null);

  const data = parseSmsHistory();
  const runway = data.daysUntilShortfall ?? 0;
  const isWarning = runway < 7;

  const checkAffordability = () => {
    if (!purchaseQuery.trim()) return;

    // Extract EMI amount from query (simple regex)
    const emiMatch = purchaseQuery.match(/(\d+)/);
    const emi = emiMatch ? parseInt(emiMatch[1]) : 0;

    if (emi === 0) {
      setAffordabilityResult('Please include the EMI amount (e.g., "iPhone EMI ₹5000/month")');
      return;
    }

    const newDailySpend = (data.expenses + emi) / 30;
    const newRunway = Math.floor(data.balance / newDailySpend);

    if (newRunway >= 15) {
      setAffordabilityResult(`✅ Yes, you can afford this. It leaves you with ${newRunway} days of buffer.`);
    } else if (newRunway >= 7) {
      setAffordabilityResult(`⚠️ Tight. This leaves you with only ${newRunway} days of buffer. Consider waiting or finding a cheaper option.`);
    } else {
      const shortfall = Math.abs(data.balance - (emi * 2));
      setAffordabilityResult(`❌ No, this will leave you short by ₹${shortfall.toLocaleString()} before month-end. Consider waiting or finding a cheaper option.`);
    }
  };

  return (
    <div
      className="rounded-[14px] p-6"
      style={{ backgroundColor: 'var(--ink-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-lg" style={{ color: 'var(--parchment)' }}>
          💰 Cash Flow Forecast
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted-2)' }}>
          Based on SMS history
        </span>
      </div>

      {/* Runway card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg p-5 mb-5 text-center"
        style={{
          backgroundColor: isWarning ? 'rgba(225, 85, 74, 0.08)' : 'rgba(63, 167, 150, 0.08)',
          border: `1px solid ${isWarning ? 'rgba(225, 85, 74, 0.2)' : 'rgba(63, 167, 150, 0.2)'}`,
        }}
      >
        <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: isWarning ? 'var(--risk-high)' : 'var(--safe)' }}>
          Days of runway remaining
        </p>
        <p className="font-display font-bold text-4xl mb-1" style={{ color: isWarning ? 'var(--risk-high)' : 'var(--safe)' }}>
          {runway}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {isWarning
            ? 'Aapke paise jaldi khatam ho sakte hain'
            : 'Your money should last until next salary'}
        </p>
      </motion.div>

      {/* Income vs Expenses */}
      <div className="mb-5">
        <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-2)' }}>
          This month
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--safe)' }}>Income</span>
              <span className="text-xs font-medium" style={{ color: 'var(--parchment)' }}>₹{data.income.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--ink-2)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--safe)' }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--risk-med)' }}>Expenses</span>
              <span className="text-xs font-medium" style={{ color: 'var(--parchment)' }}>₹{data.expenses.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--ink-2)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(data.expenses / data.income) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--risk-med)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recurring expenses */}
      <div className="mb-5">
        <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-2)' }}>
          Upcoming recurring
        </p>
        <div className="space-y-2">
          {data.recurringExpenses.map((exp, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--ink-2)' }}
            >
              <span className="text-xs" style={{ color: 'var(--parchment)' }}>{exp.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium" style={{ color: 'var(--parchment)' }}>
                  ₹{exp.amount.toLocaleString()}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--muted-2)' }}>
                  Day {exp.day}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning card */}
      {isWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg p-3 mb-5"
          style={{
            backgroundColor: 'rgba(225, 85, 74, 0.08)',
            border: '1px solid rgba(225, 85, 74, 0.2)',
          }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'var(--risk-high)' }}>
            ⚠️ Aapke paise {runway} tareekh tak khatam ho sakte hain. Avoid unnecessary spending.
          </p>
        </motion.div>
      )}

      {/* Affordability check */}
      <div>
        <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-2)' }}>
          Ask about a purchase
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={purchaseQuery}
            onChange={(e) => setPurchaseQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkAffordability()}
            placeholder="e.g., iPhone EMI ₹5000/month"
            className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
            style={{
              backgroundColor: 'var(--ink-2)',
              border: '1px solid var(--border)',
              color: 'var(--parchment)',
            }}
          />
          <button
            onClick={checkAffordability}
            className="px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--gold)', color: 'var(--ink)' }}
          >
            Check
          </button>
        </div>
        {affordabilityResult && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs mt-2 leading-relaxed p-2 rounded"
            style={{ backgroundColor: 'var(--ink-2)', color: 'var(--muted)' }}
          >
            {affordabilityResult}
          </motion.p>
        )}
      </div>
    </div>
  );
}
