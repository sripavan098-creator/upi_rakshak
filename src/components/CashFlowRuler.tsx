import { useState } from 'react';
import SectionHeader from './SectionHeader';
import { motion } from 'framer-motion';
import { computeRunwayDays, runwayBand, type RunwayBand } from '../lib/finance';

/**
 * Cash Flow Ruler — Physical Ruler Visualization
 * 
 * Not a Recharts area chart. Days as measured length, bills as notches,
 * a hatched cut-off you can drag by adding a hypothetical EMI and watch collapse.
 */

interface Bill {
  day: number;
  label: string;
  amount: number;
  type: 'rent' | 'emi' | 'utility' | 'other';
}

const SAMPLE_BILLS: Bill[] = [
  { day: 5, label: 'Rent', amount: 12000, type: 'rent' },
  { day: 10, label: 'Electricity', amount: 2400, type: 'utility' },
  { day: 15, label: 'EMI', amount: 4500, type: 'emi' },
  { day: 20, label: 'Mobile', amount: 599, type: 'other' },
  { day: 25, label: 'Internet', amount: 999, type: 'other' },
];

const SALARY = 35000;
const CURRENT_BALANCE = 8500;
const DAYS_IN_MONTH = 30;

/**
 * The sample data starts at a 63-day runway, so the EMI has to push monthly
 * outflow above ~₹87k (warning) and ~₹130k (danger) to reach those bands.
 * The original ₹15k cap could never leave the safe band.
 */
const MAX_HYPOTHETICAL_EMI = 150000;
const EMI_STEP = 5000;

