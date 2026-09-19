/**
 * UPI Rakshak — Rules Engine (2026 Advanced Taxonomy)
 * 
 * Deterministic fraud detection for Indian UPI payment messages.
 * Supports bilingual output (English + Hindi) for maximum accessibility.
 * Zero external dependencies.
 */

export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'SAFE';

export interface ThreatReason {
  en: string;
  hi: string;
}

export interface ThreatAnalysis {
  level: ThreatLevel;
  reasons: ThreatReason[];
  matchedPatterns: string[];
  suggestedAction: ThreatReason;
  officialRoute?: ThreatReason;
}

// ─── 2026 Fraud Vectors ─────────────────────────────────────────────────────

// Vector 1: Urgency Manipulation
const URGENCY_KEYWORDS = [
  { 
    pattern: /(?:disconnect|shut\s*off|suspend|block).*(?:24\s*hour|immediately|urgent|within|today|tonight)/i,
    reason: {
      en: 'Urgency + threat of disconnection is a classic social engineering pressure tactic. Legitimate utility bills give 15-30 days notice.',
      hi: 'Turant katne ki dhamki ek classic scam hai. Asli bill mein 15-30 din ka time milta hai.'
    }
  },
  {
    pattern: /act\s*(?:immediately|now|quickly|fast|within|abhi|turant)/i,
    reason: {
      en: 'Pressure to act immediately prevents you from thinking clearly or verifying through official channels.',
      hi: 'Turant action ka pressure aapko sochne aur verify karne se rokta hai.'
    }
  },
  {
    pattern: /(?:within|in)\s*\d+\s*(?:hour|hrs?|minutes?)\s*(?:or|otherwise|warna)/i,
    reason: {
      en: 'Artificial time limits are a hallmark of scam messages. Legitimate organizations do not demand action within hours.',
      hi: 'Time limit dalna scam ki pehchaan hai. Asli companies itni jaldi action nahi maangti.'
    }
  }
];

// Vector 2: Digital Arrest Scam (NEW in 2026)
const DIGITAL_ARREST_KEYWORDS = [
  {
    pattern: /(?:digital\s*arrest|virtual\s*custody|online\s*arrest|video\s*call\s*(?:police|cbi|customs|trai))/i,
    reason: {
      en: 'Digital arrest is NOT real. Police/CBI/Customs never conduct arrests over video calls. This is a sophisticated scam targeting Indians.',
      hi: 'Digital arrest jaisa kuch nahi hota. Police/CBI/Customs video call pe arrest nahi karti. Yeh ek naya scam hai.'
    }
  },
  {
    pattern: /(?:cbi\s*officer|police\s*officer|customs\s*officer|trai\s*officer).*(?:video\s*call|verify|investigation)/i,
    reason: {
      en: 'Government officers never call citizens for video verification. This is a scam impersonating officials.',
      hi: 'Sarkari officer citizens ko video verification ke liye call nahi karte. Yeh officers ki impersonation hai.'
    }
  },
  {
    pattern: /(?:money\s*laundering|terror\s*funding|illegal\s*transaction).*(?:your\s*name|your\s*account|verify)/i,
    reason: {
      en: 'Accusations of money laundering or terror funding via message are always scams. Real investigations happen through proper legal channels.',
      hi: 'Money laundering ya terror funding ka accusation message se hamesha scam hota hai. Asli investigation legal channel se hoti hai.'
    }
  }
];

