import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { ThreatLevel } from '../lib/rulesEngine';

export interface StatusIndicatorProps {
  id?: string;
  score: number; // 0 - 100
  level: ThreatLevel; // 'SAFE' | 'MEDIUM' | 'HIGH'
  title?: string;
  subtitle?: string;
  reasons?: string[];
  suggestedAction?: string;
  officialRoute?: string;
  payeeAddress?: string;
  payeeName?: string;
  amount?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Status Indicator Component
 * 
 * Reflects the safety score of a scanned transaction using the color-coding defined in the CSS:
 * - safe: var(--safe) [#3FA796]
 * - risk-med: var(--warning) [#E8A33D]
 * - risk-high: var(--stamp-red) [#E1554A]
 */
export default function StatusIndicator({
  id = 'rakshak-status-indicator',
  score,
  level,
  title,
  subtitle,
  reasons = [],
  suggestedAction,
  officialRoute,
  payeeAddress,
  payeeName,
  amount,
  compact = false,
  className = '',
}: StatusIndicatorProps) {
  // Determine color variables based on threat level
  const statusConfig = {
    SAFE: {
      colorVar: 'var(--safe)',
      bgColor: 'rgba(63, 167, 150, 0.12)',
      borderColor: 'var(--safe)',
      badgeBg: 'var(--safe)',
      textColor: 'var(--safe)',
      label: 'SAFE TRANSACTION',
      icon: <ShieldCheck className="w-6 h-6 text-[var(--safe)]" />,
      smallIcon: <CheckCircle2 className="w-4 h-4 text-[var(--safe)]" />,
      pulseClass: '',
    },
    MEDIUM: {
      colorVar: 'var(--warning)',
      bgColor: 'rgba(232, 163, 61, 0.12)',
      borderColor: 'var(--warning)',
      badgeBg: 'var(--warning)',
      textColor: 'var(--warning)',
      label: 'SUSPICIOUS / CAUTION',
      icon: <AlertTriangle className="w-6 h-6 text-[var(--warning)]" />,
      smallIcon: <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />,
      pulseClass: '',
    },
    HIGH: {
      colorVar: 'var(--stamp-red)',
      bgColor: 'rgba(225, 85, 74, 0.14)',
      borderColor: 'var(--stamp-red)',
      badgeBg: 'var(--stamp-red)',
      textColor: 'var(--stamp-red)',
      label: 'CRITICAL FRAUD RISK',
      icon: <ShieldAlert className="w-6 h-6 text-[var(--stamp-red)]" />,
      smallIcon: <ShieldAlert className="w-4 h-4 text-[var(--stamp-red)]" />,
      pulseClass: 'risk-pulse',
    },
  }[level];

  // Circumference for the radial score gauge
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  if (compact) {
    return (
      <div
        id={id}
        className={`flex items-center gap-3 px-3.5 py-2 border ${statusConfig.pulseClass} ${className}`}
        style={{
          backgroundColor: statusConfig.bgColor,
          borderColor: statusConfig.borderColor,
        }}
        role="status"
        aria-live="polite"
      >
        <div className="flex-shrink-0">
          {statusConfig.smallIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: statusConfig.textColor }}>
            {statusConfig.label}
          </p>
          <p className="text-xs truncate text-[var(--paper)] opacity-90">
            {title || (level === 'SAFE' ? 'No threats detected' : 'Check payment details')}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="font-mono font-bold text-sm" style={{ color: statusConfig.textColor }}>
            {score}
          </span>
          <span className="text-[10px] text-[var(--paper-dark)]">/100</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className={`border-2 transition-all duration-300 p-5 ${statusConfig.pulseClass} ${className}`}
      style={{
        backgroundColor: statusConfig.bgColor,
        borderColor: statusConfig.borderColor,
      }}
      role="region"
      aria-label="Transaction Safety Status"
    >
      {/* Top Header: Score Gauge + Status Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(233, 231, 219, 0.18)]">
        <div className="flex items-center gap-3.5">
          {/* Radial score gauge */}
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-[rgba(233, 231, 219, 0.18)] opacity-30"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                stroke={statusConfig.colorVar}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-base leading-none" style={{ color: statusConfig.textColor }}>
                {score}
              </span>
              <span className="text-[9px] text-[var(--paper-dark)] font-mono leading-none mt-0.5">
                SCORE
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink)]"
                style={{ backgroundColor: statusConfig.badgeBg }}
              >
                {statusConfig.icon && <span className="scale-75 origin-left">{statusConfig.smallIcon}</span>}
                {statusConfig.label}
              </span>
            </div>
            <h3 className="font-bold text-base sm:text-lg text-[var(--paper)]">
              {title || (level === 'SAFE' ? 'Transaction Is Verified & Safe' : 'Safety Threat Detected')}
            </h3>
            {subtitle && (
              <p className="text-xs text-[var(--paper-dark)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Transaction Summary Pill */}
        {(payeeAddress || amount) && (
          <div className="bg-[var(--ink-light)] px-3.5 py-2 border border-[rgba(233, 231, 219, 0.18)] sm:text-right font-mono text-xs">
            {amount && (
              <p className="font-bold text-[var(--paper)]">
                Amount: <span className="text-[var(--seal-gold)]">₹{amount}</span>
              </p>
            )}
            {payeeAddress && (
              <p className="text-[var(--paper-dark)] truncate max-w-[200px]" title={payeeAddress}>
                VPA: {payeeAddress}
              </p>
            )}
            {payeeName && (
              <p className="text-[var(--paper-dark)] truncate max-w-[200px]" title={payeeName}>
                To: {payeeName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Detected Safety Reasons */}
      {reasons.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--paper-dark)] mb-2 flex items-center gap-1.5">
            <span>🛡️</span> Analysis Findings ({reasons.length})
          </p>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--paper)] bg-[var(--ink-light)] p-2.5 border border-[rgba(233, 231, 219, 0.18)]"
              >
                <span className="mt-0.5 flex-shrink-0" style={{ color: statusConfig.textColor }}>
                  {level === 'SAFE' ? '✓' : '⚠'}
                </span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Action & Official Route */}
      {(suggestedAction || officialRoute) && (
        <div className="mt-4 pt-3 border-t border-[rgba(233, 231, 219, 0.18)] flex flex-col sm:flex-row gap-3 text-xs">
          {suggestedAction && (
            <div className="flex-1 bg-[var(--ink-light)] p-3 border border-[rgba(233, 231, 219, 0.34)]">
              <span className="font-bold uppercase tracking-wide block mb-1" style={{ color: statusConfig.textColor }}>
                Recommended Action:
              </span>
              <p className="text-[var(--paper)] opacity-90 leading-relaxed">
                {suggestedAction}
              </p>
            </div>
          )}

          {officialRoute && (
            <div className="flex-1 bg-[var(--ink)] p-3 border border-[rgba(233, 231, 219, 0.18)]">
              <span className="text-[var(--seal-gold)] font-bold uppercase tracking-wide flex items-center gap-1 mb-1">
                Official Safe Channel <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <p className="text-[var(--paper-dark)] leading-relaxed">
                {officialRoute}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
