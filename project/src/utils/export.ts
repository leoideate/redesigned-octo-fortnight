import { CallEntry } from '../types';
import { calculateHours, FIXED_CHARGES } from './calculations';
import { format } from 'date-fns';

export function exportToCSV(entries: CallEntry[]): void {
  const headers = [
    'Date',
    'Call From',
    'Call Time',
    'Arrival Time',
    'Call Type',
    'Hours',
    'Charge Type',
    'Rate/Fixed (€)',
    'Total (€)'
  ];

  const csvContent = [
    headers.join(','),
    ...entries.map(entry => [
      entry.date,
      `"${entry.callFrom}"`,
      entry.callTime,
      entry.arrivalTime || '',
      `"${entry.callType}"`,
      calculateHours(entry.manualHours, entry.fixedCharge).toFixed(2),
      entry.fixedCharge ? `"Fixed €${entry.fixedCharge}"` : '"Hourly"',
      entry.fixedCharge ? entry.fixedCharge.toFixed(2) : '55.55',
      entry.totalFee.toFixed(2)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `doctor-calls-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy');
}

export function formatTime(timeString: string): string {
  return timeString;
}