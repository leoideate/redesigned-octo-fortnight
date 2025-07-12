import { CallEntry } from '../types';

export const HOURLY_RATE = 55.55;
export const FIXED_CHARGES = {
  STANDARD_75: 75,
  STANDARD_30: 30,
} as const;

export function calculateFee(manualHours?: number, fixedCharge?: number): number {
  // If fixed charge is specified, use that
  if (fixedCharge && fixedCharge > 0) {
    return fixedCharge;
  }
  
  // Otherwise use hourly calculation
  if (manualHours && manualHours > 0) {
    return manualHours * HOURLY_RATE;
  }
  
  // Default to 1 hour at standard rate
  return HOURLY_RATE;
}

export function calculateHours(manualHours?: number, fixedCharge?: number): number {
  // If fixed charge is used, hours don't apply
  if (fixedCharge && fixedCharge > 0) {
    return 0;
  }
  
  if (manualHours && manualHours > 0) {
    return manualHours;
  }
  
  // Default to 1 hour
  return 1;
}

export function calculateTotals(entries: CallEntry[]) {
  const totalAmount = entries.reduce((sum, entry) => sum + entry.totalFee, 0);
  const totalHours = entries.reduce((sum, entry) => {
    return sum + calculateHours(entry.manualHours, entry.fixedCharge);
  }, 0);
  
  return { totalAmount, totalHours };
}