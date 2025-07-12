import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  FileText, 
  Settings as SettingsIcon, 
  Download, 
  Wifi, 
  WifiOff,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { CallEntry, TabType } from './types';
import { StorageService } from './utils/storage';
import { AuthService } from './utils/auth';
import { CallEntryForm } from './components/CallEntryForm';
import { CallEntriesList } from './components/CallEntriesList';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { Settings } from './components/Settings';
import { LoginPage } from './components/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('entries');
  const [entries, setEntries] = useState<CallEntry[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CallEntry | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status
    const authState = AuthService.isAuthenticated();
    setIsAuthenticated(authState);
    if (authState) {
      setCurrentUser(AuthService.getCurrentUser());
    }

    // Load entries from storage
    setEntries(StorageService.loadCallEntries());

    // Check if app is installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Online/offline handlers
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Install prompt handlers
    const handleInstallPrompt = (e: any) => {
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('installPromptAvailable', handleInstallPrompt);
    window.addEventListener('appInstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('installPromptAvailable', handleInstallPrompt);
      window.removeEventListener('appInstalled', handleAppInstalled);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentUser(AuthService.getCurrentUser());
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('entries');
    setMobileMenuOpen(false);
  };

  const handleAddEntry = (entry: CallEntry) => {
    const updatedEntries = [entry, ...entries];
    setEntries(updatedEntries);
    StorageService.saveCallEntries(updatedEntries);
  };

  const handleEditEntry = (entry: CallEntry) => {
    setEditingEntry(entry);
    setActiveTab('entries');
  };

  const handleUpdateEntry = (updatedEntry: CallEntry) => {
    const updatedEntries = entries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setEntries(updatedEntries);
    StorageService.saveCallEntries(updatedEntries);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    StorageService.saveCallEntries(updatedEntries);
  };

  const handleInstallClick = () => {
    if (window.showInstallPrompt) {
      window.showInstallPrompt();
    }
  };

  const handleSettingsChange = () => {
    // Refresh any settings-dependent data
    setEntries(StorageService.loadCallEntries());
  };

  const tabs = [
    { id: 'entries' as TabType, label: 'Call Entries', icon: Plus },
    { id: 'invoices' as TabType, label: 'Invoices', icon: FileText },
    { id: 'settings' as TabType, label: 'Settings', icon: SettingsIcon },
  ];

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Doctor On-Call</h1>
                <p className="text-sm text-gray-500">Invoicing System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Status and Actions */}
            <div className="flex items-center space-x-4">
              {/* Current User */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{currentUser}</span>
              </div>

              {/* Online/Offline Status */}
              <div className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isOnline 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              {/* Install Button */}
              {!isInstalled && installPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="hidden sm:inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Install</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Status */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-4 py-2 mb-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Logged in as {currentUser}</span>
                </div>

                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  isOnline 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4" />
                      <span>Offline</span>
                    </>
                  )}
                </div>

                {!isInstalled && installPrompt && (
                  <button
                    onClick={() => {
                      handleInstallClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'entries' && (
          <div className="space-y-8">
            <CallEntryForm onAddEntry={handleAddEntry} />
            <CallEntriesList 
              entries={entries}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </div>
        )}

        {activeTab === 'invoices' && (
          <InvoiceGenerator entries={entries} />
        )}

        {activeTab === 'settings' && (
          <Settings onSettingsChange={handleSettingsChange} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <Stethoscope className="w-4 h-4" />
            <span className="text-sm">Doctor On-Call Invoicing System</span>
          </div>
          <p className="text-xs text-gray-500">
            Professional invoicing for healthcare professionals • PWA Ready • Offline Support
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;