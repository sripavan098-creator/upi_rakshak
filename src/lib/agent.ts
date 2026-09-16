/**
 * UPI Rakshak — Agent Simulation
 * 
 * Mirrors the real system: observe → decide → act loop (max 8 turns)
 * with 5 deterministic tools. All numbers computed, never generated.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium';
export type Verdict = 'low_risk' | 'medium_risk' | 'high_risk';
export type Phase = 'observe' | 'decide' | 'act' | 'act_failure' | 'decide_final' | 'evaluate' | 'adapt';

export interface ScamFlag {
  phrase: string;
  severity: Severity;
  explanation: string;
}

export interface AnalyzeMessageResult {
  flags: ScamFlag[];
  verdict: Verdict;
  score: number;
}

export interface CashFlowEntry {
  label: string;
  amount: number;
  days_from_now: number;
  balance_after: number;
}

export interface ForecastResult {
  timeline: CashFlowEntry[];
  goes_negative: boolean;
  days_until_negative: number | null;
  final_balance: number;
  current_balance: number;
  days_to_income: number;
}

export interface LoanResult {
  principal: number;
  emi: number;
  total_repayment: number;
  total_interest: number;
  processing_fee: number;
  flat_fees: number;
  extra_cost_over_principal: number;
  effective_annual_rate: number;
}

export interface EscalationResult {
  escalated: boolean;
  message: string | null;
  risk_verdict: Verdict;
}

export interface AlternativeResult {
  safe_channel: string;
  explanation: string;
}

export interface TraceEntry {
  phase: Phase;
  detail: string;
  tool: string | null;
  result: AnalyzeMessageResult | ForecastResult | LoanResult | EscalationResult | AlternativeResult | null;
}

export interface AgentResult {
  final_answer: string;
  trace: TraceEntry[];
  verdict: Verdict | null;
}

export interface ScenarioContext {
  message_text: string;
  current_balance: number;
  upcoming_expenses: { label: string; amount: number; days_from_now: number }[];
  days_to_next_income: number;
  loan: {
    principal: number;
    annual_interest_rate_pct: number;
    tenure_months: number;
    processing_fee_pct: number;
    other_flat_fees: number;
  } | null;
}

// ─── Scam pattern lists (deterministic) ──────────────────────────────────────

const RECEIVE_MONEY_SCAM_MARKERS = [
  { pattern: /enter.*(?:upi\s*)?pin.*(?:receiv|accept|claim|refund|collect)/i, severity: 'critical' as Severity, explanation: 'You NEVER need to enter your UPI PIN to RECEIVE money. A PIN is only required when SENDING. Any message asking for a PIN to "receive" or "accept" a payment is a scam.' },
  { pattern: /scan.*qr.*(?:receiv|accept|claim|refund|collect)/i, severity: 'critical' as Severity, explanation: 'Scanning a QR code sends money FROM your account. You cannot receive money by scanning a QR code. This is the most common UPI scam pattern.' },
  { pattern: /(?:receiv|collect|accept).*money.*(?:enter|type|input).*pin/i, severity: 'critical' as Severity, explanation: 'Receiving money never requires entering a PIN. This instruction is technically impossible — it is designed to trick you into authorizing a payment.' },
];

const URGENCY_PHRASES = [
  { pattern: /(?:disconnect|shut\s*off|suspend|block).*(?:24\s*hour|immediately|urgent|within|today)/i, severity: 'high' as Severity, explanation: 'Urgency + threat of disconnection is a classic social engineering pressure tactic. Legitimate utility bills give 15–30 days notice before disconnection.' },
  { pattern: /act\s*(?:immediately|now|quickly|fast|within)/i, severity: 'high' as Severity, explanation: 'Pressure to act immediately prevents you from thinking clearly or verifying the message through official channels.' },
  { pattern: /(?:within|in)\s*\d+\s*(?:hour|hrs?|minutes?)\s*(?:or|otherwise)/i, severity: 'high' as Severity, explanation: 'Artificial time limits are a hallmark of scam messages. Legitimate organizations do not demand action within hours.' },
];

const SUSPICIOUS_CHANNELS = [
  { pattern: /refund\s*adjustment/i, severity: 'high' as Severity, explanation: '"Refund adjustment" is not a real UPI transaction type. Scammers invent plausible-sounding terms to confuse victims.' },
  { pattern: /forwarded\s*from/i, severity: 'medium' as Severity, explanation: '"Forwarded from [Official Name]" does not mean the message is from that organization. Anyone can type any sender name in a forwarded message.' },
  { pattern: /(?:customer\s*(?:care|support)|helpline).*(?:number|call)/i, severity: 'medium' as Severity, explanation: 'Fake customer care numbers are a common scam vector. Always use the official app or website to contact support.' },
];

// ─── Tool 1: analyze_payment_message ─────────────────────────────────────────

function analyze_payment_message(message_text: string): AnalyzeMessageResult {
  const flags: ScamFlag[] = [];
  const text = message_text.toLowerCase();

  for (const marker of RECEIVE_MONEY_SCAM_MARKERS) {
    const match = text.match(marker.pattern);
    if (match) {
      flags.push({ phrase: match[0], severity: marker.severity, explanation: marker.explanation });
    }
  }
  for (const phrase of URGENCY_PHRASES) {
    const match = text.match(phrase.pattern);
    if (match) {
      flags.push({ phrase: match[0], severity: phrase.severity, explanation: phrase.explanation });
    }
  }
  for (const channel of SUSPICIOUS_CHANNELS) {
    const match = text.match(channel.pattern);
    if (match) {
      flags.push({ phrase: match[0], severity: channel.severity, explanation: channel.explanation });
    }
  }

  // Severity-weighted score: critical=3, high=2, medium=1
  const score = flags.reduce((sum, f) => {
    return sum + (f.severity === 'critical' ? 3 : f.severity === 'high' ? 2 : 1);
  }, 0);

  let verdict: Verdict = 'low_risk';
  if (score >= 3) verdict = 'high_risk';
  else if (score >= 1) verdict = 'medium_risk';

  return { flags, verdict, score };
}

// ─── Tool 2: forecast_cash_flow ──────────────────────────────────────────────

function forecast_cash_flow(
  current_balance: number,
  upcoming_expenses: { label: string; amount: number; days_from_now: number }[],
  days_to_next_income: number
): ForecastResult {
  const sorted = [...upcoming_expenses].sort((a, b) => a.days_from_now - b.days_from_now);
  const timeline: CashFlowEntry[] = [];
  let balance = current_balance;

  for (const exp of sorted) {
    balance -= exp.amount;
    timeline.push({
      label: exp.label,
      amount: exp.amount,
      days_from_now: exp.days_from_now,
      balance_after: balance,
    });
  }

  const goes_negative = balance < 0;
  let days_until_negative: number | null = null;
  if (goes_negative) {
    for (const entry of timeline) {
      if (entry.balance_after < 0) {
        days_until_negative = entry.days_from_now;
        break;
      }
    }
  }

  return {
    timeline,
    goes_negative,
    days_until_negative,
    final_balance: balance,
    current_balance,
    days_to_income: days_to_next_income,
  };
}

// ─── Tool 3: compute_true_loan_cost ──────────────────────────────────────────

function compute_true_loan_cost(
  principal: number,
  annual_interest_rate_pct: number,
  tenure_months: number,
  processing_fee_pct: number = 0,
  other_flat_fees: number = 0
): LoanResult {
  const monthly_rate = annual_interest_rate_pct / 100 / 12;
  let emi: number;

  if (monthly_rate === 0) {
    emi = principal / tenure_months;
  } else {
    // Standard amortizing EMI: P·r·(1+r)^n / ((1+r)^n - 1)
    const pow = Math.pow(1 + monthly_rate, tenure_months);
    emi = (principal * monthly_rate * pow) / (pow - 1);
  }

  const total_repayment = emi * tenure_months;
  const total_interest = total_repayment - principal;
  const processing_fee = (principal * processing_fee_pct) / 100;
  const extra_cost_over_principal = total_interest + processing_fee + other_flat_fees;
  const effective_annual_rate = (extra_cost_over_principal / principal) * (12 / tenure_months) * 100;

  return {
    principal,
    emi: Math.round(emi),
    total_repayment: Math.round(total_repayment),
    total_interest: Math.round(total_interest),
    processing_fee: Math.round(processing_fee),
    flat_fees: other_flat_fees,
    extra_cost_over_principal: Math.round(extra_cost_over_principal),
    effective_annual_rate: Math.round(effective_annual_rate * 10) / 10,
  };
}

// ─── Tool 4: escalate_to_trusted_contact ─────────────────────────────────────

function escalate_to_trusted_contact(
  transaction_summary: string,
  risk_verdict: Verdict
): EscalationResult {
  if (risk_verdict === 'low_risk') {
    return { escalated: false, message: null, risk_verdict };
  }

  const urgency = risk_verdict === 'high_risk' ? 'URGENT' : 'ALERT';
  const message = `[UPI Rakshak ${urgency}] A transaction may be risky. Summary: "${transaction_summary}". Please verify with the user before they proceed. Risk level: ${risk_verdict.replace('_', ' ')}.`;

  return { escalated: true, message, risk_verdict };
}

// ─── Tool 5: suggest_safe_alternative ────────────────────────────────────────

function suggest_safe_alternative(context: string): AlternativeResult {
  return {
    safe_channel: 'Use the official biller app or website (e.g., the electricity board\'s own app, or pay via your bank\'s bill-pay section).',
    explanation: 'The legitimate way to pay any bill is through the biller\'s own official channel — never through a QR code or link sent in a message. Check your bill on the official portal directly.',
  };
}

// ─── Verdict derivation (client-side pickVerdict equivalent) ─────────────────

export function pickVerdict(trace: TraceEntry[]): Verdict | null {
  let maxSeverity = 0;
  let foundVerdict: Verdict | null = null;

  for (const entry of trace) {
    if (entry.tool === 'analyze_payment_message' && entry.result) {
      const result = entry.result as AnalyzeMessageResult;
      if (result.score > maxSeverity) {
        maxSeverity = result.score;
        foundVerdict = result.verdict;
      }
    }
  }

  return foundVerdict;
}

// ─── Agent simulation (observe → decide → act loop, max 8 turns) ─────────────

export function runAgent(context: ScenarioContext): AgentResult {
  const trace: TraceEntry[] = [];
  const MAX_TURNS = 8;

  // ── OBSERVE ──
  trace.push({
    phase: 'observe',
    detail: `Scenario received: ${context.message_text.substring(0, 120)}${context.message_text.length > 120 ? '...' : ''}`,
    tool: null,
    result: null,
  });

  // ── DECIDE / ACT LOOP ──
  let turn = 0;
  let finalAnswer = '';
  let messageVerdict: Verdict | null = null;
  let cashFlowResult: ForecastResult | null = null;
  let loanResult: LoanResult | null = null;
  let escalationResult: EscalationResult | null = null;

  // Turn 1: Decide to analyze message + forecast cash flow
  if (context.message_text.length > 10) {
    trace.push({
      phase: 'decide',
      detail: 'Input contains a payment message. Selecting tools: analyze_payment_message, forecast_cash_flow.',
      tool: null,
      result: null,
    });

    // Act: analyze message
    const msgResult = analyze_payment_message(context.message_text);
    messageVerdict = msgResult.verdict;
    trace.push({
      phase: 'act',
      detail: `Scanned payment message. Found ${msgResult.flags.length} flag(s). Verdict: ${msgResult.verdict} (score: ${msgResult.score}).`,
      tool: 'analyze_payment_message',
      result: msgResult,
    });

    // Act: forecast cash flow
    const cfResult = forecast_cash_flow(
      context.current_balance,
      context.upcoming_expenses,
      context.days_to_next_income
    );
    cashFlowResult = cfResult;
    trace.push({
      phase: 'act',
      detail: cfResult.goes_negative
        ? `Cash flow goes negative in ${cfResult.days_until_negative} days. Final balance: ₹${cfResult.final_balance.toLocaleString()}.`
        : `Cash flow stays positive. Final balance: ₹${cfResult.final_balance.toLocaleString()} after ${context.upcoming_expenses.length} expenses.`,
      tool: 'forecast_cash_flow',
      result: cfResult,
    });
    turn += 1;
  }

  // Turn 2: If loan offered, compute true cost
  if (context.loan && turn < MAX_TURNS) {
    trace.push({
      phase: 'decide',
      detail: 'Input mentions a loan offer. Selecting tool: compute_true_loan_cost.',
      tool: null,
      result: null,
    });

    const lr = compute_true_loan_cost(
      context.loan.principal,
      context.loan.annual_interest_rate_pct,
      context.loan.tenure_months,
      context.loan.processing_fee_pct,
      context.loan.other_flat_fees
    );
    loanResult = lr;
    trace.push({
      phase: 'act',
      detail: `True loan cost computed. EMI: ₹${lr.emi.toLocaleString()}/mo. Extra cost over principal: ₹${lr.extra_cost_over_principal.toLocaleString()}. Effective rate: ${lr.effective_annual_rate}%.`,
      tool: 'compute_true_loan_cost',
      result: lr,
    });
    turn += 1;
  }

  // Turn 3: If high risk, suggest safe alternative
  if (messageVerdict === 'high_risk' && turn < MAX_TURNS) {
    trace.push({
      phase: 'decide',
      detail: 'High-risk scam detected. Selecting tool: suggest_safe_alternative.',
      tool: null,
      result: null,
    });

    const alt = suggest_safe_alternative(context.message_text);
    trace.push({
      phase: 'act',
      detail: `Safe alternative identified: ${alt.safe_channel}`,
      tool: 'suggest_safe_alternative',
      result: alt,
    });
    turn += 1;
  }

  // Turn 4: If high/medium risk, escalate
  if ((messageVerdict === 'high_risk' || messageVerdict === 'medium_risk') && turn < MAX_TURNS) {
    trace.push({
      phase: 'decide',
      detail: `Risk verdict is ${messageVerdict}. Selecting tool: escalate_to_trusted_contact.`,
      tool: null,
      result: null,
    });

    const esc = escalate_to_trusted_contact(
      context.message_text.substring(0, 100),
      messageVerdict
    );
    escalationResult = esc;
    trace.push({
      phase: 'act',
      detail: esc.escalated
        ? `Escalated to trusted contact. Alert: "${esc.message}"`
        : 'Risk too low to escalate. No alert sent.',
      tool: 'escalate_to_trusted_contact',
      result: esc,
    });
    turn += 1;
  }

  // ── EVALUATE ──
  // Check: does the first recommendation fully resolve the situation?
  const stillShort = cashFlowResult?.goes_negative ?? false;
  const hasScam = messageVerdict === 'high_risk';

  trace.push({
    phase: 'evaluate',
    detail: hasScam && stillShort
      ? `Scam identified (good), but cash flow still goes negative in ${cashFlowResult!.days_until_negative} days even without the loan. First answer is incomplete — need to adapt.`
      : hasScam
      ? 'Scam identified and safe alternative provided. Situation is resolved.'
      : stillShort
      ? 'No scam detected, but cash flow shortfall remains. Need to evaluate loan alternatives.'
      : 'All checks passed. Situation is manageable.',
    tool: null,
    result: null,
  });

  // ── ADAPT (if needed) ──
  if (hasScam && stillShort) {
    trace.push({
      phase: 'adapt',
      detail: `Avoiding the scam loan still leaves ₹${Math.abs(cashFlowResult!.final_balance).toLocaleString()} shortfall. Suggesting: (1) request bill extension from provider, (2) defer non-essential expense, (3) borrow from trusted contact at 0% instead of ${context.loan ? context.loan.annual_interest_rate_pct : 30}%+ effective rate.`,
      tool: null,
      result: null,
    });
  } else if (stillShort && !hasScam) {
    trace.push({
      phase: 'adapt',
      detail: `Shortfall of ₹${Math.abs(cashFlowResult!.final_balance).toLocaleString()} detected. If loan is necessary, the true cost is ₹${loanResult?.extra_cost_over_principal.toLocaleString() ?? 'unknown'} extra. Consider negotiating payment extensions first.`,
      tool: null,
      result: null,
    });
  }

  // ── DECIDE FINAL ──
  // Build the final answer
  let answer = '';

  if (hasScam) {
    answer += '🚨 **This message is a scam.** ';
    const criticalFlags = (trace.find(t => t.tool === 'analyze_payment_message')?.result as AnalyzeMessageResult)?.flags.filter(f => f.severity === 'critical');
    if (criticalFlags?.length) {
      answer += `The phrase "${criticalFlags[0].phrase}" is the red flag — ${criticalFlags[0].explanation} `;
    }
    answer += '\n\n**Do not** scan any QR code or enter your PIN. ';
    answer += 'Pay your bill through the official biller app or your bank\'s bill-pay section instead.';
  }

  if (stillShort && loanResult) {
    answer += `\n\n💰 **About the loan:** The headline rate hides the real cost. You'd pay ₹${loanResult.extra_cost_over_principal.toLocaleString()} extra (effective rate: ${loanResult.effective_annual_rate}%). `;
    if (hasScam) {
      answer += `Since the message is a scam, avoid this loan entirely — it's part of the trap. `;
    }
    if (cashFlowResult) {
      answer += `Your cash flow projects to ₹${cashFlowResult.final_balance.toLocaleString()} after expenses. `;
      if (cashFlowResult.goes_negative) {
        answer += `That's ₹${Math.abs(cashFlowResult.final_balance).toLocaleString()} short. Consider: request a bill extension, defer a non-essential expense, or borrow from a trusted contact at 0% instead.`;
      }
    }
  } else if (stillShort && !loanResult) {
    answer += `\n\n💰 Your cash flow projects to ₹${cashFlowResult!.final_balance.toLocaleString()}. That's a shortfall of ₹${Math.abs(cashFlowResult!.final_balance).toLocaleString()}. Consider deferring non-essential expenses or requesting payment extensions.`;
  }

  if (escalationResult?.escalated) {
    answer += '\n\n📱 **Alert sent to your trusted contact** so they can help verify before you act.';
  }

  if (!answer) {
    answer = '✅ No scam patterns detected and your cash flow looks manageable. No action needed.';
  }

  finalAnswer = answer;
  trace.push({
    phase: 'decide_final',
    detail: 'Produced final recommendation based on all tool results.',
    tool: null,
    result: null,
  });

  return {
    final_answer: finalAnswer,
    trace,
    verdict: messageVerdict,
  };
}

// ─── Default scenario ────────────────────────────────────────────────────────

export const DEFAULT_SCENARIO: ScenarioContext = {
  message_text: `URGENT: Your electricity connection will be disconnected within 24 hours. Scan the QR code below and enter your UPI PIN to receive your refund adjustment of ₹2,500. Act immediately or your meter will be shut off. Forwarded from BSES Official.`,
  current_balance: 8500,
  upcoming_expenses: [
    { label: 'Rent', amount: 7000, days_from_now: 3 },
    { label: 'Phone Recharge', amount: 599, days_from_now: 1 },
    { label: 'Electricity Bill (legit)', amount: 1200, days_from_now: 5 },
  ],
  days_to_next_income: 12,
  loan: {
    principal: 10000,
    annual_interest_rate_pct: 30,
    tenure_months: 3,
    processing_fee_pct: 5,
    other_flat_fees: 200,
  },
};

export const FAILURE_SCENARIO: ScenarioContext = {
  message_text: `Your broadband bill of ₹3,200 is overdue. Pay now via this QR code to avoid disconnection. Enter UPI PIN to confirm payment reversal credit.`,
  current_balance: 4200,
  upcoming_expenses: [
    { label: 'Rent', amount: 8000, days_from_now: 2 },
    { label: 'Broadband (legit)', amount: 3200, days_from_now: 1 },
    { label: 'Groceries', amount: 2500, days_from_now: 4 },
  ],
  days_to_next_income: 15,
  loan: {
    principal: 15000,
    annual_interest_rate_pct: 36,
    tenure_months: 6,
    processing_fee_pct: 4,
    other_flat_fees: 300,
  },
};
