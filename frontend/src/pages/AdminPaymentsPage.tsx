import { useEffect, useState } from "react";
import api from "../lib/api";

interface AdminPayment {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  user: { id: string; phone: string; email?: string };
}

const STATUSES = ["recorded", "confirmed", "rejected"];

const statusColors: Record<string, string> = {
  recorded: "bg-slate-100 text-slate-600",
  confirmed: "bg-softgreen/15 text-softgreen",
  rejected: "bg-crimson/10 text-crimson",
};

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("hometutors_token");

  useEffect(() => {
    if (!token) { setError("Login as admin to access payments."); return; }
    setLoading(true);
    api.get("/api/admin/payments", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setPayments(r.data.data))
      .catch(() => setError("Unable to load payments."))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const r = await api.patch(`/api/admin/payments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: r.data.data.status } : p));
    } catch {
      setError("Failed to update payment status.");
    }
  };

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const confirmed = payments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-charcoal">Payment Tracking</h1>
        <p className="mt-1 text-slate-500">Monitor and update recruiter payment statuses.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Recorded</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">${total.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Confirmed</p>
          <p className="mt-1 text-2xl font-bold text-softgreen">${confirmed.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-charcoal">{payments.length}</p>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</div>}

      <div className="space-y-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-100" />)
          : payments.length === 0
          ? <div className="rounded-3xl bg-white p-8 text-slate-400 shadow-sm">No payment records.</div>
          : payments.map((payment) => (
              <div key={payment.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-charcoal">{payment.user.phone}{payment.user.email ? ` · ${payment.user.email}` : ""}</p>
                    <p className="text-sm text-slate-500">{payment.description}</p>
                    <p className="text-xs text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <p className="text-2xl font-bold text-charcoal">${payment.amount.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[payment.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {payment.status}
                      </span>
                      <select
                        value={payment.status}
                        onChange={e => updateStatus(payment.id, e.target.value)}
                        className="rounded-xl border border-slate-200 px-3 py-1 text-xs"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </section>
  );
};

export default AdminPaymentsPage;