// Vector 3: APK Malware Distribution (NEW in 2026)
const APK_MALWARE_KEYWORDS = [
  {
    pattern: /(?:install|download).*(?:apk|app|file).*(?:e-?challan|traffic\s*fine|wedding\s*invite|invitation)/i,
    reason: {
      en: 'APK files from WhatsApp/Telegram contain malware that steals your data. Never install apps from messages. Only use Google Play Store.',
      hi: 'WhatsApp/Telegram se APK file mein virus hota hai jo aapka data chura leta hai. Kabhi bhi message se app install mat karein. Sirf Play Store use karein.'
    }
  },
  {
    pattern: /(?:enable|allow).*(?:unknown\s*sources|install\s*from\s*unknown)/i,
    reason: {
      en: 'Enabling "Unknown Sources" to install APK files is a major security risk. Scammers use this to install spyware on your phone.',
      hi: '"Unknown Sources" enable karna bahut risky hai. Scammers iska use karke aapke phone mein spyware install karte hain.'
    }
  }
];

// Vector 4: UPI Autopay Traps (NEW in 2026)
const AUTOPAY_TRAP_KEYWORDS = [
  {
    pattern: /(?:verify|activate).*(?:with|se).*(?:₹\s*1|rs\s*1|one\s*rupee)/i,
    reason: {
      en: 'Small ₹1 verification payments often hide AutoPay mandates that can drain your account repeatedly. Read the fine print carefully.',
      hi: '₹1 verify karne ke naam pe AutoPay activate ho jata hai jo baar baar paise kaat sakta hai. Fine print dhyan se padhein.'
    }
  },
  {
    pattern: /(?:autopay|auto-?pay|mandate|recurring\s*payment).*(?:activate|setup|start)/i,
    reason: {
      en: 'AutoPay mandates allow automatic deductions from your account. Only activate if you fully understand the terms and can cancel anytime.',
      hi: 'AutoPay mandate se aapke account se automatic paise katenge. Sirf tabhi activate karein jab aap terms samajh lein aur cancel kar sakein.'
    }
  }
];

// Vector 5: Remote Access Scams (NEW in 2026)
const REMOTE_ACCESS_KEYWORDS = [
  {
    pattern: /(?:anydesk|teamviewer|quicksupport|rustdesk|airdroid|screen\s*share|remote\s*access)/i,
    reason: {
      en: 'Screen-sharing apps give scammers FULL CONTROL of your phone. They can see your OTPs, access your bank apps, and steal your money. Never install these.',
      hi: 'Screen share app se scammer ko aapke phone ka POORA control mil jata hai. Woh aapke OTP dekh sakte hain, bank app access kar sakte hain, aur paise chura sakte hain. Kabhi install mat karein.'
    }
  },
  {
    pattern: /(?:share\s*your\s*screen|show\s*me\s*your\s*phone|remote\s*help).*(?:bank|upi|payment|otp)/i,
    reason: {
      en: 'Legitimate companies NEVER ask you to share your screen. This is a scam to steal your banking credentials.',
      hi: 'Asli companies kabhi aapki screen share nahi maangti. Yeh aapke banking details churane ka scam hai.'
    }
  }
];

// Vector 6: Receive Money Scams (Classic)
const RECEIVE_MONEY_SCAM_MARKERS = [
  {
    pattern: /enter.*(?:upi\s*)?pin.*(?:receiv|accept|claim|refund|collect)/i,
    reason: {
      en: 'You NEVER need to enter your UPI PIN to RECEIVE money. A PIN is only required when SENDING. This is the #1 UPI scam.',
      hi: 'Paisa RECEIVE karne ke liye UPI PIN kabhi nahi dena hota. PIN sirf SEND karne ke liye hota hai. Yeh #1 UPI scam hai.'
    }
  },
  {
    pattern: /scan.*qr.*(?:receiv|accept|claim|refund|collect)/i,
    reason: {
      en: 'Scanning a QR code sends money FROM your account. You cannot receive money by scanning a QR code.',
      hi: 'QR code scan karne se aapke account se paisa JATA hai. QR scan karke paisa RECEIVE nahi hota.'
    }
  }
];

