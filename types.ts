
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
  accountNumber: string; // Savings/Current Acc
  dpsAccountNumber?: string;
  mobileNumber: string;
  type: 'FDR' | 'DPS';
  accountCategory?: 'Retail' | 'Current';
  productName?: string;
  tenor?: number; // In months
  installmentAmount?: number;
  openingDate: string;
  maturityDate: string;
  endDate?: string;
  principalAmount: number; // For FDR or Total Deposit for DPS
  maturityAmount: number;
  totalInterest: number;
  interestRate?: number;
  status: 'Active' | 'Matured';
  loanOfficer?: string;
}

export interface DailySummary {
  totalCashIn: number;
  totalCashOut: number;
  netPosition: number;
  transactionCount: number;
}
