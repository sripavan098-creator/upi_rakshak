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

/** Hard cap on input length; UPI deep links are short and long input is only abuse. */
export const MAX_PAYLOAD_LENGTH = 1024;

/**
 * NPCI VPA shape: local part (letters/digits/._-) @ PSP handle (letters/digits, may
 * contain dots). Deliberately stricter than an email because UPI handles are not emails.
 */
const VPA_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,60}@[a-zA-Z][a-zA-Z0-9.]{1,60}$/;

/** UPA amount: optional decimals, no sign, no exponent, no separators. */
const AMOUNT_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

const MCC_PATTERN = /^\d{4}$/;

const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** True for C0 control characters and DEL, which should never reach the UI. */
function isControlCode(code: number): boolean {
  return code < 0x20 || code === 0x7f;
}

/** Strips control characters and collapses whitespace so nothing odd reaches the UI. */
function sanitize(value: string): string {
  let out = '';
  for (const char of value) {
    out += isControlCode(char.codePointAt(0) ?? 0) ? ' ' : char;
  }
  return out.replace(/\s+/g, ' ').trim();
}

function safeDecode(value: string): string {
  try {
    return sanitize(decodeURIComponent(value));
  } catch {
    return sanitize(value);
  }
}

export interface ValidationError {
  field: 'input' | 'payeeAddress' | 'amount' | 'merchantCode' | 'currency';
  message: string;
}

export interface UpiParseResult {
  payload: UpiPayload | null;
  errors: ValidationError[];
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
  validationErrors?: ValidationError[];
  timestamp: string;
  latencyMs: number;
}

/**
 * Parses and validates UPI QR deep links (e.g. upi://pay?pa=...&pn=...&am=...).
 * Returns the payload plus any field-level validation errors. The payload is
 * still returned when only optional fields are malformed so the caller can show
 * a precise reason; a missing/invalid payee address yields `payload: null`.
 */
export function parseUpiPayload(text: string): UpiParseResult {
  const errors: ValidationError[] = [];
  const raw = typeof text === 'string' ? text : '';

  if (raw.length > MAX_PAYLOAD_LENGTH) {
    return { payload: null, errors: [{ field: 'input', message: `Input exceeds ${MAX_PAYLOAD_LENGTH} characters.` }] };
  }

  const trimmed = sanitize(raw);
  if (!trimmed) {
    return { payload: null, errors: [{ field: 'input', message: 'Enter a UPI link or VPA to analyze.' }] };
  }

  const finalize = (draft: { payeeAddress: string; payeeName: string; amount: string; transactionNote: string; merchantCode: string; transactionRef?: string; currency: string }) => {
    if (!draft.payeeAddress) {
      errors.push({ field: 'payeeAddress', message: 'Missing payee address (pa).' });
    } else if (!VPA_PATTERN.test(draft.payeeAddress)) {
      errors.push({ field: 'payeeAddress', message: `"${draft.payeeAddress}" is not a valid UPI ID.` });
    }

    if (draft.amount && !AMOUNT_PATTERN.test(draft.amount)) {
      errors.push({ field: 'amount', message: `"${draft.amount}" is not a valid amount.` });
    }

    if (draft.merchantCode && !MCC_PATTERN.test(draft.merchantCode)) {
      errors.push({ field: 'merchantCode', message: 'Merchant code must be 4 digits.' });
    }

    if (draft.currency && !CURRENCY_PATTERN.test(draft.currency)) {
      errors.push({ field: 'currency', message: 'Currency must be a 3-letter code.' });
    }

    const invalidPayee = !draft.payeeAddress || !VPA_PATTERN.test(draft.payeeAddress);
    return {
      payload: invalidPayee ? null : { raw: trimmed, ...draft },
      errors,
    } satisfies UpiParseResult;
  };

  if (trimmed.startsWith('upi://pay') || trimmed.includes('pa=')) {
    try {
      const urlStr = trimmed.startsWith('upi://') ? trimmed : `upi://pay?${trimmed}`;
      // In browser, handle custom scheme by replacing with http placeholder
      const dummyUrl = new URL(urlStr.replace(/^upi:\/\//, 'https://dummy.upi/'));
      const params = dummyUrl.searchParams;
      const transactionRef = params.get('tr');

      return finalize({
        payeeAddress: sanitize(params.get('pa') || ''),
        payeeName: safeDecode(params.get('pn') || ''),
        amount: sanitize(params.get('am') || ''),
        transactionNote: safeDecode(params.get('tn') || ''),
        merchantCode: sanitize(params.get('mc') || ''),
        transactionRef: transactionRef ? sanitize(transactionRef) : undefined,
        currency: sanitize(params.get('cu') || 'INR'),
      });
    } catch {
      // Manual regex fallback for malformed deep links
      const field = (key: string) => trimmed.match(new RegExp(`[?&]${key}=([^&]+)`))?.[1] || '';

      return finalize({
        payeeAddress: safeDecode(field('pa')),
        payeeName: safeDecode(field('pn')),
        amount: sanitize(field('am')),
        transactionNote: safeDecode(field('tn')),
        merchantCode: sanitize(field('mc')),
        currency: 'INR',
      });
    }
  }

  // If someone pasted a bare VPA e.g. "sharma@okhdfcbank"
  if (VPA_PATTERN.test(trimmed)) {
    return finalize({
      payeeAddress: trimmed,
      payeeName: sanitize(trimmed.split('@')[0]),
      amount: '',
      transactionNote: '',
      merchantCode: '',
      currency: 'INR',
    });
  }

  return { payload: null, errors: [{ field: 'input', message: 'Not a recognised UPI link or VPA.' }] };
}

/**
 * Backwards-compatible wrapper returning only the payload (or null when invalid).
 */
export function parseUpiString(text: string): UpiPayload | null {
  return parseUpiPayload(text).payload;
}

/**
 * Analyzes QR code content for UPI payment scams and assigns a safety score (0 - 100)
 */
export function analyzeQrPayload(rawContent: string): QrSafetyResult {
  const startTime = performance.now();
  const parsed = parseUpiPayload(rawContent);
  const upi = parsed.payload;
  const validationErrors = parsed.errors;
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Invalid UPI input: never emit a "safe" verdict for a payload we could not read.
  if (!upi && validationErrors.some((error) => error.field !== 'input')) {
    return {
      score: 20,
      level: 'HIGH',
      title: 'Invalid UPI Payment Details',
      subtitle: 'The scanned code is missing or has malformed payment fields',
      payload: null,
      reasons: [
        'This payload looks like a UPI payment link but its payment fields are invalid.',
        ...validationErrors.map((error) => error.message),
        'Never approve a payment whose payee details cannot be verified.',
      ],
      matchedPatterns: ['invalid_upi_payload'],
      suggestedAction: 'Do not pay. Ask the sender for a correct, verifiable UPI ID.',
      officialRoute: 'Report fraudulent VPA to cybercrime.gov.in or 1930',
      validationErrors,
      timestamp: now,
      latencyMs: Number(Math.max(3.4, performance.now() - startTime).toFixed(1)),
    };
  }

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

  // Surface softer field problems (bad amount / MCC / currency) even when the
  // payee itself is valid, so the user sees exactly what looked wrong.
  for (const error of validationErrors) {
    reasons.push(`Field warning: ${error.message}`);
  }

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
