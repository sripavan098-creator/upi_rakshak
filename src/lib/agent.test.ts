import { describe, it, expect } from 'vitest';
import { runAgent, type AgentResult } from '../lib/agent';

describe('Agent Loop', () => {
  it('should detect HIGH risk scam and provide bilingual output', () => {
    const context = {
      message_text: 'CBI officer video call, digital arrest, money laundering verification',
      current_balance: 8500,
      upcoming_expenses: [
        { label: 'Rent', amount: 7000, days_from_now: 3 },
      ],
      days_to_next_income: 12,
      loan: null,
    };

    const result = runAgent(context);
    
    expect(result).toBeDefined();
    expect(result.final_answer).toBeDefined();
    expect(result.trace).toBeDefined();
    expect(result.trace.length).toBeGreaterThan(0);
    
    // Should have bilingual output
    expect(result.final_answer).toContain('Yeh message fraud hai');
    expect(result.final_answer).toContain('This message is a scam');
  });

  it('should analyze cash flow and detect shortfall', () => {
    const context = {
      message_text: 'Normal message from friend',
      current_balance: 5000,
      upcoming_expenses: [
        { label: 'Rent', amount: 7000, days_from_now: 3 },
        { label: 'Electricity', amount: 2000, days_from_now: 5 },
      ],
      days_to_next_income: 15,
      loan: null,
    };

    const result = runAgent(context);
    
    expect(result).toBeDefined();
    expect(result.final_answer).toBeDefined();
    // Should mention cash flow shortfall
    expect(result.final_answer.toLowerCase()).toContain('cash flow');
  });

  it('should compute true loan cost when loan is present', () => {
    const context = {
      message_text: 'Normal message',
      current_balance: 8500,
      upcoming_expenses: [
        { label: 'Rent', amount: 7000, days_from_now: 3 },
      ],
      days_to_next_income: 12,
      loan: {
        principal: 10000,
        annual_interest_rate_pct: 36,
        tenure_months: 3,
        processing_fee_pct: 5,
        other_flat_fees: 200,
      },
    };

    const result = runAgent(context);
    
    expect(result).toBeDefined();
    expect(result.final_answer).toBeDefined();
    // Should mention loan cost
    expect(result.final_answer.toLowerCase()).toContain('loan');
  });

  it('should follow observe-decide-act-evaluate-adapt loop', () => {
    const context = {
      message_text: 'URGENT: Scan QR to receive refund',
      current_balance: 8500,
      upcoming_expenses: [],
      days_to_next_income: 10,
      loan: null,
    };

    const result = runAgent(context);
    
    expect(result.trace).toBeDefined();
    
    // Should have observe phase
    const observePhase = result.trace.find(t => t.phase === 'observe');
    expect(observePhase).toBeDefined();
    
    // Should have decide phase
    const decidePhase = result.trace.find(t => t.phase === 'decide');
    expect(decidePhase).toBeDefined();
    
    // Should have act phase
    const actPhase = result.trace.find(t => t.phase === 'act');
    expect(actPhase).toBeDefined();
    
    // Should have evaluate phase
    const evaluatePhase = result.trace.find(t => t.phase === 'evaluate');
    expect(evaluatePhase).toBeDefined();
    
    // Should have decide_final phase
    const finalPhase = result.trace.find(t => t.phase === 'decide_final');
    expect(finalPhase).toBeDefined();
  });

  it('should handle safe messages correctly', () => {
    const context = {
      message_text: 'Hi, this is your friend',
      current_balance: 10000,
      upcoming_expenses: [],
      days_to_next_income: 5,
      loan: null,
    };

    const result = runAgent(context);
    
    expect(result).toBeDefined();
    expect(result.final_answer).toBeDefined();
    // Should indicate no scam detected
    expect(result.final_answer.toLowerCase()).toContain('safe');
  });

  it('should adapt when cash flow is negative even without scam', () => {
    const context = {
      message_text: 'Normal message',
      current_balance: 3000,
      upcoming_expenses: [
        { label: 'Rent', amount: 8000, days_from_now: 2 },
      ],
      days_to_next_income: 15,
      loan: {
        principal: 10000,
        annual_interest_rate_pct: 30,
        tenure_months: 3,
        processing_fee_pct: 0,
        other_flat_fees: 0,
      },
    };

    const result = runAgent(context);
    
    expect(result).toBeDefined();
    // Should have adapt phase when shortfall detected
    const adaptPhase = result.trace.find(t => t.phase === 'adapt');
    expect(adaptPhase).toBeDefined();
  });
});
