import jsPDF from 'jspdf';
import { CallEntry } from '../types';
import { calculateHours } from './calculations';
import { formatDate } from './export';
import { format } from 'date-fns';

export function generateInvoicePDF(
  entries: CallEntry[],
  dateRange: { start: string; end: string }
): void {
  const doc = new jsPDF();

  // Total amount: only count 75 and 30
  const totalAmount = entries.reduce((sum, entry) => {
    const fee = Number(entry.totalFee);
    return fee === 75 || fee === 30 ? sum + fee : sum;
  }, 0);

  // === Header ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BAJWA BOC24 LTD', 20, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Immediate Medical Support, Wherever You Are', 20, 28);
  doc.setFontSize(10);
  doc.text('Corporate Tax No: 4083158R', 20, 35);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 20);

  // === Invoice To ===
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice To:', 120, 35);
  doc.setFont('helvetica', 'bold');
  doc.text('24DOC', 120, 45);

  // === Invoice Details ===
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice Date:', 120, 60);
  doc.text(format(new Date(), 'dd/MM/yyyy'), 120, 70);
  doc.text('Period:', 120, 80);
  doc.text(`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 120, 90);

  // === Table Header ===
  const startY = 110;
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 20, startY);
  doc.text('Station', 50, startY);
  doc.text('Time', 80, startY);
  doc.text('Type', 100, startY);
  doc.text('Hours', 130, startY);
  doc.line(20, startY + 2, 190, startY + 2);

  // === Table Content ===
  doc.setFont('helvetica', 'normal');
  let currentY = startY + 10;

  entries.forEach((entry) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }

    const hours = calculateHours(entry.manualHours, entry.fixedCharge);

    doc.text(formatDate(entry.date), 20, currentY);
    doc.text(entry.callFrom.substring(0, 15), 50, currentY);
    doc.text(entry.callTime, 80, currentY);
    doc.text(entry.callType, 100, currentY);
    doc.text(`${hours.toFixed(1)}h`, 130, currentY);

    currentY += 8;
  });

  // === Summary ===
  currentY += 10;
  doc.line(20, currentY, 190, currentY);
  currentY += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SUMMARY', 20, currentY);
  currentY += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Total Calls: ${entries.length}`, 20, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOTAL AMOUNT: €${totalAmount.toFixed(2)}`, 20, currentY + 10);

  // === Bank Details ===
  currentY += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Bank Details:', 20, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.text('Account Name :  BAJWA BOC24 LTD', 20, currentY);
  currentY += 7;
  doc.text('Bank         :  Bank of Ireland', 20, currentY);
  currentY += 7;
  doc.text('IBAN         :  IE42 BOFI 9028 8894 3682 78', 20, currentY);
  currentY += 7;
  doc.text('BIC          :  BOFIIE2D', 20, currentY);

  // === Issued By ===
  doc.setFont('helvetica', 'bold');
  doc.text('Issued By:', 130, currentY - 21);
  doc.setFont('helvetica', 'normal');
  doc.text('Mehak Bucha', 130, currentY - 13);
  doc.text('Secretary, BAJWA BOC24 LTD', 130, currentY - 6);

  // === Save PDF ===
  const fileName = `invoice-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
