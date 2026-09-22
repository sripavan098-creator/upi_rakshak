import { describe, expect, it } from 'vitest';
import { analyzeMessage } from './rulesEngine';

describe('analyzeMessage', () => {
  it('flags an electricity disconnection scam as HIGH', () => {
    const result = analyzeMessage(
      'WhatsApp',
      'URGENT: Your electricity will be disconnected tonight! Pay now via QR to avoid ₹5000 fine. UPI: bsescare@icici',
    );

    expect(result.level).toBe('HIGH');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('flags a bank-block PIN trap as HIGH', () => {
    const result = analyzeMessage(
      'SMS',
      'Your SBI account has been blocked. Enter UPI PIN to verify and unblock immediately.',
    );

    expect(result.level).toBe('HIGH');
  });

  it('flags a prize-processing-fee scam as HIGH', () => {
    const result = analyzeMessage(
      'SMS',
      'Congratulations! Pay ₹500 processing fee to receive ₹10,000 lottery prize. UPI: refundcare@paytm',
    );

    expect(result.level).toBe('HIGH');
  });

  it('leaves a friendly message alone', () => {
    const result = analyzeMessage('WhatsApp', 'Hi, this is your friend, sending money');

    expect(result.level).toBe('SAFE');
  });

  it('recognises Hinglish urgency keywords', () => {
    const result = analyzeMessage('SMS', 'Aapka account bandh ho jayega, turant verify karein');

    expect(result.matchedPatterns.length).toBeGreaterThan(0);
    expect(result.level).not.toBe('SAFE');
  });

  it('returns a suggested action for every verdict', () => {
    const result = analyzeMessage('SMS', 'random message');

    expect(result.suggestedAction).toBeTruthy();
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
