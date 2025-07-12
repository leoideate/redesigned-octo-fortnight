import React, { useState } from 'react';
import { Plus, Calculator, MapPin } from 'lucide-react';
import { CallEntry } from '../types';
import { calculateFee, FIXED_CHARGES } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

interface CallEntryFormProps {
  onAddEntry: (entry: CallEntry) => void;
}

const CALL_TYPES = [
  'MHA',
  'S4DD',
  'SOM',
  'HAM',
  'METHADONE',
  'INJ',
  'PW2'
];

const PREDEFINED_STATIONS = [
  'ABBEYLEIX',
  'ASHBOURNE',
  'ATHLONE',
  'ATHY',
  'BALTINGLAS',
  'BALLYMUN',
  'BANGLESTOWN',
  'BIRR',
  'CARLOW',
  'CLONMEL',
  'COLLEGE',
  'DUNGARVAN',
  'EDENDERRY',
  'ENNISCORTHY',
  'GOREY',
  'HSGS',
  'KK',
  'KILDARE',
  'KILKENNY',
  'LONGFORD',
  'MULLINGAR',
  'NAAS',
  'NB',
  'NEWROSS',
  'PL',
  'PL COURT',
  'PL HOSP',
  'PS',
  'SS',
  'ST. LUKE\'S HOSP',
  'THURLES',
  'TM',
  'TM HOSP',
  'TRAMORE',
  'WATERFORD',
  'WEXFORD'
];

const CHARGE_TYPES = [
  { value: 'hourly', label: 'Hourly Rate (€55.55/hour)', description: 'Standard hourly billing' },
  { value: 'fixed_75', label: 'Fixed Charge €75', description: 'Non-hourly fixed rate' },
  { value: 'fixed_30', label: 'Fixed Charge €30', description: 'Non-hourly fixed rate' },
];
export function CallEntryForm({ onAddEntry }: CallEntryFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    callFrom: '',
    customStation: '',
    useCustomStation: false,
    callTime: '',
    arrivalTime: '',
    callType: 'MHA',
    manualHours: '',
    chargeType: 'hourly',
  });

  const [calculatedFee, setCalculatedFee] = useState(55.55);

  const handleStationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setFormData({ ...formData, useCustomStation: true, callFrom: '' });
    } else {
      setFormData({ ...formData, useCustomStation: false, callFrom: value, customStation: '' });
    }
  };

  const handleCustomStationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, customStation: value, callFrom: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Recalculate fee when relevant fields change
    if (name === 'manualHours' || name === 'chargeType') {
      recalculateFee(newFormData);
    }
  };

  const recalculateFee = (data: typeof formData) => {
    let fixedCharge: number | undefined;
    
    if (data.chargeType === 'fixed_75') {
      fixedCharge = FIXED_CHARGES.STANDARD_75;
    } else if (data.chargeType === 'fixed_30') {
      fixedCharge = FIXED_CHARGES.STANDARD_30;
    }
    
    if (data.chargeType === 'hourly') {
      const hours = value ? parseFloat(value) : undefined;
      setCalculatedFee(calculateFee(hours, undefined));
    } else {
      setCalculatedFee(calculateFee(undefined, fixedCharge));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stationName = formData.useCustomStation ? formData.customStation : formData.callFrom;
    
    if (!stationName.trim() || !formData.callTime) {
      alert('Please fill in all required fields');
      return;
    }

    let fixedCharge: number | undefined;
    if (formData.chargeType === 'fixed_75') {
      fixedCharge = FIXED_CHARGES.STANDARD_75;
    } else if (formData.chargeType === 'fixed_30') {
      fixedCharge = FIXED_CHARGES.STANDARD_30;
    }

    const entry: CallEntry = {
      id: uuidv4(),
      date: formData.date,
      callFrom: stationName.trim(),
      callTime: formData.callTime,
      arrivalTime: formData.arrivalTime || undefined,
      callType: formData.callType,
      manualHours: formData.manualHours ? parseFloat(formData.manualHours) : undefined,
      fixedCharge,
      totalFee: calculatedFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddEntry(entry);
    
    // Reset form but keep date
    setFormData({
      ...formData,
      callFrom: '',
      customStation: '',
      useCustomStation: false,
      callTime: '',
      arrivalTime: '',
      manualHours: '',
      chargeType: 'hourly',
    });
    setCalculatedFee(55.55);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Plus className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">New Call Entry</h2>
          <p className="text-sm text-gray-500">Add a new on-call visit</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Call From (Station) *</span>
              </div>
            </label>
            {!formData.useCustomStation ? (
              <select
                value={formData.callFrom}
                onChange={handleStationChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select a station...</option>
                {PREDEFINED_STATIONS.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
                <option value="custom">+ Add Custom Station</option>
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.customStation}
                  onChange={handleCustomStationChange}
                  placeholder="Enter custom station name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, useCustomStation: false, callFrom: '', customStation: '' })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to station list
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Time *
            </label>
            <input
              type="time"
              name="callTime"
              value={formData.callTime}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Time
            </label>
            <input
              type="time"
              name="arrivalTime"
              value={formData.arrivalTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Call Type
            </label>
            <select
              name="callType"
              value={formData.callType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CALL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charge Type
            </label>
            <select
              name="chargeType"
              value={formData.chargeType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {CHARGE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {CHARGE_TYPES.find(t => t.value === formData.chargeType)?.description}
            </p>
          </div>
          {formData.chargeType === 'hourly' && (
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Hours (Optional)
            </label>
            <input
              type="number"
              name="manualHours"
              value={formData.manualHours}
              onChange={handleInputChange}
              step="0.5"
              min="0"
              placeholder="Leave empty for automatic calculation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              If specified, overrides default 1-hour calculation
            </p>
            </div>
          )}
        </div>

        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Fee Calculation</span>
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            €{calculatedFee.toFixed(2)}
          </div>
          {formData.chargeType === 'hourly' ? (
            <p className="text-xs text-emerald-700 mt-1">
              Standard rate: €55.55/hour • Default: 1 hour per call
            </p>
          ) : (
            <p className="text-xs text-emerald-700 mt-1">
              Fixed charge - no hourly calculation
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Call Entry</span>
        </button>
      </form>
    </div>
  );
}