import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";

interface RecruiterProfile {
  id: string;
  companyName?: string;
  fullName?: string;
  approved: boolean;
}

interface Payment {
  id: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

const RecruiterDashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    fullName: ""
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    description: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, paymentsRes] = await Promise.all([
          axios.get("http://localhost:4000/api/recruiters/profile", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:4000/api/recruiters/payments", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProfile(profileRes.data.data);
        setFormData({
          companyName: profileRes.data.data.companyName || "",
          fullName: profileRes.data.data.fullName || ""
        });
        setPayments(paymentsRes.data.data);
      } catch (error) {
        navigate("/login");
      }
    };

    loadData();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      const response = await axios.put("http://localhost:4000/api/recruiters/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handlePaymentSubmit = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      const response = await axios.post("http://localhost:4000/api/recruiters/payments", paymentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(prev => [response.data.data, ...prev]);
      setPaymentForm({ amount: "", description: "" });
      alert("Payment recorded successfully!");
    } catch (error) {
      alert("Failed to record payment");
    }
  };

  if (!profile) {
    return <p className="text-slate-600">Loading dashboard…</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Recruiter dashboard</p>
            <h1 className="text-3xl font-bold text-charcoal">Welcome, {profile.fullName || "Recruiter"}</h1>
          </div>
          <div className="flex gap-3">
            <PrimaryButton label={editing ? "Save Changes" : "Edit Profile"} onClick={editing ? handleProfileUpdate : () => setEditing(!editing)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Profile Information</h2>
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">Full Name</span>
              <input
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                disabled={!editing}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">Company Name</span>
              <input
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                disabled={!editing}
              />
            </label>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Approval Status</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.approved ? "bg-softgreen/15 text-softgreen" : "bg-slate-100 text-slate-600"}`}>
                {profile.approved ? "Approved" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Record Payment</h2>
          <div className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">Amount</span>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">Description</span>
              <textarea
                value={paymentForm.description}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Payment details..."
                rows={3}
              />
            </label>
            <PrimaryButton label="Record Payment" onClick={handlePaymentSubmit} />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">Payment History</h2>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-slate-500">No payments recorded yet.</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-3xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-charcoal">${payment.amount}</p>
                  <p className="text-sm text-slate-600">{payment.description}</p>
                  <p className="text-xs text-slate-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${payment.status === "recorded" ? "bg-softgreen/15 text-softgreen" : "bg-slate-100 text-slate-600"}`}>
                  {payment.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default RecruiterDashboardPage;