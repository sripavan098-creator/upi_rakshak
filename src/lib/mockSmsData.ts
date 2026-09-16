/**
 * UPI Rakshak — Mock SMS Data
 * 
 * Simulated bank SMS history for cash flow analysis demo.
 * Realistic Indian bank transaction messages.
 */

export interface SmsEntry {
  date: string;
  sender: string;
  message: string;
  amount?: number;
  type: 'credit' | 'debit' | 'info';
}

export const MOCK_SMS_HISTORY: SmsEntry[] = [
  {
    date: '2025-01-01',
    sender: 'HDFC Bank',
    message: 'Your a/c XX1234 credited with Rs 35000 on 01-01-2025 towards SALARY. Available balance: Rs 42,500',
    amount: 35000,
    type: 'credit',
  },
  {
    date: '2025-01-05',
    sender: 'HDFC Bank',
    message: 'Rs 12000 debited from a/c XX1234 on 05-01-2025 towards RENT PAYMENT. Available balance: Rs 30,500',
    amount: 12000,
    type: 'debit',
  },
  {
    date: '2025-01-07',
    sender: 'HDFC Bank',
    message: 'Rs 1200 debited from a/c XX1234 on 07-01-2025 at BIGBASKET. Available balance: Rs 29,300',
    amount: 1200,
    type: 'debit',
  },
  {
    date: '2025-01-10',
    sender: 'HDFC Bank',
    message: 'Rs 2400 debited from a/c XX1234 on 10-01-2025 towards BSES ELECTRICITY. Available balance: Rs 26,900',
    amount: 2400,
    type: 'debit',
  },
  {
    date: '2025-01-12',
    sender: 'HDFC Bank',
    message: 'Rs 800 debited from a/c XX1234 on 12-01-2025 at DMART. Available balance: Rs 26,100',
    amount: 800,
    type: 'debit',
  },
  {
    date: '2025-01-15',
    sender: 'HDFC Bank',
    message: 'Rs 4500 debited from a/c XX1234 on 15-01-2025 towards EMI for personal loan. Available balance: Rs 21,600',
    amount: 4500,
    type: 'debit',
  },
  {
    date: '2025-01-16',
    sender: 'HDFC Bank',
    message: 'Rs 299 debited from a/c XX1234 on 16-01-2025 towards JIO RECHARGE. Available balance: Rs 21,301',
    amount: 299,
    type: 'debit',
  },
  {
    date: '2025-01-18',
    sender: 'HDFC Bank',
    message: 'Rs 1500 debited from a/c XX1234 on 18-01-2025 at SWIGGY. Available balance: Rs 19,801',
    amount: 1500,
    type: 'debit',
  },
  {
    date: '2025-01-20',
    sender: 'HDFC Bank',
    message: 'Rs 2000 debited from a/c XX1234 on 20-01-2025 at AMAZON. Available balance: Rs 17,801',
    amount: 2000,
    type: 'debit',
  },
  {
    date: '2025-01-22',
    sender: 'UNKNOWN',
    message: 'URGENT: Your KYC is blocked. Click here to verify immediately or account will be suspended: http://sbi-verify.online',
    type: 'info',
  },
  {
    date: '2025-01-23',
    sender: 'HDFC Bank',
    message: 'Rs 600 debited from a/c XX1234 on 23-01-2025 at UBER. Available balance: Rs 17,201',
    amount: 600,
    type: 'debit',
  },
  {
    date: '2025-01-25',
    sender: 'HDFC Bank',
    message: 'Rs 1800 debited from a/c XX1234 on 25-01-2025 at ZOMATO. Available balance: Rs 15,401',
    amount: 1800,
    type: 'debit',
  },
  {
    date: '2025-01-27',
    sender: 'HDFC Bank',
    message: 'Rs 900 debited from a/c XX1234 on 27-01-2025 at MEDPLUS. Available balance: Rs 14,501',
    amount: 900,
    type: 'debit',
  },
  {
    date: '2025-01-28',
    sender: 'HDFC Bank',
    message: 'Rs 1100 debited from a/c XX1234 on 28-01-2025 at RELIANCE SMART. Available balance: Rs 13,401',
    amount: 1100,
    type: 'debit',
  },
  {
    date: '2025-01-30',
    sender: 'HDFC Bank',
    message: 'Rs 700 debited from a/c XX1234 on 30-01-2025 at IRCTC. Available balance: Rs 12,701',
    amount: 700,
    type: 'debit',
  },
];

export interface CashFlowAnalysis {
  income: number;
  expenses: number;
  recurringExpenses: { name: string; amount: number; day: number }[];
  balance: number;
  daysUntilShortfall: number | null;
}

/**
 * Parse SMS history and calculate cash flow metrics.
 */
export function parseSmsHistory(): CashFlowAnalysis {
  let income = 0;
  let expenses = 0;
  const recurringMap = new Map<string, { amount: number; day: number }>();

  for (const sms of MOCK_SMS_HISTORY) {
    if (sms.type === 'credit' && sms.amount) {
      income += sms.amount;
    } else if (sms.type === 'debit' && sms.amount) {
      expenses += sms.amount;

      // Detect recurring expenses
      const day = parseInt(sms.date.split('-')[2]);
      if (sms.message.includes('RENT')) {
        recurringMap.set('Rent', { amount: sms.amount, day });
      } else if (sms.message.includes('EMI')) {
        recurringMap.set('Loan EMI', { amount: sms.amount, day });
      } else if (sms.message.includes('ELECTRICITY') || sms.message.includes('BSES')) {
        recurringMap.set('Electricity', { amount: sms.amount, day });
      }
    }
  }

  const recurringExpenses = Array.from(recurringMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));

  // Get current balance from last SMS
  const lastSms = MOCK_SMS_HISTORY[MOCK_SMS_HISTORY.length - 1];
  const balanceMatch = lastSms.message.match(/Available balance: Rs ([\d,]+)/);
  const balance = balanceMatch ? parseInt(balanceMatch[1].replace(/,/g, '')) : 0;

  // Calculate daily spend rate
  const totalDays = 30;
  const dailySpend = expenses / totalDays;

  // Calculate days until shortfall
  let daysUntilShortfall: number | null = null;
  if (dailySpend > 0) {
    daysUntilShortfall = Math.floor(balance / dailySpend);
  }

  return {
    income,
    expenses,
    recurringExpenses,
    balance,
    daysUntilShortfall,
  };
}
