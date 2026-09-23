/**
 * UPI Rakshak — Demo QR fixtures
 *
 * Realistic UPI deep links used to exercise the scanner without a camera.
 * These are inert strings; nothing is dialled, paid, or fetched.
 */

export type QrScenarioType = 'HIGH_RISK' | 'MEDIUM_RISK' | 'SAFE';

export interface QrScenario {
  id: string;
  title: string;
  type: QrScenarioType;
  description: string;
  payload: string;
}

export const SAMPLE_UPI_QR_SCENARIOS: QrScenario[] = [
  {
    id: 'scam-electricity',
    title: '🚨 Electricity Disconnection Scam',
    type: 'HIGH_RISK',
    description: 'Fake BSES support demanding payment to prevent immediate meter disconnection',
    payload:
      'upi://pay?pa=bsescare@icici&pn=BSES%20Electricity%20Support&am=2499&tn=Disconnection%20fine%20refund%20scan%20QR%20enter%20PIN',
  },
  {
    id: 'scam-lottery',
    title: '🚨 Lottery Prize Reversal Trap',
    type: 'HIGH_RISK',
    description: 'Fraudulent voucher tricking user to enter PIN to "claim" ₹10,000 lottery winnings',
    payload:
      'upi://pay?pa=refundcare@paytm&pn=Lucky%20Cash%20Claim&am=499&tn=Pay%20processing%20charge%20to%20receive%2010000%20prize',
  },
  {
    id: 'scam-kyc',
    title: '⚠️ Unofficial KYC Verification',
    type: 'MEDIUM_RISK',
    description: 'Personal VPA handle attempting account reactivation with artificial urgency',
    payload:
      'upi://pay?pa=paytm.kyc.verify@okhdfcbank&pn=Paytm%20KYC%20Help&am=1&tn=Verify%20KYC%20urgent%20within%2024%20hours',
  },
  {
    id: 'safe-kirana',
    title: '🛡️ Verified Grocery Merchant',
    type: 'SAFE',
    description: 'Authentic corner store BharatQR with valid MCC (Merchant Category Code 5411)',
    payload: 'upi://pay?pa=sharmastore@okhdfcbank&pn=Sharma%20General%20Store&am=185&tn=Grocery%20bill&mc=5411',
  },
  {
    id: 'safe-bbps',
    title: '🛡️ Official BSES Utility Payment',
    type: 'SAFE',
    description: 'Legitimate registered BBPS electricity utility provider QR code',
    payload:
      'upi://pay?pa=bsesdelhi@sbi&pn=BSES%20Rajdhani%20Power%20Ltd&am=1420&tn=Bill%201039482938&mc=4900',
  },
];
