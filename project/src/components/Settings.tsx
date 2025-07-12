import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Download, Upload, Trash2, Save } from 'lucide-react';
import { StorageService } from '../utils/storage';
import { AppSettings } from '../types';

interface SettingsProps {
  onSettingsChange: () => void;
}

export function Settings({ onSettingsChange }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(StorageService.loadSettings());
  const [showExportData, setShowExportData] = useState(false);

  const handleSaveSettings = () => {
    StorageService.saveSettings(settings);
    onSettingsChange();
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = StorageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doctor-invoicing-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        if (StorageService.importData(data)) {
          alert('Data imported successfully!');
          setSettings(StorageService.loadSettings());
          onSettingsChange();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        alert('Error reading file. Please try again.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This action cannot be undone.')) {
      if (confirm('This will delete all call entries and settings. Are you absolutely sure?')) {
        StorageService.clearAllData();
        setSettings(StorageService.loadSettings());
        onSettingsChange();
        alert('All data has been cleared.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Configure your app preferences</p>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Doctor Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={settings.doctorInfo.name}
                onChange={(e) => setSettings({
                  ...settings,
                  doctorInfo: { ...settings.doctorInfo, name: e.target.value }
                })}
                placeholder="Dr. John Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.doctorInfo.email}
                onChange={(e) => setSettings({
                  ...settings,
                  doctorInfo: { ...settings.doctorInfo, email: e.target.value }
                })}
                placeholder="doctor@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.doctorInfo.phone}
                onChange={(e) => setSettings({
                  ...settings,
                  doctorInfo: { ...settings.doctorInfo, phone: e.target.value }
                })}
                placeholder="+353 1 234 5678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.hourlyRate}
                onChange={(e) => setSettings({
                  ...settings,
                  hourlyRate: parseFloat(e.target.value) || 55.55
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={settings.doctorInfo.address}
                onChange={(e) => setSettings({
                  ...settings,
                  doctorInfo: { ...settings.doctorInfo, address: e.target.value }
                })}
                placeholder="123 Medical Street, Dublin, Ireland"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-blue-900">Export Data</h4>
              <p className="text-sm text-blue-700">Download all your data as a backup file</p>
            </div>
            <button
              onClick={handleExportData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Data */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div>
              <h4 className="font-medium text-emerald-900">Import Data</h4>
              <p className="text-sm text-emerald-700">Restore data from a backup file</p>
            </div>
            <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors duration-200">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-900">Clear All Data</h4>
              <p className="text-sm text-red-700">Permanently delete all entries and settings</p>
            </div>
            <button
              onClick={handleClearAllData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">App Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Storage:</span>
            <span className="font-medium">Local Browser Storage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Offline Support:</span>
            <span className="font-medium text-emerald-600">Enabled</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">PWA Status:</span>
            <span className="font-medium text-emerald-600">Installable</span>
          </div>
        </div>
      </div>
    </div>
  );
}