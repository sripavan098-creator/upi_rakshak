import { motion } from 'framer-motion';

/**
 * Loan Receipt — Itemized Fee Breakdown
 * 
 * Not "45% effective APR" — that means nothing to most users.
 * "₹1,450 out of your account" — that means everything.
 * 
 * The loan comparison is a receipt with every fee itemised.
 */

interface LoanOption {
  name: string;
  principal: number;
  interestRate: number;
  tenureMonths: number;
  processingFee: number;
  flatFee: number;
}

const LOAN_OPTIONS: LoanOption[] = [
  {
    name: 'Instant Loan App',
    principal: 10000,
    interestRate: 36,
    tenureMonths: 3,
    processingFee: 500,
    flatFee: 200,
  },
  {
    name: 'Bank Personal Loan',
    principal: 10000,
    interestRate: 14,
    tenureMonths: 12,
    processingFee: 200,
    flatFee: 0,
  },
  {
    name: 'Credit Card EMI',
    principal: 10000,
    interestRate: 42,
    tenureMonths: 6,
    processingFee: 0,
    flatFee: 199,
  },
];

function calculateLoanCost(loan: LoanOption) {
  const monthlyRate = loan.interestRate / 100 / 12;
  const emi =
    (loan.principal * monthlyRate * Math.pow(1 + monthlyRate, loan.tenureMonths)) /
    (Math.pow(1 + monthlyRate, loan.tenureMonths) - 1);
  
  const totalRepayment = emi * loan.tenureMonths;
  const totalInterest = totalRepayment - loan.principal;
  const totalFees = loan.processingFee + loan.flatFee;
  const totalCost = totalInterest + totalFees;
  const effectiveRate = (totalCost / loan.principal) * (12 / loan.tenureMonths) * 100;

  return {
    emi: Math.round(emi),
    totalRepayment: Math.round(totalRepayment),
    totalInterest: Math.round(totalInterest),
    totalFees,
    totalCost: Math.round(totalCost),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
  };
}

