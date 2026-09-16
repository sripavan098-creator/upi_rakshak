// UPI Rakshak Agent Simulation
// This simulates the observe → decide → act → evaluate → adapt loop

export interface ScamFlag {
  phrase: string;
  severity: 'critical' | 'high' | 'medium';
  explanation: string;
}

export interface CashFlowEntry {
  day: number;
  label: string;
  balance: number;
  isExpense: boolean;
}

export interface LoanResult {
  principal: number;
  interest: number;
  processingFee: number;
  flatFee: number;
  totalCost: number;
  effectiveRate: number;
  emi: number;
}

export interface AgentStep {
  phase: 'observe' | 'decide' | 'act' | 'evaluate' | 'adapt';
  description: string;
  toolUsed?: string;
  output?: string;
}

export interface SimulationResult {
  scamFlags: ScamFlag[];
  cashFlowData: CashFlowEntry[];
  loanResult: LoanResult;
  recommendation: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  escalated: boolean;
  steps: AgentStep[];
}

interface FinancialContext {
  currentBalance: number;
  upcomingExpenses: { label: string; amount: number; dueIn: number }[];
  loanOffer: {
    principal: number;
    interestRate: number;
    processingFee: number;
    flatFee: number;
    tenureMonths: number;
  };
}

// Deterministic scam detection patterns
const SCAM_PATTERNS: { pattern: RegExp; severity: ScamFlag['severity']; explanation: string }[] = [
  {
    pattern: /enter.*(?:upi\s*)?pin.*(?:receiv|accept|claim|refund)/i,
    severity: 'critical',
    explanation: 'You NEVER need to enter your UPI PIN to RECEIVE money. PINs are only for SENDING. This is the #1 UPI scam pattern.',
  },
  {
    pattern: /scan.*qr.*(?:receiv|accept|claim|refund|collect)/i,
    severity: 'critical',
    explanation: 'Scanning a QR code sends money FROM your account. You cannot receive money by scanning a QR code.',
  },
  {
    pattern: /(?:disconnect|shut\s*off|suspend).*(?:24\s*hour|immediately|urgent|within)/i,
    severity: 'high',
    explanation: 'Urgency + threat of disconnection is a classic social engineering pressure tactic. Legitimate bills give 15-30 day notice.',
  },
  {
    pattern: /refund\s*adjustment/i,
    severity: 'high',
    explanation: '"Refund adjustment" is not a real UPI transaction type. Scammers invent plausible-sounding terms to confuse victims.',
  },
  {
    pattern: /forwarded\s*from/i,
    severity: 'medium',
    explanation: '"Forwarded from [Official Name]" does not mean the message is from that organization. Anyone can type any sender name.',
  },
  {
    pattern: /act\s*(?:immediately|now|quickly|fast)/i,
    severity: 'high',
    explanation: 'Pressure to act immediately prevents you from thinking clearly or verifying the message through official channels.',
  },
];

function detectScamFlags(message: string): ScamFlag[] {
  const flags: ScamFlag[] = [];
  
  for (const { pattern, severity, explanation } of SCAM_PATTERNS) {
    const match = message.match(pattern);
    if (match) {
      flags.push({
        phrase: match[0],
        severity,
        explanation,
      });
    }
  }
  
  return flags;
}

// Deterministic cash flow projection
function projectCashFlow(context: FinancialContext): CashFlowEntry[] {
  const entries: CashFlowEntry[] = [];
  let balance = context.currentBalance;
  
  entries.push({ day: 0, label: 'Today', balance, isExpense: false });
  
  // Sort expenses by due date
  const sortedExpenses = [...context.upcomingExpenses].sort((a, b) => a.dueIn - b.dueIn);
  
  for (const expense of sortedExpenses) {
    balance -= expense.amount;
    entries.push({
      day: expense.dueIn,
      label: expense.label,
      balance,
      isExpense: true,
    });
  }
  
  return entries;
}

