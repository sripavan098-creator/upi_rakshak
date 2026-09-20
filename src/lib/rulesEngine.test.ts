import { describe, it, expect } from 'vitest';
import { analyzeMessage, type ThreatAnalysis } from '../lib/rulesEngine';

describe('Rules Engine - 2026 Taxonomy', () => {
  describe('Digital Arrest Scam Detection', () => {
    it('should detect CBI video call scam as HIGH risk', () => {
      const result = analyzeMessage('WhatsApp', 'CBI officer video call, digital arrest, money laundering verification');
      expect(result.level).toBe('HIGH');
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.reasons[0]).toHaveProperty('en');
      expect(result.reasons[0]).toHaveProperty('hi');
    });

    it('should detect police verification scam', () => {
      const result = analyzeMessage('SMS', 'Police officer calling for video verification. Virtual custody.');
      expect(result.level).toBe('HIGH');
    });
  });

  describe('APK Malware Detection', () => {
    it('should detect e-challan APK as HIGH risk', () => {
      const result = analyzeMessage('WhatsApp', 'Install this APK for traffic e-challan fine payment');
      expect(result.level).toBe('HIGH');
    });

    it('should detect wedding invitation APK', () => {
      const result = analyzeMessage('SMS', 'Download wedding invitation APK to view photos');
      expect(result.level).toBe('HIGH');
    });

    it('should detect unknown sources enablement', () => {
      const result = analyzeMessage('WhatsApp', 'Enable unknown sources to install the app');
      expect(result.level).toBe('HIGH');
    });
  });

  describe('Remote Access Scam Detection', () => {
    it('should detect AnyDesk installation request as HIGH risk', () => {
      const result = analyzeMessage('WhatsApp', 'Please install AnyDesk for screen share, we will help with KYC');
      expect(result.level).toBe('HIGH');
    });

    it('should detect TeamViewer scam', () => {
      const result = analyzeMessage('SMS', 'Install TeamViewer for remote support');
      expect(result.level).toBe('HIGH');
    });

    it('should detect screen sharing request', () => {
      const result = analyzeMessage('WhatsApp', 'Share your screen so we can verify your account');
      expect(result.level).toBe('HIGH');
    });
  });

  describe('Autopay Trap Detection', () => {
    it('should detect ₹1 verification trap as HIGH risk', () => {
      const result = analyzeMessage('SMS', 'Verify your account with ₹1 to activate subscription');
      expect(result.level).toBe('HIGH');
    });

    it('should detect autopay mandate setup', () => {
      const result = analyzeMessage('WhatsApp', 'Activate autopay for your subscription');
      expect(result.level).toBe('HIGH');
    });
  });

  describe('Receive Money Scam Detection', () => {
    it('should detect PIN for receiving money as HIGH risk', () => {
      const result = analyzeMessage('WhatsApp', 'Enter UPI PIN to receive your refund money');
      expect(result.level).toBe('HIGH');
    });

    it('should detect QR scan to receive as HIGH risk', () => {
      const result = analyzeMessage('SMS', 'Scan QR code to receive your cashback');
      expect(result.level).toBe('HIGH');
    });
  });

  describe('Urgency Manipulation Detection', () => {
    it('should detect urgency with disconnection threat', () => {
      const result = analyzeMessage('WhatsApp', 'URGENT: Electricity disconnected tonight, scan QR to pay');
      expect(result.level).toBe('HIGH');
    });

    it('should detect immediate action pressure', () => {
      const result = analyzeMessage('SMS', 'Act immediately or your account will be blocked');
      expect(result.level).toBe('MEDIUM');
    });
  });

  describe('Safe Message Detection', () => {
    it('should mark OTP message as SAFE', () => {
      const result = analyzeMessage('HDFC Bank', 'Your OTP is 123456. Do not share.');
      expect(result.level).toBe('SAFE');
    });

    it('should mark friend message as SAFE', () => {
      const result = analyzeMessage('WhatsApp', 'Hi, this is your friend, sending money');
      expect(result.level).toBe('SAFE');
    });

    it('should mark payment confirmation as SAFE', () => {
      const result = analyzeMessage('Bank Alert', 'Payment of ₹500 successful. Transaction ID: 12345');
      expect(result.level).toBe('SAFE');
    });
  });

  describe('Bilingual Output', () => {
    it('should provide English and Hindi reasons', () => {
      const result = analyzeMessage('WhatsApp', 'CBI officer video call, digital arrest');
      expect(result.reasons[0]).toHaveProperty('en');
      expect(result.reasons[0]).toHaveProperty('hi');
      expect(typeof result.reasons[0].en).toBe('string');
      expect(typeof result.reasons[0].hi).toBe('string');
      expect(result.reasons[0].en.length).toBeGreaterThan(0);
      expect(result.reasons[0].hi.length).toBeGreaterThan(0);
    });

    it('should provide bilingual suggested action', () => {
      const result = analyzeMessage('WhatsApp', 'Install AnyDesk for remote access');
      expect(result.suggestedAction).toHaveProperty('en');
      expect(result.suggestedAction).toHaveProperty('hi');
    });

    it('should provide bilingual official route for HIGH risk', () => {
      const result = analyzeMessage('WhatsApp', 'Digital arrest by CBI officer');
      expect(result.officialRoute).toBeDefined();
      expect(result.officialRoute).toHaveProperty('en');
      expect(result.officialRoute).toHaveProperty('hi');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      const result = analyzeMessage('', '');
      expect(result.level).toBe('SAFE');
      expect(result.reasons.length).toBe(0);
    });

    it('should handle message with only title', () => {
      const result = analyzeMessage('Alert', '');
      expect(result.level).toBe('SAFE');
    });

    it('should handle message with only text', () => {
      const result = analyzeMessage('', 'Some normal text');
      expect(result.level).toBe('SAFE');
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(10000);
      const result = analyzeMessage('Title', longMessage);
      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
    });
  });

  describe('Multiple Threat Vectors', () => {
    it('should detect multiple threats in one message', () => {
      const result = analyzeMessage(
        'WhatsApp',
        'CBI officer video call. Install AnyDesk for verification. Enter UPI PIN to receive refund.'
      );
      expect(result.level).toBe('HIGH');
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    });

    it('should prioritize HIGH risk when multiple threats detected', () => {
      const result = analyzeMessage(
        'SMS',
        'Digital arrest. Install APK. Act immediately.'
      );
      expect(result.level).toBe('HIGH');
    });
  });
});
