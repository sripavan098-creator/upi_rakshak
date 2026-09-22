import { beforeEach, describe, expect, it } from 'vitest';
import { analyzeMessage } from './rulesEngine';
import { buildReportText, loadReport, saveReport } from './savedReport';

const analysis = analyzeMessage('User message', 'URGENT: enter your UPI PIN to receive a refund at bsescare@icici');

describe('savedReport', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a report through local storage', () => {
    saveReport('original message', analysis);

    const restored = loadReport();
    expect(restored).not.toBeNull();
    expect(restored!.message).toBe('original message');
    expect(restored!.analysis.level).toBe(analysis.level);
    expect(Date.parse(restored!.savedAt)).not.toBeNaN();
  });

  it('returns null when nothing has been saved', () => {
    expect(loadReport()).toBeNull();
  });

  it('ignores a corrupted or tampered report instead of throwing', () => {
    localStorage.setItem('upi-rakshak-last-analysis', 'not json at all');
    expect(loadReport()).toBeNull();

    localStorage.setItem('upi-rakshak-last-analysis', JSON.stringify({ message: 42, analysis: { level: 'HACKED' } }));
    expect(loadReport()).toBeNull();
  });

  it('builds a plain-text report containing the verdict and safe action', () => {
    const text = buildReportText({
      message: 'pay now',
      analysis,
      savedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(text).toContain('UPI Rakshak — Scam analysis report');
    expect(text).toContain(`Verdict: ${analysis.level}`);
    expect(text).toContain(analysis.suggestedAction);
    expect(text).toContain('pay now');
    expect(text).toContain('Analyzed locally on-device');
  });
});
