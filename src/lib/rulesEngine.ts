/**
 * UPI Rakshak — Rules Engine
 * 
 * Deterministic fraud detection for Indian UPI payment messages.
 * Supports Hinglish + English. Zero external dependencies.
 */

export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'SAFE';

export interface ThreatAnalysis {
  level: ThreatLevel;
  reasons: string[];
  matchedPatterns: string[];
  suggestedAction: string;
  officialRoute?: string;
}

// ─── Pattern Definitions ─────────────────────────────────────────────────────

const URGENCY_KEYWORDS = [
  // Hinglish
  'bandh', 'block', 'disconnect', 'kat jayega', 'turant', 'abhi', 'aaj hi',
  'jaldi', 'fauran', 'turunt', 'abhi abhi',
  // English
  'immediately', 'urgent', 'right now', 'tonight', 'today', 'within 24',
  'within hours', 'disconnected', 'blocked', 'suspended', 'deactivated',
];

const SUSPICIOUS_UPI_PATTERNS = [
  /upi[_\s-]?(care|urgent|verify|help|support|refund|helpline|customer)/i,
  /@(icici|hdfc|sbi|paytm|ybl|axl|ibl).*?(care|support|help|verify|refund)/i,
  /@(bses|tata|adani|electricity|power|bill).*?(care|pay|refund)/i,
];

const PAYMENT_TRAPS = [
  // Hinglish
  /qr\s*code\s*scan\s*karo/i,
  /upi\s*pin\s*enter\s*karo/i,
  /money\s*receive\s*karne\s*ke\s*liye/i,
  /refund\s*ke\s*liye\s*pay\s*karo/i,
  /pin\s*daalo?/i,
  /pin\s*enter\s*karo/i,
  /qr\s*scan\s*karein/i,
  // English
  /scan\s*(the\s*)?qr\s*(code)?\s*(to|and)\s*(receive|accept|claim|refund)/i,
  /enter\s*(your\s*)?upi\s*pin\s*(to|for)\s*(receive|accept|claim|refund|collect)/i,
  /pin\s*(to|for)\s*receive/i,
  /enter\s*pin.*receive/i,
];

const LOOKALIKE_DOMAINS = [
  /(?:bses|sbi|paytm|phonepe|gpay|googlepay|amazon|flipkart)[-_]?(care|support|help|refund|verify)[-.]?\w*?\.(online|xyz|top|site|club|info|live)/i,
  /(?:care|support|help|refund|verify)[-_]?(?:bses|sbi|paytm|phonepe|gpay)[-.]?\w*?\.(online|xyz|top|site|club|info|live)/i,
];

// ─── Classification Helpers ──────────────────────────────────────────────────

function detectUrgency(text: string): { matched: boolean; phrases: string[] } {
  const lower = text.toLowerCase();
  const phrases: string[] = [];
  for (const keyword of URGENCY_KEYWORDS) {
    if (lower.includes(keyword)) {
      phrases.push(keyword);
    }
  }
  return { matched: phrases.length > 0, phrases };
}

function detectSuspiciousUPI(text: string): { matched: boolean; phrases: string[] } {
  const phrases: string[] = [];
  for (const pattern of SUSPICIOUS_UPI_PATTERNS) {
    const match = text.match(pattern);
    if (match) phrases.push(match[0]);
  }
  return { matched: phrases.length > 0, phrases };
}

function detectPaymentTraps(text: string): { matched: boolean; phrases: string[] } {
  const phrases: string[] = [];
  for (const pattern of PAYMENT_TRAPS) {
    const match = text.match(pattern);
    if (match) phrases.push(match[0]);
  }
  return { matched: phrases.length > 0, phrases };
}

function detectLookalikeDomains(text: string): { matched: boolean; phrases: string[] } {
  const phrases: string[] = [];
  for (const pattern of LOOKALIKE_DOMAINS) {
    const match = text.match(pattern);
    if (match) phrases.push(match[0]);
  }
  return { matched: phrases.length > 0, phrases };
}

function detectLateNightUrgency(text: string): { matched: boolean } {
  const hour = new Date().getHours();
  const isLateNight = hour >= 23 || hour < 6;
  const { matched: hasUrgency } = detectUrgency(text);
  return { matched: isLateNight && hasUrgency };
}

// ─── Main Analysis Function ──────────────────────────────────────────────────

