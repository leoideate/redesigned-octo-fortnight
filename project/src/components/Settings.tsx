import React, { useState } from "react";
import { useUser } from "../UserContext";

export default function Settings({ onSettingsChange }: { onSettingsChange: () => void }) {
  const { user, token, setUser } = useUser();
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [invoiceNumber, setInvoiceNumber] = useState(user?.invoiceNumber || "");
  const [invoiceToInfo, setInvoiceToInfo] = useState(user?.invoiceToInfo || "");
  const [perHourRate, setPerHourRate] = useState(user?.perHourRate || "");
  const [perCallRate, setPerCallRate] = useState(user?.perCallRate || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    const res = await fetch("http://localhost:4000/api/auth/me/invoice", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        companyName,
        invoiceNumber,
        invoiceToInfo,
        perHourRate: parseFloat(perHourRate),
        perCallRate: parseFloat(perCallRate),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.user) {
      setUser(data.user);
      setSuccess(true);
      onSettingsChange();
    } else {
      alert(data.error || "Update failed");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
      <h2 className="text-2xl font-bold text-emerald-700 mb-6">Invoice Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Your Company Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            value={invoiceNumber}
            onChange={e => setInvoiceNumber(e.target.value)}
            placeholder="e.g. INV-2024-001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice To</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            value={invoiceToInfo}
            onChange={e => setInvoiceToInfo(e.target.value)}
            placeholder="Client Name or Details"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Hour Rate (€)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={perHourRate}
              onChange={e => setPerHourRate(e.target.value)}
              placeholder="e.g. 100"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Call Rate (€)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={perCallRate}
              onChange={e => setPerCallRate(e.target.value)}
              placeholder="e.g. 75"
              min="0"
              step="0.01"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
        {success && (
          <div className="text-green-600 text-center mt-2">Settings updated!</div>
        )}
      </form>
    </div>
  );
}