// Vector 7: Lookalike Domains
const LOOKALIKE_DOMAINS = [
  {
    pattern: /(?:bses|sbi|paytm|phonepe|gpay)[-_]?(?:care|support|help|refund|verify)[-.]?\w*?\.(?:online|xyz|top|site|club|info|live)/i,
    reason: {
      en: 'Fake domains like "bses-care.online" impersonate real companies. Always use official apps or websites (.gov.in, .com).',
      hi: '"bses-care.online" jaise fake domains asli companies ki nakal karte hain. Hamesha official apps ya websites use karein.'
    }
  }
];

// Vector 8: Suspicious Channels
const SUSPICIOUS_CHANNELS = [
  {
    pattern: /refund\s*adjustment/i,
    reason: {
      en: '"Refund adjustment" is not a real UPI transaction type. Scammers invent terms to confuse victims.',
      hi: '"Refund adjustment" koi asli UPI transaction nahi hai. Scammers confusing terms banate hain.'
    }
  },
  {
    pattern: /forwarded\s*from/i,
    reason: {
      en: '"Forwarded from [Official Name]" does not mean the message is from that organization. Anyone can type any sender name.',
      hi: '"Forwarded from [Official Name]" ka matlab yeh nahi ki message uss organization se hai. Koi bhi sender name likh sakta hai.'
    }
  }
];

// ─── Classification Function ────────────────────────────────────────────────

export function analyzeMessage(title: string, text: string): ThreatAnalysis {
  const combined = `${title} ${text}`.toLowerCase();
  const reasons: ThreatReason[] = [];
  const matchedPatterns: string[] = [];

  // Check all vectors
  const allVectors = [
    ...DIGITAL_ARREST_KEYWORDS,
    ...APK_MALWARE_KEYWORDS,
    ...REMOTE_ACCESS_KEYWORDS,
    ...AUTOPAY_TRAP_KEYWORDS,
    ...RECEIVE_MONEY_SCAM_MARKERS,
    ...URGENCY_KEYWORDS,
    ...LOOKALIKE_DOMAINS,
    ...SUSPICIOUS_CHANNELS
  ];

  for (const vector of allVectors) {
    const match = combined.match(vector.pattern);
    if (match) {
      reasons.push(vector.reason);
      matchedPatterns.push(match[0]);
    }
  }

  // Determine threat level
  let level: ThreatLevel = 'SAFE';
  if (reasons.length >= 2) {
    level = 'HIGH';
  } else if (reasons.length === 1) {
    // Check if it's a critical vector
    const isCritical = DIGITAL_ARREST_KEYWORDS.some(v => combined.match(v.pattern)) ||
                       APK_MALWARE_KEYWORDS.some(v => combined.match(v.pattern)) ||
                       REMOTE_ACCESS_KEYWORDS.some(v => combined.match(v.pattern)) ||
                       RECEIVE_MONEY_SCAM_MARKERS.some(v => combined.match(v.pattern));
    level = isCritical ? 'HIGH' : 'MEDIUM';
  }

  // Build suggested action
  const suggestedAction: ThreatReason = level === 'HIGH' 
    ? {
        en: 'DO NOT respond, scan any QR, or enter your UPI PIN. This is a scam. Report to 1930 (cybercrime helpline).',
        hi: 'Response mat do, QR scan mat karo, UPI PIN mat daalo. Yeh scam hai. 1930 pe report karein.'
      }
    : level === 'MEDIUM'
    ? {
        en: 'Be cautious. Verify through official channels before acting.',
        hi: 'Savdhan rahein. Official channel se verify karein.'
      }
    : {
        en: 'This message appears safe. No suspicious patterns detected.',
        hi: 'Yeh message safe lagta hai. Koi suspicious pattern nahi mila.'
      };

  // Build official route for HIGH risk
  let officialRoute: ThreatReason | undefined;
  if (level === 'HIGH') {
    if (DIGITAL_ARREST_KEYWORDS.some(v => combined.match(v.pattern))) {
      officialRoute = {
        en: 'Hang up immediately. Report to 1930 (national cybercrime helpline). Police never conduct digital arrests.',
        hi: 'Turant call kaat dein. 1930 pe report karein. Police digital arrest nahi karti.'
      };
    } else if (APK_MALWARE_KEYWORDS.some(v => combined.match(v.pattern))) {
      officialRoute = {
        en: 'Only install apps from Google Play Store. Delete any APK files received via messages.',
        hi: 'Sirf Google Play Store se apps install karein. Message se aaye APK files delete kar dein.'
      };
    } else if (REMOTE_ACCESS_KEYWORDS.some(v => combined.match(v.pattern))) {
      officialRoute = {
        en: 'Never install screen-sharing apps. Legitimate companies never ask for remote access to your phone.',
        hi: 'Screen sharing apps kabhi install mat karein. Asli companies kabhi remote access nahi maangti.'
      };
    } else if (RECEIVE_MONEY_SCAM_MARKERS.some(v => combined.match(v.pattern))) {
      officialRoute = {
        en: 'Remember: receiving money NEVER needs a UPI PIN. Use the official biller app or website.',
        hi: 'Yaad rakhein: paisa RECEIVE karne ke liye UPI PIN kabhi nahi dena hota. Official biller app ya website use karein.'
      };
    } else {
      officialRoute = {
        en: 'Contact the organization directly through their official app or website. Do not use links or numbers from messages.',
        hi: 'Organization se directly unki official app ya website se contact karein. Message ke links ya numbers use mat karein.'
      };
    }
  }

  return {
    level,
    reasons,
    matchedPatterns,
    suggestedAction,
    officialRoute
  };
}