export function analyzeMessage(title: string, text: string): ThreatAnalysis {
  const combined = `${title} ${text}`;
  const reasons: string[] = [];
  const matchedPatterns: string[] = [];

  const urgency = detectUrgency(combined);
  const suspiciousUPI = detectSuspiciousUPI(combined);
  const paymentTraps = detectPaymentTraps(combined);
  const lookalikes = detectLookalikeDomains(combined);
  const lateNight = detectLateNightUrgency(combined);

  // Collect all matched phrases
  matchedPatterns.push(...urgency.phrases, ...suspiciousUPI.phrases, 
                       ...paymentTraps.phrases, ...lookalikes.phrases);

  // Determine threat level
  // HIGH: urgency + (suspicious UPI OR payment trap OR lookalike domain)
  const hasUrgency = urgency.matched || lateNight.matched;
  const hasTechnicalTrap = suspiciousUPI.matched || paymentTraps.matched || lookalikes.matched;

  let level: ThreatLevel = 'SAFE';
  let suggestedAction = 'This message appears safe. No suspicious patterns detected.';
  let officialRoute: string | undefined;

  if (hasUrgency && hasTechnicalTrap) {
    level = 'HIGH';
    suggestedAction = 'DO NOT respond, scan any QR, or enter your UPI PIN. This is a scam.';
    
    // Determine official route based on context
    if (urgency.phrases.some(p => ['disconnect', 'disconnected', 'electricity', 'bijli', 'power'].includes(p)) ||
        combined.toLowerCase().includes('electricity') || combined.toLowerCase().includes('bijli') ||
        combined.toLowerCase().includes('bses') || combined.toLowerCase().includes('power')) {
      officialRoute = 'Use official BSES/Tata Power app or bbps.npci.org.in';
    } else if (combined.toLowerCase().includes('sbi') || combined.toLowerCase().includes('bank') ||
               combined.toLowerCase().includes('account') || combined.toLowerCase().includes('kyc')) {
      officialRoute = 'Call your bank\'s number on the back of your card';
    } else {
      officialRoute = 'Remember: receiving money NEVER needs a UPI PIN';
    }

    // Build reasons
    if (urgency.matched) {
      reasons.push(`Urgency detected: "${urgency.phrases.slice(0, 2).join('", "')}" — scammers pressure you to act fast without thinking.`);
    }
    if (lateNight.matched) {
      reasons.push('Late-night message with urgency — scammers target you when you\'re tired and less alert.');
    }
    if (suspiciousUPI.matched) {
      reasons.push(`Suspicious UPI ID: "${suspiciousUPI.phrases[0]}" — legitimate organizations don't use IDs like this.`);
    }
    if (paymentTraps.matched) {
      reasons.push(`Payment trap: "${paymentTraps.phrases[0]}" — you NEVER need to enter a PIN or scan a QR to RECEIVE money.`);
    }
    if (lookalikes.matched) {
      reasons.push(`Fake domain: "${lookalikes.phrases[0]}" — this is not the official website.`);
    }
  } else if (hasUrgency || hasTechnicalTrap) {
    level = 'MEDIUM';
    suggestedAction = 'Be cautious. Verify through official channels before acting.';
    
    if (hasUrgency) {
      reasons.push(`Urgency language detected: "${urgency.phrases.slice(0, 2).join('", "')}". Legitimate organizations rarely demand immediate action.`);
    }
    if (suspiciousUPI.matched) {
      reasons.push(`Unusual UPI ID pattern: "${suspiciousUPI.phrases[0]}". Verify before sending money.`);
    }
    if (paymentTraps.matched) {
      reasons.push(`Suspicious instruction: "${paymentTraps.phrases[0]}". Remember: receiving money never requires a PIN.`);
    }
    if (lookalikes.matched) {
      reasons.push(`Possible fake domain: "${lookalikes.phrases[0]}". Check the URL carefully.`);
    }
  } else {
    reasons.push('No urgency keywords, suspicious UPI IDs, payment traps, or fake domains detected.');
  }

  return {
    level,
    reasons,
    matchedPatterns,
    suggestedAction,
    officialRoute,
  };
}

// ─── Self-Test Function ──────────────────────────────────────────────────────

export function runRuleTests(): void {
  const tests = [
    {
      title: 'Electricity Scam',
      input: { title: 'WhatsApp', text: 'URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici' },
      expected: 'HIGH' as ThreatLevel,
    },
    {
      title: 'Bank Account Block',
      input: { title: 'SMS', text: 'Your SBI account has been blocked. Enter UPI PIN to verify and unblock immediately.' },
      expected: 'HIGH' as ThreatLevel,
    },
    {
      title: 'Friendly Message',
      input: { title: 'WhatsApp', text: 'Hi, this is your friend, sending money' },
      expected: 'SAFE' as ThreatLevel,
    },
    {
      title: 'KYC Verification',
      input: { title: 'SMS', text: 'Paytm care: verify your KYC to avoid account suspension' },
      expected: 'MEDIUM' as ThreatLevel,
    },
    {
      title: 'Prize Scam',
      input: { title: 'SMS', text: 'Congratulations! Pay ₹500 processing fee to receive ₹10,000 lottery prize. UPI: refundcare@paytm' },
      expected: 'HIGH' as ThreatLevel,
    },
  ];

  console.group('🧪 UPI Rakshak — Rules Engine Tests');
  let passed = 0;
  let failed = 0;

  tests.forEach((test, i) => {
    const result = analyzeMessage(test.input.title, test.input.text);
    const success = result.level === test.expected;
    
    if (success) {
      console.log(`✅ Test ${i + 1} PASS: "${test.title}" → ${result.level}`);
      passed++;
    } else {
      console.error(`❌ Test ${i + 1} FAIL: "${test.title}" → Expected ${test.expected}, got ${result.level}`);
      console.error(`   Input: "${test.input.text}"`);
      console.error(`   Reasons: ${result.reasons.join('; ')}`);
      failed++;
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  console.groupEnd();
}
