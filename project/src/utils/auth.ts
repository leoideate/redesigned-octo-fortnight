export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string;
  rememberMe: boolean;
}

const AUTH_STORAGE_KEY = 'doctor-invoicing-auth';
const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'zeeshan';

export class AuthService {
  static login(credentials: LoginCredentials): boolean {
    const { username, password, rememberMe } = credentials;
    
    // Validate credentials
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return false;
    }

    const authState: AuthState = {
      isAuthenticated: true,
      username,
      rememberMe,
    };

    // Store in appropriate storage based on "Remember Me"
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));

    return true;
  }

  static logout(): void {
    // Clear from both storages to ensure complete logout
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }

  static getAuthState(): AuthState | null {
    try {
      // Check sessionStorage first (current session)
      let stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Check localStorage (remembered login)
      stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authState = JSON.parse(stored);
        // If found in localStorage, also set in sessionStorage for current session
        sessionStorage.setItem(AUTH_STORAGE_KEY, stored);
        return authState;
      }

      return null;
    } catch (error) {
      console.error('Failed to get auth state:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const authState = this.getAuthState();
    return authState?.isAuthenticated || false;
  }

  static getCurrentUser(): string | null {
    const authState = this.getAuthState();
    return authState?.username || null;
  }
}