/**
 * UPI Rakshak — Audio & Haptic Feedback System
 * 
 * Synthesizes distinct procedural audio chimes using the Web Audio API
 * and triggers device vibration via navigator.vibrate().
 */

import { ThreatLevel } from './rulesEngine';

class SoundHapticService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private hapticsEnabled: boolean = true;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }

  /**
   * Play distinct notification sounds
   */
  public playSound(type: 'SAFE' | 'HIGH' | 'MEDIUM') {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'SAFE') {
        // Harmonious positive ascending two-tone chime (D5 -> A5)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        // 587.33Hz (D5)
        osc1.frequency.setValueAtTime(587.33, now);
        // 880Hz (A5)
        osc2.frequency.setValueAtTime(880.0, now + 0.1);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.15);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.45);
      } else if (type === 'HIGH') {
        // Urgent discordant two-tone alarm buzzer (staccato warning)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';

        // Rapid frequency jump: 880Hz -> 440Hz -> 880Hz -> 300Hz
        osc.frequency.setValueAtTime(780, now);
        osc.frequency.setValueAtTime(420, now + 0.08);
        osc.frequency.setValueAtTime(840, now + 0.18);
        osc.frequency.setValueAtTime(260, now + 0.28);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.setValueAtTime(0.05, now + 0.07);
        gain.gain.setValueAtTime(0.3, now + 0.17);
        gain.gain.setValueAtTime(0.05, now + 0.27);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.52);
      } else {
        // Medium risk / caution: Two neutral warning beeps
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Trigger haptic feedback matching Android HapticHelper
   */
  public triggerHaptics(level: ThreatLevel) {
    if (!this.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) {
      return;
    }

    try {
      if (level === 'HIGH') {
        // Waveform: [delay, vib, delay, vib, delay, long_vib]
        // Matches native Android HapticHelper: [0, 250, 100, 250, 100, 400]
        navigator.vibrate([200, 80, 200, 80, 350]);
      } else if (level === 'MEDIUM') {
        // Single moderate pulse
        navigator.vibrate([150]);
      } else if (level === 'SAFE') {
        // Gentle confirmation tap
        navigator.vibrate([50]);
      }
    } catch (e) {
      console.warn('Haptic trigger error:', e);
    }
  }

  /**
   * Combined trigger for scan result
   */
  public notifyScanResult(level: ThreatLevel) {
    this.playSound(level);
    this.triggerHaptics(level);
  }
}

export const soundHaptics = new SoundHapticService();
