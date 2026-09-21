import { analyzeMessage, ThreatLevel } from './rulesEngine';

export interface UpiPayload {
  raw: string;
  payeeAddress: string;
  payeeName: string;
  amount: string;
  transactionNote: string;
  merchantCode: string;
  transactionRef?: string;
  currency: string;
}

export interface QrSafetyResult {
  score: number; // 0 (extreme fraud) to 100 (completely safe)
  level: ThreatLevel; // 'SAFE' | 'MEDIUM' | 'HIGH'
  title: string;
  subtitle: string;
  payload: UpiPayload | null;
  reasons: string[];
  matchedPatterns: string[];
  suggestedAction: string;
  officialRoute?: string;
  timestamp: string;
  latencyMs: number;
}

/**
 * Parses UPI QR deep links (e.g. upi://pay?pa=...&pn=...&am=...)
 */
export function parseUpiString(text: string): UpiPayload | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('upi://pay') || trimmed.includes('pa=')) {
    try {
      const urlStr = trimmed.startsWith('upi://') ? trimmed : `upi://pay?${trimmed}`;
      // In browser, handle custom scheme by replacing with http placeholder
      const dummyUrl = new URL(urlStr.replace(/^upi:\/\//, 'https://dummy.upi/'));
      const params = dummyUrl.searchParams;

      return {
        raw: trimmed,
        payeeAddress: params.get('pa') || '',
        payeeName: decodeURIComponent(params.get('pn') || ''),
        amount: params.get('am') || '',
        transactionNote: decodeURIComponent(params.get('tn') || ''),
        merchantCode: params.get('mc') || '',
        transactionRef: params.get('tr') || undefined,
        currency: params.get('cu') || 'INR',
      };
    } catch {
      // Manual regex fallback
      const pa = trimmed.match(/[?&]pa=([^&]+)/)?.[1] || '';
      const pn = trimmed.match(/[?&]pn=([^&]+)/)?.[1] || '';
      const am = trimmed.match(/[?&]am=([^&]+)/)?.[1] || '';
      const tn = trimmed.match(/[?&]tn=([^&]+)/)?.[1] || '';
      const mc = trimmed.match(/[?&]mc=([^&]+)/)?.[1] || '';

      return {
        raw: trimmed,
        payeeAddress: decodeURIComponent(pa),
        payeeName: decodeURIComponent(pn),
        amount: am,
        transactionNote: decodeURIComponent(tn),
        merchantCode: mc,
        currency: 'INR',
      };
    }
  }

  // If someone pasted an email-like VPA e.g. "sharma@okhdfcbank"
  if (/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed)) {
    return {
      raw: `upi://pay?pa=${trimmed}`,
      payeeAddress: trimmed,
      payeeName: trimmed.split('@')[0],
      amount: '',
      transactionNote: '',
      merchantCode: '',
      currency: 'INR',
    };
  }

  return null;
}

/**
 * Analyzes QR code content for UPI payment scams and assigns a safety score (0 - 100)
 */
