import { describe, expect, it } from 'vitest';
import { computeLoanCost, computeRunwayDays, runwayBand, type LoanTerms } from './finance';

const INSTANT_LOAN: LoanTerms = {
  principal: 10000,
  annualInterestRate: 36,
  tenureMonths: 3,
  processingFee: 700,
  flatFee: 0,
};

const BANK_LOAN: LoanTerms = {
  principal: 10000,
  annualInterestRate: 14,
  tenureMonths: 12,
  processingFee: 200,
  flatFee: 0,
};

describe('computeLoanCost', () => {
  it('amortises the instant-loan terms to the figures shown on the receipt', () => {
    const cost = computeLoanCost(INSTANT_LOAN);

    expect(cost.emi).toBe(3535);
    expect(cost.totalInterest).toBe(606);
    expect(cost.totalFees).toBe(700);
    expect(cost.totalCost).toBe(1306);
    expect(cost.effectiveAnnualRate).toBe(52.2);
  });

  it('prices the bank loan as cheaper in absolute terms than the instant loan', () => {
    const instant = computeLoanCost(INSTANT_LOAN);
    const bank = computeLoanCost(BANK_LOAN);

    expect(bank.emi).toBe(898);
    expect(bank.totalCost).toBe(974);
    expect(bank.totalCost).toBeLessThan(instant.totalCost);
  });

  it('charges no interest when the rate is zero', () => {
    const cost = computeLoanCost({
      principal: 12000,
      annualInterestRate: 0,
      tenureMonths: 12,
      processingFee: 0,
      flatFee: 0,
    });

    expect(cost.emi).toBe(1000);
    expect(cost.totalInterest).toBe(0);
    expect(cost.totalCost).toBe(0);
  });

  it('counts every fee toward the total cost above principal', () => {
    const cost = computeLoanCost({
      principal: 5000,
      annualInterestRate: 12,
      tenureMonths: 6,
      processingFee: 150,
      flatFee: 50,
    });

    expect(cost.totalFees).toBe(200);
    expect(cost.totalCost).toBe(cost.totalInterest + 200);
    expect(cost.totalRepayment).toBeGreaterThan(5000);
    // Rounding drift between the displayed EMI and the exact repayment stays
    // within one rupee per instalment.
    expect(Math.abs(cost.totalRepayment - cost.emi * 6)).toBeLessThanOrEqual(6);
  });

  it('never reports a negative cost for a valid loan', () => {
    const cost = computeLoanCost(INSTANT_LOAN);
    expect(cost.totalCost).toBeGreaterThan(0);
    expect(cost.effectiveAnnualRate).toBeGreaterThan(0);
  });
});

describe('computeRunwayDays', () => {
  it('extends the runway when income rises', () => {
    const base = computeRunwayDays({
      currentBalance: 5000,
      monthlyIncome: 30000,
      monthlyOutflow: 30000,
      daysInMonth: 30,
    });
    const richer = computeRunwayDays({
      currentBalance: 5000,
      monthlyIncome: 60000,
      monthlyOutflow: 30000,
      daysInMonth: 30,
    });

    expect(richer).toBeGreaterThan(base);
  });

  it('shortens the runway as outflow grows', () => {
    const base = computeRunwayDays({
      currentBalance: 5000,
      monthlyIncome: 30000,
      monthlyOutflow: 30000,
      daysInMonth: 30,
    });
    const squeezed = computeRunwayDays({
      currentBalance: 5000,
      monthlyIncome: 30000,
      monthlyOutflow: 45000,
      daysInMonth: 30,
    });

    expect(squeezed).toBeLessThan(base);
  });

  it('returns the whole month when there is no outflow to divide by', () => {
    expect(
      computeRunwayDays({
        currentBalance: 0,
        monthlyIncome: 0,
        monthlyOutflow: 0,
        daysInMonth: 31,
      }),
    ).toBe(31);
  });

  it('floors a zero runway when funds cannot cover any day', () => {
    expect(
      computeRunwayDays({
        currentBalance: 0,
        monthlyIncome: 0,
        monthlyOutflow: 1000,
        daysInMonth: 30,
      }),
    ).toBe(0);
  });
});

describe('runwayBand', () => {
  it('classifies under ten days as danger', () => {
    expect(runwayBand(0)).toBe('danger');
    expect(runwayBand(9)).toBe('danger');
  });

  it('classifies ten to fourteen days as warning', () => {
    expect(runwayBand(10)).toBe('warning');
    expect(runwayBand(14)).toBe('warning');
  });

  it('classifies fifteen days or more as safe', () => {
    expect(runwayBand(15)).toBe('safe');
    expect(runwayBand(30)).toBe('safe');
  });

  it('agrees with the danger flag the ruler renders', () => {
    const runway = computeRunwayDays({
      currentBalance: 0,
      monthlyIncome: 0,
      monthlyOutflow: 5000,
      daysInMonth: 30,
    });

    expect(runway).toBe(0);
    expect(runwayBand(runway)).toBe('danger');
  });
});
