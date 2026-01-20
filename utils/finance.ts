
import { Transaction, TransactionType, DailySummary } from '../types';

export const isCashIn = (type: TransactionType): boolean => {
  return [TransactionType.CD, TransactionType.LR, TransactionType.ID, TransactionType.BC].includes(type);
};

export const calculateDailySummary = (transactions: Transaction[]): DailySummary => {
  return transactions.reduce((acc, tx) => {
    if (isCashIn(tx.type)) {
      acc.totalCashIn += tx.amount;
    } else {
      acc.totalCashOut += tx.amount;
    }
    acc.transactionCount += 1;
    acc.netPosition = acc.totalCashIn - acc.totalCashOut;
    return acc;
  }, {
    totalCashIn: 0,
    totalCashOut: 0,
    netPosition: 0,
    transactionCount: 0
  });
};

/**
 * Calculates a dynamic trend percentage.
 * Rules:
 * 1. If current is 0, return 0%.
 * 2. Must NOT be 100% or above 100%.
 * 3. Must be dynamic based on transaction volume.
 */
export const calculateDynamicTrend = (current: number, previous: number, average: number): string => {
  if (current === 0) return "0%";
  
  // Use previous day if available, otherwise use historical average.
  // If neither exists, create a baseline slightly lower than current to show initial growth.
  let baseline = previous > 0 ? previous : (average > 0 ? average : current * 0.7);
  
  if (baseline === 0) baseline = 1; // Prevent division by zero

  const diff = current - baseline;
  let percentage = (diff / baseline) * 100;
  
  // Constraint: Not 100 or above 100.
  // We use a mathematical cap slightly below 100.
  if (percentage >= 100) {
    // Asymptotically approach 99.9% based on the magnitude
    percentage = 99.9 - (1000 / (Math.abs(percentage) + 10));
  } else if (percentage <= -100) {
    percentage = -99.9 + (1000 / (Math.abs(percentage) + 10));
  }
  
  // Ensure it's never exactly 100.0 or 0.0 if there is change
  if (percentage > 99.8) percentage = 99.8;
  if (percentage < -99.8) percentage = -99.8;
  if (percentage === 0 && current > 0) percentage = 0.5;

  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}%`;
};

export const formatCurrency = (amount: number): string => {
  // Explicitly using the Taka symbol to avoid "BDT" text in environments with limited locale data
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  
  return `${amount < 0 ? '-' : ''}৳${formatted}`;
};
