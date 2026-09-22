/**
 * UPI Rakshak — Threat Palette
 *
 * Single source of truth for how each threat level is coloured.
 * The scanner HUD, the status card, and any future surface read from here
 * so that a change to the palette never has to be repeated per component.
 */

import type { ThreatLevel } from './rulesEngine';

export interface ThreatTheme {
  /** CSS custom property for the accent colour. */
  accent: string;
  /** Translucent background, used for panels and badges. */
  tint: string;
  /** Short uppercase label for badges. */
  label: string;
}

export const THREAT_THEME: Record<ThreatLevel, ThreatTheme> = {
  HIGH: {
    accent: 'var(--stamp-red)',
    tint: 'rgba(225, 85, 74, 0.25)',
    label: 'CRITICAL FRAUD RISK',
  },
  MEDIUM: {
    accent: 'var(--warning)',
    tint: 'rgba(232, 163, 61, 0.25)',
    label: 'SUSPICIOUS / CAUTION',
  },
  SAFE: {
    accent: 'var(--safe)',
    tint: 'rgba(63, 167, 150, 0.25)',
    label: 'SAFE TRANSACTION',
  },
};
