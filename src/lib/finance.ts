/**
 * UPI Rakshak — Finance Calculations
 *
 * Deterministic, dependency-free math shared by the loan receipt,
 * the cash-flow ruler, and the agent simulation.
 * Every number is computed; nothing is generated.
 */

export interface LoanTerms {
  principal: number;
  /** Nominal annual interest rate as a percentage, e.g. 36 for 36% p.a. */
  annualInterestRate: number;
  tenureMonths: number;
  /** One-off processing fee in rupees. */
  processingFee: number;
  /** Any additional flat charges in rupees. */
  flatFee: number;
}

export interface LoanCost {
  /** Monthly instalment, rounded to the nearest rupee. */
  emi: number;
  /** Total principal + interest paid across the tenure, excluding fees. */
  totalRepayment: number;
  totalInterest: number;
  totalFees: number;
  /** Everything paid above the principal: interest + fees. */
  totalCost: number;
  /** Annualised cost as a percentage of principal. */
  effectiveAnnualRate: number;
}

/**
 * Amortising loan maths: EMI = P·r·(1+r)^n / ((1+r)^n − 1)
 */
export function computeLoanCost(terms: LoanTerms): LoanCost {
  const { principal, annualInterestRate, tenureMonths, processingFee, flatFee } = terms;

  const monthlyRate = annualInterestRate / 100 / 12;
  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalRepayment = emi * tenureMonths;
  const totalInterest = totalRepayment - principal;
  const totalFees = processingFee + flatFee;
  const totalCost = totalInterest + totalFees;
  const effectiveAnnualRate = (totalCost / principal) * (12 / tenureMonths) * 100;

  return {
    emi: Math.round(emi),
    totalRepayment: Math.round(totalRepayment),
    totalInterest: Math.round(totalInterest),
    totalFees,
    totalCost: Math.round(totalCost),
    effectiveAnnualRate: Math.round(effectiveAnnualRate * 10) / 10,
  };
}

export interface CashFlowInput {
  currentBalance: number;
  monthlyIncome: number;
  monthlyOutflow: number;
  daysInMonth: number;
}

/**
 * Days of runway before available funds are exhausted.
 * Returns the full month when there is no outflow to divide by.
 */
export function computeRunwayDays({
  currentBalance,
  monthlyIncome,
  monthlyOutflow,
  daysInMonth,
}: CashFlowInput): number {
  const availableFunds = currentBalance + monthlyIncome;
  if (monthlyOutflow <= 0) return daysInMonth;
  return Math.floor((availableFunds / monthlyOutflow) * daysInMonth);
}

export type RunwayBand = 'safe' | 'warning' | 'danger';

export function runwayBand(runwayDays: number): RunwayBand {
  if (runwayDays < 10) return 'danger';
  if (runwayDays < 15) return 'warning';
  return 'safe';
}
