export interface CallEntry {
  id: string;
  date: string;
  callFrom: string;
  callTime: string;
  arrivalTime?: string;
  callType: string;
  manualHours?: number;
  fixedCharge?: number;
  totalFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceData {
  entries: CallEntry[];
  totalHours: number;
  totalAmount: number;
  dateRange: {
    start: string;
    end: string;
  };
  doctorInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface AppSettings {
  hourlyRate: number;
  doctorInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string;
  rememberMe: boolean;
}

export type TabType = 'entries' | 'invoices' | 'settings';