// Deterministic loan cost computation
function computeTrueLoanCost(loanOffer: FinancialContext['loanOffer']): LoanResult {
  const { principal, interestRate, processingFee, flatFee, tenureMonths } = loanOffer;
  
  // Simple interest calculation (typical for instant loans)
  const interest = (principal * interestRate * tenureMonths) / (100 * 12);
  const totalCost = interest + processingFee + flatFee;
  const totalRepayment = principal + totalCost;
  const emi = totalRepayment / tenureMonths;
  
  // Effective annual rate including all fees
  const effectiveRate = ((totalCost / principal) / (tenureMonths / 12)) * 100;
  
  return {
    principal,
    interest: Math.round(interest),
    processingFee,
    flatFee,
    totalCost: Math.round(totalCost),
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    emi: Math.round(emi),
  };
}

// The agent simulation - observe → decide → act → evaluate → adapt
export function runAgentSimulation(
  message: string,
  context: FinancialContext
): SimulationResult {
  const steps: AgentStep[] = [];
  
  // PHASE 1: OBSERVE
  steps.push({
    phase: 'observe',
    description: 'Received input: payment message + financial context. Parsing message for scam indicators and extracting financial parameters.',
    output: `Message length: ${message.length} chars. Context: balance ₹${context.currentBalance}, ${context.upcomingExpenses.length} upcoming expenses, 1 loan offer.`,
  });
  
  // PHASE 2: DECIDE
  const hasMessage = message.length > 20;
  const hasExpenses = context.upcomingExpenses.length > 0;
  const hasLoanOffer = !!context.loanOffer;
  
  const toolsToCall: string[] = [];
  if (hasMessage) toolsToCall.push('scan_message_for_scams');
  if (hasExpenses) toolsToCall.push('forecast_cash_flow');
  if (hasLoanOffer) toolsToCall.push('compute_true_loan_cost');
  
  steps.push({
    phase: 'decide',
    description: `Input contains: ${[hasMessage && 'payment message', hasExpenses && 'expense data', hasLoanOffer && 'loan offer'].filter(Boolean).join(', ')}. Selecting required tools: ${toolsToCall.join(', ')}.`,
    output: `Dynamic tool selection: ${toolsToCall.length} tools needed based on input composition.`,
  });
  
  // PHASE 3: ACT - Execute tools
  const scamFlags = hasMessage ? detectScamFlags(message) : [];
  if (hasMessage) {
    steps.push({
      phase: 'act',
      description: `Executing scan_message_for_scams: Found ${scamFlags.length} fraud indicators in the message.`,
      toolUsed: 'scan_message_for_scams',
      output: `${scamFlags.length} flags detected: ${scamFlags.map(f => f.severity).join(', ')}`,
    });
  }
  
  const cashFlowData = hasExpenses ? projectCashFlow(context) : [];
  if (hasExpenses) {
    const finalBalance = cashFlowData[cashFlowData.length - 1]?.balance ?? context.currentBalance;
    const hasShortfall = finalBalance < 0;
    steps.push({
      phase: 'act',
      description: `Executing forecast_cash_flow: Projected ${context.upcomingExpenses.length} expenses over ${Math.max(...context.upcomingExpenses.map(e => e.dueIn))} days. ${hasShortfall ? 'SHORTFALL DETECTED — final balance will be negative.' : 'Balance remains positive.'}`,
      toolUsed: 'forecast_cash_flow',
      output: `Final projected balance: ₹${finalBalance.toLocaleString()}${hasShortfall ? ' (DEFICIT)' : ''}`,
    });
  }
  
  const loanResult = hasLoanOffer ? computeTrueLoanCost(context.loanOffer) : {
    principal: 0, interest: 0, processingFee: 0, flatFee: 0, totalCost: 0, effectiveRate: 0, emi: 0,
  };
  if (hasLoanOffer) {
    steps.push({
      phase: 'act',
      description: `Executing compute_true_loan_cost: Headline rate ${context.loanOffer.interestRate}% but true cost is ₹${loanResult.totalCost.toLocaleString()} (${loanResult.effectiveRate}% effective). Processing fee + flat fee add ₹${loanResult.processingFee + context.loanOffer.flatFee} on top of interest.`,
      toolUsed: 'compute_true_loan_cost',
      output: `Total repayment: ₹${(loanResult.principal + loanResult.totalCost).toLocaleString()} | EMI: ₹${loanResult.emi.toLocaleString()}/mo`,
    });
  }
  
  // PHASE 4: EVALUATE
  const finalBalance = cashFlowData[cashFlowData.length - 1]?.balance ?? context.currentBalance;
  const hasCriticalScam = scamFlags.some(f => f.severity === 'critical');
  const hasCashShortfall = finalBalance < 0;
  
  let recommendation = '';
  let riskLevel: SimulationResult['riskLevel'] = 'low';
  let escalated = false;
  
  if (hasCriticalScam) {
    riskLevel = 'critical';
    recommendation = `🚨 DO NOT scan that QR code or enter your PIN. This message is a scam — receiving money NEVER requires a PIN. The phrase "${scamFlags[0]?.phrase}" is the red flag. Pay your electricity bill directly through the official BSES app/website instead.`;
  }
  
  if (hasCashShortfall && hasLoanOffer) {
    if (riskLevel === 'critical') {
      recommendation += `\n\n💰 About the loan: The true cost is ₹${loanResult.totalCost.toLocaleString()} extra (not just the headline interest). With your balance already tight, this loan makes things worse, not better.`;
    } else {
      riskLevel = 'high';
      recommendation = `💰 Your cash flow projects to ₹${Math.abs(finalBalance).toLocaleString()} deficit. The loan's true cost is ₹${loanResult.totalCost.toLocaleString()} extra (${loanResult.effectiveRate}% effective rate). Consider negotiating a payment extension first.`;
    }
  }
  
  steps.push({
    phase: 'evaluate',
    description: `Cross-checking results: Scam risk=${hasCriticalScam ? 'CRITICAL' : 'none'}, Cash shortfall=${hasCashShortfall ? 'YES' : 'no'}, Loan trap=${hasLoanOffer ? `₹${loanResult.totalCost} hidden cost` : 'N/A'}. Recommendation formed.`,
    output: `Risk level: ${riskLevel}. ${hasCriticalScam ? 'Escalation warranted.' : 'No escalation needed.'}`,
  });
  
  // PHASE 5: ADAPT
  if (hasCriticalScam && hasCashShortfall) {
    escalated = true;
    steps.push({
      phase: 'adapt',
      description: `First recommendation (avoid scam + avoid loan) still leaves ₹${Math.abs(finalBalance).toLocaleString()} shortfall. Adapting: suggesting legitimate alternatives — bill payment extension, splitting rent payment, or borrowing from a trusted contact at 0% instead of 30%+ effective rate.`,
      toolUsed: 'find_cheaper_alternative',
      output: `Alternative identified: Request bill extension from BSES (free), ask landlord for 5-day rent grace, or borrow from family at 0% vs loan at ${loanResult.effectiveRate}% effective.`,
    });
  } else if (hasCriticalScam) {
    steps.push({
      phase: 'adapt',
      description: `Situation resolved: scam identified and explained. No further adaptation needed — user has clear action path (pay bill through official channel).`,
      output: 'Resolution complete. No remaining gaps.',
    });
  } else if (hasCashShortfall) {
    escalated = true;
    steps.push({
      phase: 'adapt',
      description: `Cash shortfall of ₹${Math.abs(finalBalance).toLocaleString()} remains even without the loan. Adapting: exploring whether any expenses can be deferred or if a smaller, cheaper credit option exists.`,
      toolUsed: 'find_cheaper_alternative',
      output: 'Suggesting expense deferral and trusted-contact borrowing as alternatives.',
    });
  } else {
    steps.push({
      phase: 'adapt',
      description: 'All checks passed. No adaptation required — situation is manageable without intervention.',
      output: 'No gaps found. User is in a safe position.',
    });
  }
  
  return {
    scamFlags,
    cashFlowData,
    loanResult,
    recommendation,
    riskLevel,
    escalated,
    steps,
  };
}