export default function LoanReceipt() {
  return (
    <section className="bg-[var(--paper)] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-signage font-bold text-4xl text-[var(--ink)] mb-2">
            Loan Comparison
          </h2>
          <p className="text-[var(--ink-light)] text-lg">
            Not "45% effective APR" — that means nothing. "₹1,450 out of your account" — that means everything.
          </p>
        </div>

        {/* Three receipts side by side */}
        <div className="grid md:grid-cols-3 gap-6">
          {LOAN_OPTIONS.map((loan, index) => {
            const cost = calculateLoanCost(loan);
            const isExpensive = cost.effectiveRate > 30;
            const isModerate = cost.effectiveRate >= 15 && cost.effectiveRate <= 30;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Receipt */}
                <div
                  className={`bg-white border-2 p-6 ${
                    isExpensive
                      ? 'border-[var(--stamp-red)]'
                      : isModerate
                      ? 'border-[var(--warning)]'
                      : 'border-[var(--bbps-green)]'
                  }`}
                >
                  {/* Receipt header */}
                  <div className="border-b-2 border-dashed border-[var(--ink)] pb-4 mb-4">
                    <h3 className="font-signage font-bold text-xl text-[var(--ink)] mb-1">
                      {loan.name}
                    </h3>
                    <p
                      className="font-mono text-xs text-[var(--ink-light)]"
                      style={{ fontFamily: 'var(--font-machine)' }}
                    >
                      LOAN AGREEMENT • {loan.tenureMonths} MONTHS
                    </p>
                  </div>

                  {/* Principal */}
                  <div className="receipt-line">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[var(--ink-light)]">Principal</span>
                      <span
                        className="font-mono text-lg font-bold text-[var(--ink)]"
                        style={{ fontFamily: 'var(--font-machine)' }}
                      >
                        ₹{loan.principal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Interest */}
                  <div className="receipt-line">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[var(--ink-light)]">
                        Interest ({loan.interestRate}% p.a.)
                      </span>
                      <span
                        className="font-mono text-lg text-[var(--ink)]"
                        style={{ fontFamily: 'var(--font-machine)' }}
                      >
                        ₹{cost.totalInterest.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Processing fee */}
                  {loan.processingFee > 0 && (
                    <div className="receipt-line">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[var(--ink-light)]">Processing Fee</span>
                        <span
                          className="font-mono text-lg text-[var(--ink)]"
                          style={{ fontFamily: 'var(--font-machine)' }}
                        >
                          ₹{loan.processingFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Flat fee */}
                  {loan.flatFee > 0 && (
                    <div className="receipt-line">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[var(--ink-light)]">Flat Fee</span>
                        <span
                          className="font-mono text-lg text-[var(--ink)]"
                          style={{ fontFamily: 'var(--font-machine)' }}
                        >
                          ₹{loan.flatFee.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Total cost */}
                  <div className="border-t-2 border-[var(--ink)] pt-4 mt-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-signage font-bold text-[var(--ink)]">
                        Total Extra Cost
                      </span>
                      <span
                        className={`font-mono text-2xl font-bold ${
                          isExpensive
                            ? 'text-[var(--stamp-red)]'
                            : isModerate
                            ? 'text-[var(--warning)]'
                            : 'text-[var(--bbps-green)]'
                        }`}
                        style={{ fontFamily: 'var(--font-machine)' }}
                      >
                        ₹{cost.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-[var(--ink-light)]">
                        Effective Rate
                      </span>
                      <span
                        className={`font-mono text-sm font-bold ${
                          isExpensive
                            ? 'text-[var(--stamp-red)]'
                            : isModerate
                            ? 'text-[var(--warning)]'
                            : 'text-[var(--bbps-green)]'
                        }`}
                        style={{ fontFamily: 'var(--font-machine)' }}
                      >
                        {cost.effectiveRate}% p.a.
                      </span>
                    </div>
                  </div>

                  {/* Total repayment */}
                  <div className="border-t-2 border-dashed border-[var(--ink)] pt-4 mt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-signage font-bold text-lg text-[var(--ink)]">
                        Total Repayment
                      </span>
                      <span
                        className="font-mono text-2xl font-bold text-[var(--ink)]"
                        style={{ fontFamily: 'var(--font-machine)' }}
                      >
                        ₹{cost.totalRepayment.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Verdict stamp */}
                  {isExpensive && (
                    <motion.div
                      initial={{ scale: 1.5, opacity: 0, rotate: -12 }}
                      whileInView={{ scale: 1, opacity: 1, rotate: -12 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="absolute top-4 right-4 bg-[var(--stamp-red)] text-white px-4 py-2 font-signage font-bold text-sm uppercase tracking-wider"
                      style={{ boxShadow: 'var(--shadow-stamp)' }}
                    >
                      Predatory
                    </motion.div>
                  )}
                </div>

                {/* Monthly EMI */}
                <div className="mt-4 bg-[var(--paper-dark)] border-2 border-[var(--ink)] p-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-[var(--ink-light)]">Monthly EMI</span>
                    <span
                      className="font-mono text-xl font-bold text-[var(--ink)]"
                      style={{ fontFamily: 'var(--font-machine)' }}
                    >
                      ₹{cost.emi.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-[var(--paper-dark)] border-2 border-[var(--ink)] p-8"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="font-signage font-bold text-xl text-[var(--ink)] mb-2">
                The Truth About "Instant Loans"
              </h3>
              <p className="text-[var(--ink)] leading-relaxed mb-4">
                A ₹10,000 instant loan at 36% APR costs you <strong>₹1,450 extra</strong> in just 3 months. 
                That's <strong>14.5% of your principal</strong> gone in fees and interest.
              </p>
              <p className="text-[var(--ink)] leading-relaxed">
                The bank personal loan at 14% APR costs only <strong>₹800 extra</strong> over 12 months — 
                less than half the cost, even though it's for a longer period.
              </p>
              <p className="text-[var(--ink)] leading-relaxed mt-4 font-signage font-bold">
                Always compare the total cost, not just the EMI.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 bg-[var(--stamp-red)] text-white p-6"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h3 className="font-signage font-bold text-xl mb-2">
                Illegal Loan Apps
              </h3>
              <p className="leading-relaxed">
                Many instant loan apps on the Play Store are illegal. They request access to your contacts, 
                photos, and call logs. When you miss a payment, they harass your contacts with morphed photos 
                and threatening messages. <strong>Only use RBI-registered lenders.</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