export default function CashFlowRuler() {
  const [hypotheticalEMI, setHypotheticalEMI] = useState(0);

  const totalBills = SAMPLE_BILLS.reduce((sum, bill) => sum + bill.amount, 0);
  const totalWithHypothetical = totalBills + hypotheticalEMI;

  const runway = computeRunwayDays({
    currentBalance: CURRENT_BALANCE,
    monthlyIncome: SALARY,
    monthlyOutflow: totalWithHypothetical,
    daysInMonth: DAYS_IN_MONTH,
  });
  const runwayPercentage = (runway / DAYS_IN_MONTH) * 100;

  const band: RunwayBand = runwayBand(runway);
  const bandColor = {
    danger: 'var(--danger-text)',
    warning: '#A34F08',
    safe: 'var(--safe-text)',
  }[band];
  const isDanger = band === 'danger';
  const isWarning = band === 'warning';

  return (
    <section className="bg-[var(--paper)] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Cash Flow Forecast"
          description="Your money, visualized as a physical ruler."
        />

        {/* The Ruler */}
        <div className="relative mb-16">
          {/* Ruler base */}
          <div className="relative h-20 bg-[var(--paper-dark)] border-2 border-[var(--ink)]">
            {/* Day markers */}
            {Array.from({ length: 31 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-l border-[var(--ink)]"
                style={{ left: `${(i / 30) * 100}%` }}
              >
                {i % 5 === 0 && (
                  <span
                    className="absolute -bottom-6 left-0 text-xs font-mono text-[var(--ink-light)]"
                    style={{ fontFamily: 'var(--font-machine)' }}
                  >
                    Day {i}
                  </span>
                )}
              </div>
            ))}

            {/* Bill notches */}
            {SAMPLE_BILLS.map((bill, i) => (
              <motion.div
                key={i}
                className="absolute top-0 bottom-0 w-1 bg-[var(--ink)]"
                style={{ left: `${(bill.day / 30) * 100}%` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-[var(--ink)] text-[var(--paper)] px-2 py-1 text-xs font-signage">
                    {bill.label}
                  </div>
                  <div
                    className="text-xs font-mono text-center mt-1"
                    style={{ fontFamily: 'var(--font-machine)' }}
                  >
                    ₹{bill.amount.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Runway indicator */}
            <motion.div
              className="absolute top-0 bottom-0 border-r-4"
              style={{
                width: `${runwayPercentage}%`,
                borderColor: bandColor,
                background: isDanger
                  ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(194, 36, 27, 0.1) 10px, rgba(194, 36, 27, 0.1) 20px)'
                  : 'transparent',
              }}
              initial={{ width: 0 }}
              whileInView={{ width: `${runwayPercentage}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 right-2 font-signage font-bold text-lg"
                style={{ color: bandColor }}
              >
                {runway} days
              </div>
            </motion.div>
          </div>

          {/* Ruler labels */}
          <div className="flex justify-between mt-8 text-sm text-[var(--ink-light)]">
            <span>Today</span>
            <span>Payday</span>
            <span>Month End</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[var(--paper)] border-2 border-[var(--ink)] p-6">
            <p className="text-sm text-[var(--ink-light)] mb-1">Monthly Income</p>
            <p className="font-signage font-bold text-3xl text-[var(--bbps-green)]">
              ₹{SALARY.toLocaleString()}
            </p>
          </div>
          <div className="bg-[var(--paper)] border-2 border-[var(--ink)] p-6">
            <p className="text-sm text-[var(--ink-light)] mb-1">Total Bills</p>
            <p className="font-signage font-bold text-3xl text-[var(--ink)]">
              ₹{totalBills.toLocaleString()}
            </p>
          </div>
          <div className="bg-[var(--paper)] border-2 border-[var(--ink)] p-6">
            <p className="text-sm text-[var(--ink-light)] mb-1">Runway</p>
            <p
              className="font-signage font-bold text-3xl"
              style={{ color: bandColor }}
            >
              {runway} days
            </p>
          </div>
        </div>

        {/* Hypothetical EMI slider */}
        <div className="bg-[var(--paper-dark)] border-2 border-[var(--ink)] p-6">
          <h3 className="font-signage font-bold text-xl text-[var(--ink)] mb-4">
            What if you take a loan?
          </h3>
          <p className="text-[var(--ink-light)] mb-6">
            Drag the slider to add a hypothetical EMI and watch your runway collapse.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="hypothetical-emi" className="text-sm font-signage text-[var(--ink)] min-w-[100px]">
                Monthly EMI:
              </label>
              <input
                id="hypothetical-emi"
                type="range"
                min="0"
                max={MAX_HYPOTHETICAL_EMI}
                step={EMI_STEP}
                value={hypotheticalEMI}
                onChange={(e) => setHypotheticalEMI(Number(e.target.value))}
                aria-valuetext={hypotheticalEMI > 0 ? `₹${hypotheticalEMI.toLocaleString()} monthly EMI` : 'No extra EMI'}
                className="flex-1 h-2 bg-[var(--ink)] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--bbps-green) 0%, var(--bbps-green) ${(hypotheticalEMI / MAX_HYPOTHETICAL_EMI) * 100}%, var(--ink) ${(hypotheticalEMI / MAX_HYPOTHETICAL_EMI) * 100}%, var(--ink) 100%)`,
                }}
              />
              <span
                className="font-mono text-lg font-bold min-w-[100px] text-right"
                style={{ fontFamily: 'var(--font-machine)' }}
              >
                ₹{hypotheticalEMI.toLocaleString()}
              </span>
            </div>

            {hypotheticalEMI > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border-2 ${
                  isDanger
                    ? 'bg-red-50 border-[var(--stamp-red)]'
                    : isWarning
                    ? 'bg-yellow-50 border-[var(--warning)]'
                    : 'bg-green-50 border-[var(--bbps-green)]'
                }`}
              >
                <p className="font-signage font-bold text-lg mb-2">
                  {isDanger ? '⚠️ Danger Zone' : isWarning ? '⚡ Tight Budget' : '✓ Manageable'}
                </p>
                <p className="text-sm text-[var(--ink)]">
                  {isDanger
                    ? `With ₹${hypotheticalEMI.toLocaleString()} EMI, you'll run out of money in ${runway} days. Consider waiting or finding a cheaper option.`
                    : isWarning
                    ? `With ₹${hypotheticalEMI.toLocaleString()} EMI, you'll have ${runway} days of runway. Tight but manageable.`
                    : `With ₹${hypotheticalEMI.toLocaleString()} EMI, you'll have ${runway} days of runway. Comfortable buffer.`}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bill breakdown */}
        <div className="mt-12">
          <h3 className="font-signage font-bold text-xl text-[var(--ink)] mb-6">
            Your Monthly Bills
          </h3>
          <div className="space-y-2">
            {SAMPLE_BILLS.map((bill, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-[var(--ink)]/20"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="font-mono text-sm text-[var(--ink-light)]"
                    style={{ fontFamily: 'var(--font-machine)' }}
                  >
                    Day {bill.day}
                  </span>
                  <span className="font-signage font-medium text-[var(--ink)]">
                    {bill.label}
                  </span>
                </div>
                <span
                  className="font-mono text-lg font-bold text-[var(--ink)]"
                  style={{ fontFamily: 'var(--font-machine)' }}
                >
                  ₹{bill.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