// ─── Self-Test Function ─────────────────────────────────────────────────────

export function runRuleTests(): void {
  const tests = [
    {
      name: 'Digital Arrest Scam',
      input: { title: 'WhatsApp', text: 'CBI officer video call, digital arrest, money laundering verification' },
      expected: 'HIGH'
    },
    {
      name: 'APK Malware',
      input: { title: 'SMS', text: 'Install this APK for traffic e-challan fine payment' },
      expected: 'HIGH'
    },
    {
      name: 'Remote Access',
      input: { title: 'WhatsApp', text: 'Please install AnyDesk for screen share, we will help with KYC' },
      expected: 'HIGH'
    },
    {
      name: 'Autopay Trap',
      input: { title: 'SMS', text: 'Verify your account with ₹1 to activate subscription' },
      expected: 'HIGH'
    },
    {
      name: 'Receive Money Scam',
      input: { title: 'WhatsApp', text: 'Enter UPI PIN to receive your refund money' },
      expected: 'HIGH'
    },
    {
      name: 'Electricity Scam',
      input: { title: 'WhatsApp', text: 'URGENT: Electricity disconnected tonight, scan QR to pay bsescare@icici' },
      expected: 'HIGH'
    },
    {
      name: 'OTP Message (Safe)',
      input: { title: 'HDFC Bank', text: 'Your OTP is 123456. Do not share.' },
      expected: 'SAFE'
    },
    {
      name: 'Friend Chat (Safe)',
      input: { title: 'WhatsApp', text: 'Hi, this is your friend, sending money' },
      expected: 'SAFE'
    }
  ];

  console.group('🧪 UPI Rakshak — 2026 Taxonomy Tests');
  let passed = 0;
  let failed = 0;

  tests.forEach((test, i) => {
    const result = analyzeMessage(test.input.title, test.input.text);
    const success = result.level === test.expected;
    
    if (success) {
      console.log(`✅ Test ${i + 1} PASS: "${test.name}" → ${result.level}`);
      passed++;
    } else {
      console.error(`❌ Test ${i + 1} FAIL: "${test.name}" → Expected ${test.expected}, got ${result.level}`);
      console.error(`   Input: "${test.input.text}"`);
      console.error(`   Reasons: ${result.reasons.map(r => r.en).join('; ')}`);
      failed++;
    }
  });

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  console.groupEnd();
}
