import React, { useEffect } from "react";
import { UserProvider, useUser } from "./UserContext";
import LoginPage from "./components/LoginPage";
import Settings from "./components/Settings";
import { InvoiceGenerator } from "./components/InvoiceGenerator";

function AppContent() {
  const { user, token, setUser, logout } = useUser();

  useEffect(() => {
    if (token) {
      fetch("http://localhost:4000/api/auth/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        });
    }
  }, [token, setUser]);

  if (!token || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="flex justify-end p-4">
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <div className="max-w-3xl mx-auto">
        <Settings onSettingsChange={() => {}} />
        <InvoiceGenerator />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}