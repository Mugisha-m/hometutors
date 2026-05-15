import { useEffect, useState } from "react";
import axios from "axios";

interface AdminPayment {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    phone: string;
    email?: string;
  };
}

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      setError("Login as admin to access payments.");
      return;
    }

    axios
      .get("http://localhost:4000/api/admin/payments", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => setPayments(response.data.data))
      .catch(() => setError("Unable to load payments."));
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Admin payments</p>
          <h1 className="text-3xl font-bold text-charcoal">Payment activity</h1>
          <p className="max-w-2xl text-slate-600">Review recruiter payments and status updates across the platform.</p>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</div>}

      <div className="grid gap-4">
        {payments.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-slate-500 shadow-sm">No payment records available.</div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">From recruiter</p>
                  <p className="font-semibold text-charcoal">{payment.user.phone} {payment.user.email ? `(${payment.user.email})` : ""}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "recorded" ? "bg-softgreen/15 text-softgreen" : "bg-slate-100 text-slate-600"}`}>{payment.status}</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="mt-1 text-xl font-semibold text-charcoal">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Description</p>
                  <p className="mt-1 text-slate-700">{payment.description}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="mt-1 text-slate-700">{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default AdminPaymentsPage;
