import { useMemo, useState } from 'react';
import { analyzeMessage, ThreatAnalysis, ThreatLevel } from '../lib/rulesEngine';
import { speakWarning } from '../lib/voice';

const SAMPLE_MESSAGE = `URGENT: Your electricity connection will be disconnected tonight. Scan this QR and enter your UPI PIN to receive a refund. UPI: bsescare@icici`;

const levelMeta: Record<ThreatLevel, { label: string; intro: string }> = {
  HIGH: { label: 'HIGH RISK', intro: 'Do not scan, reply, or enter a UPI PIN.' },
  MEDIUM: { label: 'CHECK FIRST', intro: 'Pause and verify through an official channel.' },
  SAFE: { label: 'NO SIGNALS FOUND', intro: 'No known signals fired in the current web ruleset.' },
};

export default function MessageAnalysisWorkbench() {
  const [message, setMessage] = useState(SAMPLE_MESSAGE);
  const [analysis, setAnalysis] = useState<ThreatAnalysis>(() => analyzeMessage('WhatsApp message', SAMPLE_MESSAGE));
  const [hasRun, setHasRun] = useState(true);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const resultClass = useMemo(() => `message-analysis__result message-analysis__result--${analysis.level.toLowerCase()}`, [analysis.level]);

  function runAnalysis() {
    const next = analyzeMessage('User message', message);
    setAnalysis(next);
    setHasRun(true);
    setSaved(false);
    setShared(false);
  }

  function saveLocalReport() {
    localStorage.setItem('upi-rakshak-last-analysis', JSON.stringify({ message, analysis, savedAt: new Date().toISOString() }));
    setSaved(true);
  }

  async function shareReport() {
    const report = `UPI Rakshak report\n\n${levelMeta[analysis.level].label}\n${analysis.suggestedAction}\n\nEvidence: ${analysis.reasons.join(' | ')}`;
    try {
      if (navigator.share) await navigator.share({ title: 'UPI Rakshak safety report', text: report });
      else await navigator.clipboard.writeText(report);
      setShared(true);
    } catch {
      // The user cancelled the share sheet; no data is sent automatically.
    }
  }

  return (
    <section className="message-analysis" aria-labelledby="message-analysis-title">
      <div className="message-analysis__intro">
        <span className="message-analysis__eyebrow">EVIDENCE MODE / WEB RULESET</span>
        <h3 id="message-analysis-title">Paste the message. See exactly what fired.</h3>
        <p>This is the core product surface: a deterministic reading of the text, the matched evidence, and the safest next action. No black-box verdict.</p>
      </div>
      <div className="message-analysis__workspace">
        <div className="message-analysis__input-panel">
          <label htmlFor="message-to-analyze">Message or notification text</label>
          <textarea id="message-to-analyze" value={message} onChange={(event) => { setMessage(event.target.value); setHasRun(false); }} aria-describedby="message-analysis-help" />
          <p id="message-analysis-help">Try changing “receive a refund” to see the evidence trail change.</p>
          <button type="button" className="message-analysis__run" onClick={runAnalysis}>Analyze message <span aria-hidden="true">→</span></button>
        </div>
        <div className={resultClass} aria-live="polite">
          <div className="message-analysis__result-head"><span className="message-analysis__stamp">{levelMeta[analysis.level].label}</span><span className="message-analysis__engine">{hasRun ? 'RUN COMPLETE' : 'EDITED / RUN AGAIN'}</span></div>
          <h4>{levelMeta[analysis.level].intro}</h4>
          <div className="message-analysis__evidence-label">EVIDENCE TRAIL / {analysis.matchedPatterns.length} MATCH{analysis.matchedPatterns.length === 1 ? '' : 'ES'}</div>
          <div className="message-analysis__signals">
            {analysis.matchedPatterns.length > 0 ? analysis.matchedPatterns.map((pattern, index) => <span key={`${pattern}-${index}`}>{pattern}</span>) : <span>no known signal</span>}
          </div>
          <ol className="message-analysis__reasons">
            {analysis.reasons.slice(0, 4).map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}
          </ol>
          <div className="message-analysis__action"><strong>SAFE ACTION</strong><span>{analysis.suggestedAction}</span></div>
          <div className="message-analysis__actions">
            <button type="button" className="message-analysis__speak" onClick={() => speakWarning(analysis.suggestedAction, analysis.level === 'SAFE' ? 'en-IN' : 'hi-IN')}>Hear this guidance</button>
            <button type="button" className="message-analysis__save" onClick={saveLocalReport}>{saved ? 'Saved on this device' : 'Save local report'}</button>
            <button type="button" className="message-analysis__save" onClick={shareReport}>{shared ? 'Report ready to share' : 'Share report'}</button>
          </div>
        </div>
      </div>
      <div className="message-analysis__foot"><span>DETERMINISTIC / NO EXTERNAL API</span><span>WEB RULESET / 38 MATCHERS</span><span>INPUT STAYS IN THIS SESSION</span></div>
    </section>
  );
}
