import React, { useState } from 'react';
import { Search, Edit2, Trash2, Clock, Users, MapPin } from 'lucide-react';
import { CallEntry } from '../types';
import { formatCurrency, formatDate } from '../utils/export';
import { calculateHours, FIXED_CHARGES } from '../utils/calculations';

interface CallEntriesListProps {
  entries: CallEntry[];
  onEditEntry: (entry: CallEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export function CallEntriesList({ entries, onEditEntry, onDeleteEntry }: CallEntriesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'callFrom' | 'totalFee'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredEntries = entries.filter(entry =>
    entry.callFrom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.callType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.includes(searchTerm)
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalAmount = entries.reduce((sum, entry) => sum + entry.totalFee, 0);
  const totalHours = entries.reduce((sum, entry) => sum + calculateHours(entry.manualHours, entry.fixedCharge), 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Call Entries</h2>
            <p className="text-sm text-gray-500">{entries.length} total entries</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64"
              />
            </div>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="callFrom-asc">Station (A-Z)</option>
              <option value="callFrom-desc">Station (Z-A)</option>
              <option value="totalFee-desc">Amount (High-Low)</option>
              <option value="totalFee-asc">Amount (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {totalHours.toFixed(1)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Total Calls</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {entries.length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Total Amount</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="divide-y divide-gray-200">
        {sortedEntries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Add your first call entry to get started.'}
            </p>
          </div>
        ) : (
          sortedEntries.map((entry) => (
            <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.callFrom}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(entry.date)} • {entry.callTime}
                        {entry.arrivalTime && ` → ${entry.arrivalTime}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {entry.callType}
                    </span>
                    {entry.fixedCharge ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Fixed Charge €{entry.fixedCharge}
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{calculateHours(entry.manualHours, entry.fixedCharge).toFixed(1)} hours</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(entry.totalFee)}
                    </div>
                    {entry.manualHours && !entry.fixedCharge && (
                      <div className="text-xs text-orange-600">Manual hours</div>
                    )}
                    {entry.fixedCharge && (
                      <div className="text-xs text-purple-600">Fixed charge</div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                      title="Edit entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this entry?')) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}