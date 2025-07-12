import jsPDF from 'jspdf';
import { CallEntry, InvoiceData } from '../types';
import { calculateHours, calculateTotals, FIXED_CHARGES } from './calculations';
import { formatCurrency, formatDate } from './export';
import { format } from 'date-fns';

export function generateInvoicePDF(entries: CallEntry[], doctorInfo: any, dateRange: { start: string; end: string }): void {
  const doc = new jsPDF();
  const { totalAmount, totalHours } = calculateTotals(entries);
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL SERVICES INVOICE', 20, 30);
  
  // Doctor Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('From:', 20, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(doctorInfo.name, 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(doctorInfo.address, 20, 70);
  doc.text(doctorInfo.phone, 20, 80);
  doc.text(doctorInfo.email, 20, 90);
  
  // Invoice Details
  doc.text('Invoice Date:', 120, 50);
  doc.text(format(new Date(), 'dd/MM/yyyy'), 120, 60);
  doc.text('Period:', 120, 70);
  doc.text(`${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 120, 80);
  
  // Table Header
  const startY = 110;
  doc.setFont('helvetica', 'bold');
  doc.text('Date', 20, startY);
  doc.text('Station', 50, startY);
  doc.text('Time', 80, startY);
  doc.text('Type', 100, startY);
  doc.text('Hrs/Fixed', 120, startY);
  doc.text('Amount', 150, startY);
  
  // Draw line under header
  doc.line(20, startY + 2, 170, startY + 2);
  
  // Table Content
  doc.setFont('helvetica', 'normal');
  let currentY = startY + 10;
  
  entries.forEach((entry, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 30;
    }
    
    const hours = calculateHours(entry.manualHours, entry.fixedCharge);
    const chargeDisplay = entry.fixedCharge ? `€${entry.fixedCharge}` : `${hours.toFixed(1)}h`;
    
    doc.text(formatDate(entry.date), 20, currentY);
    doc.text(entry.callFrom.substring(0, 15), 50, currentY);
    doc.text(entry.callTime, 80, currentY);
    doc.text(entry.callType, 100, currentY);
    doc.text(chargeDisplay, 120, currentY);
    doc.text(formatCurrency(entry.totalFee), 150, currentY);
    
    currentY += 8;
  });
  
  // Summary
  currentY += 10;
  doc.line(20, currentY, 190, currentY);
  currentY += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', 20, currentY);
  currentY += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Calls: ${entries.length}`, 20, currentY);
  currentY += 8;
  if (totalHours > 0) {
    doc.text(`Total Hours: ${totalHours.toFixed(1)}`, 20, currentY);
    currentY += 8;
  }
  
  const fixedChargeEntries = entries.filter(e => e.fixedCharge);
  if (fixedChargeEntries.length > 0) {
    doc.text(`Fixed Charges: ${fixedChargeEntries.length}`, 20, currentY);
  currentY += 8;
  }
  
  if (totalHours > 0) {
    doc.text(`Hourly Rate: €55.55`, 20, currentY);
  currentY += 8;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOTAL AMOUNT: ${formatCurrency(totalAmount)}`, 20, currentY + 10);
  
  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Terms: Net 30 days', 20, 280);
  doc.text('Thank you for your business', 20, 290);
  
  // Save the PDF
  const fileName = `invoice-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}