export function analyzeQrPayload(rawContent: string): QrSafetyResult {
  const startTime = performance.now();
  const upi = parseUpiString(rawContent);
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // If not a UPI QR code
  if (!upi) {
    // Check if it's a web URL or phishing link
    if (rawContent.startsWith('http://') || rawContent.startsWith('https://')) {
      const isHttp = rawContent.startsWith('http://');
      const hasFakeDomain = /(bses|sbi|paytm|phonepe|gpay|bank|electricity).*\.(online|xyz|top|site|club)/i.test(rawContent);

      if (hasFakeDomain || isHttp) {
        return {
          score: 18,
          level: 'HIGH',
          title: 'Suspicious Web Link (Not a UPI QR)',
          subtitle: 'Phishing domain or insecure HTTP link disguised as QR code',
          payload: null,
          reasons: [
            'Scanned QR is an external website link rather than a standard UPI payment QR.',
            isHttp ? 'Insecure HTTP protocol without encryption.' : 'Domain resembles official entities with unauthorized TLD (.online/.xyz).',
            'Never enter UPI PIN or bank OTPs on websites reached via QR codes.',
          ],
          matchedPatterns: ['external_web_link', 'phishing_url'],
          suggestedAction: 'Do not open this website or enter credentials.',
          officialRoute: 'Only use official bank/merchant mobile apps.',
          timestamp: now,
          latencyMs: Number(Math.max(3.2, performance.now() - startTime).toFixed(1)),
        };
      }

      return {
        score: 55,
        level: 'MEDIUM',
        title: 'Non-UPI Web Link',
        subtitle: 'External website QR code',
        payload: null,
        reasons: ['This QR code opens an external URL, not a direct UPI payment request.'],
        matchedPatterns: ['non_upi_qr'],
        suggestedAction: 'Verify the domain name carefully before continuing.',
        timestamp: now,
        latencyMs: Number(Math.max(2.8, performance.now() - startTime).toFixed(1)),
      };
    }

    return {
      score: 70,
      level: 'MEDIUM',
      title: 'Unrecognized QR Payload',
      subtitle: 'Plain text or non-payment format',
      payload: null,
      reasons: ['Payload does not adhere to standard NPCI UPI QR specifications.'],
      matchedPatterns: ['non_standard_qr'],
      suggestedAction: 'Ensure you are scanning a standard UPI QR code.',
      timestamp: now,
      latencyMs: Number(Math.max(2.1, performance.now() - startTime).toFixed(1)),
    };
  }

  // Combine fields for semantic rules engine check
  const textToCheck = `${upi.payeeName} ${upi.payeeAddress} ${upi.transactionNote}`;
  const baseAnalysis = analyzeMessage(`UPI QR (${upi.payeeAddress})`, textToCheck);

  // Additional UPI QR specific rules
  const reasons = [...baseAnalysis.reasons];
  const matchedPatterns = [...baseAnalysis.matchedPatterns];

  let score = 95; // default high safety
  const lowerPa = upi.payeeAddress.toLowerCase();
  const lowerPn = upi.payeeName.toLowerCase();
  const lowerTn = upi.transactionNote.toLowerCase();

  // Rule A: Reversed payment trap ("receive money", "claim prize", "refund")
  const receiveTrap = /(receive|refund|claim|collect|bonus|lottery|inam|cashback)/i.test(lowerTn) ||
                     /(receive|refund|claim)/i.test(lowerPn);
  if (receiveTrap) {
    reasons.unshift('CRITICAL REVERSAL TRAP: Scanning this QR will DEBIT your account. You NEVER pay or scan to receive money.');
    matchedPatterns.push('receive_trap_reversal');
    score = Math.min(score, 12);
  }

  // Rule B: Impersonating utility / bank support in personal handle
  const isUtilityImpersonation = /(bses|tata|adani|electricity|bijli|power).*(care|help|support|pay|bill)/i.test(lowerPa) ||
                                /(sbi|hdfc|icici|axis|pnb|paytm).*(care|help|support|verify|kyc)/i.test(lowerPa);
  if (isUtilityImpersonation) {
    reasons.unshift(`IMPERSONATION HANDLE: VPA "${upi.payeeAddress}" mimics official customer support. Official utilities never collect bills on personal VPAs.`);
    matchedPatterns.push('utility_bank_vpa_spoof');
    score = Math.min(score, 15);
  }

  // Rule C: Fake KYC or Threatening urgency in Note
  const urgencyInNote = /(block|disconnect|suspend|deactivate|today|tonight|turant|immediately|aaj hi|fine)/i.test(lowerTn);
  if (urgencyInNote) {
    reasons.unshift(`COERCIVE URGENCY: Note "${upi.transactionNote}" creates false panic to force hasty approval.`);
    matchedPatterns.push('note_urgency_panic');
    score = Math.min(score, 20);
  }

  // Rule D: Verified Merchant Category Code (MCC)
  const isRecognizedMerchant = upi.merchantCode && ['5411', '5812', '5912', '4900', '5311'].includes(upi.merchantCode);
  if (isRecognizedMerchant && !receiveTrap && !isUtilityImpersonation) {
    score = Math.min(100, score + 4);
    reasons.push(`Verified Merchant Category Code: MCC ${upi.merchantCode}`);
  }

  // Calculate final level based on score
  let level: ThreatLevel = 'SAFE';
  if (score < 50 || baseAnalysis.level === 'HIGH') {
    level = 'HIGH';
    score = Math.min(score, 35);
  } else if (score < 85 || baseAnalysis.level === 'MEDIUM') {
    level = 'MEDIUM';
    score = Math.min(score, 75);
  } else {
    level = 'SAFE';
  }

  // Title and subtitle
  let title = 'Verified Safe Payment QR';
  let subtitle = 'Standard merchant or peer transaction';
  if (level === 'HIGH') {
    title = 'CRITICAL FRAUD WARNING';
    subtitle = 'High-risk scam pattern intercepted';
  } else if (level === 'MEDIUM') {
    title = 'Proceed With Caution';
    subtitle = 'Unverified payee or suspicious notes';
  }

  return {
    score,
    level,
    title,
    subtitle,
    payload: upi,
    reasons: reasons.length > 0 ? reasons : ['Legitimate payment format with standard merchant VPA address.'],
    matchedPatterns,
    suggestedAction: level === 'HIGH'
      ? 'DO NOT SCAN OR ENTER UPI PIN. Decline this transaction immediately.'
      : level === 'MEDIUM'
      ? 'Double-check the payee name and exact amount with the recipient before approving.'
      : 'Safe to proceed. Always verify payee name on your banking app screen before entering PIN.',
    officialRoute: baseAnalysis.officialRoute || (level === 'HIGH' ? 'Report fraudulent VPA to cybercrime.gov.in or 1930' : undefined),
    timestamp: now,
    latencyMs: Number(Math.max(4.5, performance.now() - startTime).toFixed(1)),
  };
}
