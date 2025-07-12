import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { CallEntry } from '../types';
import { generateInvoicePDF } from '../utils/pdf';
import { exportToCSV, formatCurrency } from '../utils/export';
import { calculateTotals } from '../utils/calculations';
import { StorageService } from '../utils/storage';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface InvoiceGeneratorProps {
  entries: CallEntry[];
}

export function InvoiceGenerator({ entries }: InvoiceGeneratorProps) {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleMonthChange = (monthValue: string) => {
    setSelectedMonth(monthValue);
    const date = new Date(monthValue + '-01');
    setDateRange({
      start: format(startOfMonth(date), 'yyyy-MM-dd'),
      end: format(endOfMonth(date), 'yyyy-MM-dd'),
    });
  };

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const { totalAmount, totalHours } = calculateTotals(filteredEntries);
  const settings = StorageService.loadSettings();

  const handleGeneratePDF = () => {
    if (filteredEntries.length === 0) {
      alert('No entries found for the selected date range.');
      return;
    }
    generateInvoicePDF(filteredEntries, settings.doctorInfo, dateRange);
  };

  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      alert('No entries found for the selected date range.');
      return;
    }
    exportToCSV(filteredEntries);
  };

  const getQuickDateRanges = () => {
    const now = new Date();
    return [
      {
        label: 'This Month',
        value: format(now, 'yyyy-MM'),
      },
      {
        label: 'Last Month',
        value: format(subMonths(now, 1), 'yyyy-MM'),
      },
      {
        label: '2 Months Ago',
        value: format(subMonths(now, 2), 'yyyy-MM'),
      },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invoice Generator</h2>
            <p className="text-sm text-gray-500">Generate PDF invoices and export data</p>
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Select Period</span>
          </div>

          {/* Quick Month Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {getQuickDateRanges().map((range) => (
              <button
                key={range.value}
                onClick={() => handleMonthChange(range.value)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-150 ${
                  selectedMonth === range.value
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Period Summary</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Entries</div>
            <div className="text-2xl font-bold text-gray-900">{filteredEntries.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Hours</div>
            <div className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Avg per Call</div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredEntries.length > 0 ? formatCurrency(totalAmount / filteredEntries.length) : '€0.00'}
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="text-sm text-emerald-600">Total Amount</div>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAmount)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleGeneratePDF}
            disabled={filteredEntries.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate PDF Invoice</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={filteredEntries.length === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {filteredEntries.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No entries found for the selected date range. Please adjust your date selection or add some call entries first.
            </p>
          </div>
        )}
      </div>

      {/* Recent Entries Preview */}
      {filteredEntries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Entries in Selected Period</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredEntries.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{entry.callFrom}</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(entry.date), 'dd/MM/yyyy')} • {entry.callTime} • {entry.numberOfPatients} patient{entry.numberOfPatients !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatCurrency(entry.totalFee)}</div>
                  {format(new Date(entry.date), 'dd/MM/yyyy')} • {entry.callTime}
                </div>
              </div>
            ))}
            {filteredEntries.length > 10 && (
              <div className="text-center py-2 text-sm text-gray-500">
                ... and {filteredEntries.length - 10} more entries
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}