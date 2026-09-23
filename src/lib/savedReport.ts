import type { ThreatAnalysis, ThreatLevel } from './rulesEngine';

const STORAGE_KEY = 'upi-rakshak-last-analysis';

export interface SavedReport {
  message: string;
  analysis: ThreatAnalysis;
  savedAt: string;
}

const LEVELS: readonly ThreatLevel[] = ['HIGH', 'MEDIUM', 'SAFE'];

function isThreatAnalysis(value: unknown): value is ThreatAnalysis {
  if (!value || typeof value !== 'object') return false;
  const analysis = value as Record<string, unknown>;
  return (
    LEVELS.includes(analysis.level as ThreatLevel) &&
    Array.isArray(analysis.reasons) &&
    analysis.reasons.every((reason) => typeof reason === 'string') &&
    Array.isArray(analysis.matchedPatterns) &&
    analysis.matchedPatterns.every((pattern) => typeof pattern === 'string') &&
    typeof analysis.suggestedAction === 'string'
  );
}

export function saveReport(message: string, analysis: ThreatAnalysis): SavedReport {
  const report: SavedReport = { message, analysis, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
  return report;
}

/** Reads the last saved report, ignoring anything that fails validation. */
export function loadReport(): SavedReport | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const report = parsed as Record<string, unknown>;
    if (typeof report.message !== 'string' || !isThreatAnalysis(report.analysis)) return null;
    return {
      message: report.message,
      analysis: report.analysis,
      savedAt: typeof report.savedAt === 'string' ? report.savedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

/** Plain-text export suitable for pasting into a complaint or support chat. */
export function buildReportText(report: SavedReport): string {
  const { analysis } = report;
  const lines = [
    'UPI Rakshak — Scam analysis report',
    `Generated: ${report.savedAt}`,
    `Verdict: ${analysis.level}`,
    '',
    'Message:',
    report.message,
    '',
    `Evidence (${analysis.matchedPatterns.length} match${analysis.matchedPatterns.length === 1 ? '' : 'es'}):`,
    ...(analysis.matchedPatterns.length > 0
      ? analysis.matchedPatterns.map((pattern) => `- ${pattern}`)
      : ['- no known signal']),
    '',
    'Why:',
    ...analysis.reasons.map((reason) => `- ${reason}`),
    '',
    `Safe action: ${analysis.suggestedAction}`,
  ];

  if (analysis.officialRoute) {
    lines.push(`Official route: ${analysis.officialRoute}`);
  }

  lines.push('', 'Analyzed locally on-device. No data was sent to a server.');
  return lines.join('\n');
}
