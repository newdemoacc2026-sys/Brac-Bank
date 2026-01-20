
export enum TransactionType {
  CD = 'CD', // Cash Deposit
  LR = 'LR', // Loan Recovery
  ID = 'ID', // Interest Deposit
  BC = 'BC', // Bank Commission
  CW = 'CW', // Cash Withdrawal
  LD = 'LD'  // Loan Disbursement
}

export type TransactionStatus = 'Success' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
}

export interface DailySummary {
  totalCashIn: number;
  totalCashOut: number;
  netPosition: number;
  transactionCount: number;
}
