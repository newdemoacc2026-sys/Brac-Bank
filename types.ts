
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

export interface Disbursement {
  id: string;
  accountTitle: string;
  accountNumber: string;
  mobileNumber: string;
  loanAmount: number;
  disbursementAmount: number;
  loanOfficer: string;
  date: string;
}

export interface FdrDps {
  id: string;
  accountTitle: string;
  accountNumber: string;
  mobileNumber: string;
  type: 'FDR' | 'DPS';
  openingDate: string;
  maturityDate: string;
  principalAmount: number;
  maturityAmount: number;
  totalInterest: number;
  status: 'Active' | 'Matured';
}

export interface DailySummary {
  totalCashIn: number;
  totalCashOut: number;
  netPosition: number;
  transactionCount: number;
}
