import type { TraceEntry, AnalyzeMessageResult, ForecastResult, LoanResult, EscalationResult, AlternativeResult } from '../lib/agent';

interface ToolDataCardProps {
  entry: TraceEntry;
}

export default function ToolDataCard({ entry }: ToolDataCardProps) {
  if (!entry.tool || !entry.result) return null;

  switch (entry.tool) {
    case 'analyze_payment_message':
      return <ScamFlagsCard result={entry.result as AnalyzeMessageResult} />;
    case 'forecast_cash_flow':
      return <CashFlowCard result={entry.result as ForecastResult} />;
    case 'compute_true_loan_cost':
      return <LoanCostCard result={entry.result as LoanResult} />;
    case 'escalate_to_trusted_contact':
      return <EscalationCard result={entry.result as EscalationResult} />;
    case 'suggest_safe_alternative':
      return <AlternativeCard result={entry.result as AlternativeResult} />;
    default:
      return null;
  }
}

function ScamFlagsCard({ result }: { result: AnalyzeMessageResult }) {
  const severityColors = {
    critical: { bg: 'rgba(225, 85, 74, 0.08)', border: 'rgba(225, 85, 74, 0.2)', text: 'var(--risk-high)', label: 'CRITICAL' },
    high: { bg: 'rgba(232, 163, 61, 0.08)', border: 'rgba(232, 163, 61, 0.2)', text: 'var(--risk-med)', label: 'HIGH' },
    medium: { bg: 'rgba(232, 163, 61, 0.05)', border: 'rgba(232, 163, 61, 0.15)', text: 'var(--gold)', label: 'MEDIUM' },
  };

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--risk-high)' }}>
        🚨 Scam Detection — {result.flags.length} flag{result.flags.length !== 1 ? 's' : ''}
      </p>
      {result.flags.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--safe)' }}>No scam patterns detected.</p>
      ) : (
        <div className="space-y-2">
          {result.flags.map((flag, i) => {
            const c = severityColors[flag.severity];
            return (
              <div key={i} className="rounded-md p-2" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: c.border, color: c.text }}>
                    {c.label}
                  </span>
                </div>
                <p className="text-[11px] font-mono mb-1" style={{ color: 'var(--parchment)' }}>
                  "{flag.phrase}"
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {flag.explanation}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CashFlowCard({ result }: { result: ForecastResult }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: result.goes_negative ? 'var(--risk-high)' : 'var(--safe)' }}>
        💰 Cash Flow Projection
      </p>
      <dl className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted-2)' }}>Starting balance</dt>
          <dd className="font-medium" style={{ color: 'var(--parchment)' }}>₹{result.current_balance.toLocaleString()}</dd>
        </div>
        {result.timeline.map((entry, i) => (
          <div key={i} className="flex justify-between text-xs">
            <dt style={{ color: 'var(--muted)' }}>
              {entry.label} <span style={{ color: 'var(--muted-2)' }}>(day {entry.days_from_now})</span>
            </dt>
            <dd className="font-medium" style={{ color: entry.balance_after < 0 ? 'var(--risk-high)' : 'var(--parchment)' }}>
              ₹{entry.balance_after.toLocaleString()}
            </dd>
          </div>
        ))}
        <div className="pt-1.5 mt-1.5 flex justify-between text-xs" style={{ borderTop: '1px solid var(--border)' }}>
          <dt style={{ color: 'var(--muted-2)' }}>Income in</dt>
          <dd className="font-medium" style={{ color: 'var(--parchment)' }}>{result.days_to_income} days</dd>
        </div>
      </dl>
      {result.goes_negative && (
        <p className="text-[11px] mt-2 px-2 py-1 rounded" style={{ backgroundColor: 'rgba(225, 85, 74, 0.08)', color: 'var(--risk-high)' }}>
          ⚠️ Balance goes negative in {result.days_until_negative} days — shortfall of ₹{Math.abs(result.final_balance).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function LoanCostCard({ result }: { result: LoanResult }) {
  const costPct = ((result.extra_cost_over_principal / result.principal) * 100).toFixed(1);

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--risk-med)' }}>
        📊 True Loan Cost
      </p>
      <dl className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted-2)' }}>Principal</dt>
          <dd className="font-medium" style={{ color: 'var(--parchment)' }}>₹{result.principal.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted)' }}>Monthly EMI</dt>
          <dd className="font-medium" style={{ color: 'var(--parchment)' }}>₹{result.emi.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted)' }}>Total interest</dt>
          <dd className="font-medium" style={{ color: 'var(--risk-med)' }}>₹{result.total_interest.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted)' }}>Processing fee</dt>
          <dd className="font-medium" style={{ color: 'var(--risk-med)' }}>₹{result.processing_fee.toLocaleString()}</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted)' }}>Flat fees</dt>
          <dd className="font-medium" style={{ color: 'var(--risk-med)' }}>₹{result.flat_fees.toLocaleString()}</dd>
        </div>
        <div className="pt-1.5 mt-1.5 flex justify-between text-xs font-semibold" style={{ borderTop: '1px solid var(--border)' }}>
          <dt style={{ color: 'var(--risk-high)' }}>Extra cost over principal</dt>
          <dd style={{ color: 'var(--risk-high)' }}>₹{result.extra_cost_over_principal.toLocaleString()} (+{costPct}%)</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt style={{ color: 'var(--muted-2)' }}>Effective annual rate</dt>
          <dd className="font-bold" style={{ color: 'var(--risk-high)' }}>{result.effective_annual_rate}%</dd>
        </div>
      </dl>
    </div>
  );
}

function EscalationCard({ result }: { result: EscalationResult }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: result.escalated ? 'var(--risk-med)' : 'var(--safe)' }}>
        📱 Trusted Contact Escalation
      </p>
      {result.escalated ? (
        <div>
          <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--risk-med)' }}>
            ✅ Alert sent
          </p>
          <p className="text-[11px] font-mono leading-relaxed p-2 rounded" style={{ backgroundColor: 'var(--ink)', color: 'var(--muted)' }}>
            {result.message}
          </p>
        </div>
      ) : (
        <p className="text-[11px]" style={{ color: 'var(--safe)' }}>
          Risk too low to escalate. No alert sent.
        </p>
      )}
    </div>
  );
}

function AlternativeCard({ result }: { result: AlternativeResult }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--ink-2)', border: '1px solid var(--border)' }}>
      <p className="text-[10px] font-display font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--safe)' }}>
        ✅ Safe Alternative
      </p>
      <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--safe)' }}>
        {result.safe_channel}
      </p>
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
        {result.explanation}
      </p>
    </div>
  );
}
