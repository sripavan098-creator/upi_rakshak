import { describe, expect, it } from 'vitest';
import { parseUpiString, parseUpiPayload, analyzeQrPayload } from './qrSafetyAnalyzer';
import { SAMPLE_UPI_QR_SCENARIOS } from './qrScenarios';

describe('parseUpiString', () => {
  it('parses a standard upi://pay deep link', () => {
    const parsed = parseUpiString(
      'upi://pay?pa=sharmastore@okhdfcbank&pn=Sharma%20General%20Store&am=185&tn=Grocery%20bill&mc=5411',
    );

    expect(parsed).not.toBeNull();
    expect(parsed!.payeeAddress).toBe('sharmastore@okhdfcbank');
    expect(parsed!.payeeName).toBe('Sharma General Store');
    expect(parsed!.amount).toBe('185');
    expect(parsed!.transactionNote).toBe('Grocery bill');
    expect(parsed!.merchantCode).toBe('5411');
  });

  it('accepts a bare VPA such as an email-style handle', () => {
    const parsed = parseUpiString('sharma@okhdfcbank');

    expect(parsed).not.toBeNull();
    expect(parsed!.payeeAddress).toBe('sharma@okhdfcbank');
  });

  it('returns null for an empty string', () => {
    expect(parseUpiString('   ')).toBeNull();
  });

  it('returns null for plain prose that is not a payment payload', () => {
    expect(parseUpiString('hello there, pay me later')).toBeNull();
  });
});

describe('parseUpiPayload validation', () => {
  it('reports no errors for a well-formed link', () => {
    const { payload, errors } = parseUpiPayload('upi://pay?pa=sharmastore@okhdfcbank&am=185&mc=5411');

    expect(payload).not.toBeNull();
    expect(errors).toEqual([]);
  });

  it('rejects a malformed payee address', () => {
    const { payload, errors } = parseUpiPayload('upi://pay?pa=not-a-vpa&am=100');

    expect(payload).toBeNull();
    expect(errors.some((error) => error.field === 'payeeAddress')).toBe(true);
  });

  it('flags a non-numeric amount', () => {
    const { payload, errors } = parseUpiPayload('upi://pay?pa=sharmastore@okhdfcbank&am=1e9abc');

    expect(payload).not.toBeNull();
    expect(errors.some((error) => error.field === 'amount')).toBe(true);
  });

  it('flags a merchant code that is not four digits', () => {
    const { errors } = parseUpiPayload('upi://pay?pa=sharmastore@okhdfcbank&mc=54');

    expect(errors.some((error) => error.field === 'merchantCode')).toBe(true);
  });

  it('rejects input longer than the payload cap', () => {
    const { payload, errors } = parseUpiPayload(`upi://pay?pa=store@bank&tn=${'x'.repeat(2000)}`);

    expect(payload).toBeNull();
    expect(errors[0].field).toBe('input');
  });

  it('strips control characters from decoded fields', () => {
    const { payload } = parseUpiPayload('upi://pay?pa=store@bank&pn=Store%00%1F%20Name');

    expect(payload!.payeeName).toBe('Store Name');
    expect([...payload!.payeeName].some((char) => (char.codePointAt(0) ?? 0) < 0x20)).toBe(false);
  });

  it('never marks an unreadable UPI-style payload as safe', () => {
    const result = analyzeQrPayload('upi://pay?pa=bad vpa here&am=100');

    expect(result.level).toBe('HIGH');
    expect(result.matchedPatterns).toContain('invalid_upi_payload');
    expect(result.validationErrors?.length).toBeGreaterThan(0);
  });
});

describe('analyzeQrPayload', () => {
  it('flags the receive-money reversal trap as HIGH risk', () => {
    const result = analyzeQrPayload(SAMPLE_UPI_QR_SCENARIOS[1].payload);

    expect(result.level).toBe('HIGH');
    expect(result.matchedPatterns).toContain('receive_trap_reversal');
    expect(result.score).toBeLessThanOrEqual(35);
  });

  it('flags an impersonated utility support VPA as HIGH risk', () => {
    const result = analyzeQrPayload(
      'upi://pay?pa=bsescare@icici&pn=BSES%20Support&am=2499&tn=disconnection%20fine',
    );

    expect(result.level).toBe('HIGH');
    expect(result.matchedPatterns).toContain('utility_bank_vpa_spoof');
  });

  it('keeps a verified merchant with a valid MCC safe', () => {
    const result = analyzeQrPayload(SAMPLE_UPI_QR_SCENARIOS[3].payload);

    expect(result.level).toBe('SAFE');
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  it('treats an insecure lookalike web link as HIGH risk', () => {
    const result = analyzeQrPayload('http://bses-support.online/pay');

    expect(result.level).toBe('HIGH');
    expect(result.matchedPatterns).toContain('phishing_url');
  });

  it('warns on a non-UPI external link without calling it fraud', () => {
    const result = analyzeQrPayload('https://example.com/shop');

    expect(result.level).toBe('MEDIUM');
    expect(result.matchedPatterns).toContain('non_upi_qr');
  });

  it('handles an unrecognised plain-text payload without crashing', () => {
    const result = analyzeQrPayload('just some text');

    expect(result.level).toBe('MEDIUM');
    expect(result.payload).toBeNull();
    expect(result.matchedPatterns).toContain('non_standard_qr');
  });

  it('always returns an explanation and a suggested action', () => {
    for (const scenario of SAMPLE_UPI_QR_SCENARIOS) {
      const result = analyzeQrPayload(scenario.payload);
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.suggestedAction).toBeTruthy();
      expect(['HIGH', 'MEDIUM', 'SAFE']).toContain(result.level);
    }
  });

  it('keeps the score inside the documented 0-100 range', () => {
    for (const scenario of SAMPLE_UPI_QR_SCENARIOS) {
      const result = analyzeQrPayload(scenario.payload);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    }
  });

  it('reports a bounded latency for the scan', () => {
    const result = analyzeQrPayload(SAMPLE_UPI_QR_SCENARIOS[0].payload);

    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.latencyMs).toBeLessThan(1000);
  });
});
