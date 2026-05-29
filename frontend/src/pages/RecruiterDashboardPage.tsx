import { FormEvent, useEffect, useState } from "react";
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
  const [paymentForm, setPaymentForm] = useState({ amount: "", description: "" });
  const [searchForm, setSearchForm] = useState({ q: "", location: "", active: true, verified: false });
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
      showToast("Profile updated successfully!");
    } catch {
      showToast("Failed to update profile");
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
      showToast("Payment recorded successfully!");
    } catch {
      showToast("Failed to record payment");
    }
  };

  const handleTutorSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.q.trim()) params.set("q", searchForm.q.trim());
    if (searchForm.location.trim()) params.set("location", searchForm.location.trim());
    if (searchForm.active) params.set("active", "true");
    if (searchForm.verified) params.set("verified", "true");
    navigate(`/tutors?${params.toString()}`);
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
            {editing && <button onClick={() => setEditing(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>}
            <PrimaryButton label={editing ? "Save Changes" : "Edit Profile"} onClick={editing ? handleProfileUpdate : () => setEditing(!editing)} />
          </div>
        </div>
        {toast && <p className="mt-4 rounded-2xl bg-softgreen/10 px-4 py-2 text-sm font-medium text-softgreen">{toast}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-sm lg:col-span-2">
          <h2 className="mb-2 text-xl font-semibold text-charcoal">Find tutors by location</h2>
          <p className="mb-6 text-sm text-slate-500">Search district, sector, or city and open matching tutor profiles.</p>
          <form onSubmit={handleTutorSearch} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">Name or skill</span>
              <input
                value={searchForm.q}
                onChange={(e) => setSearchForm(prev => ({ ...prev, q: e.target.value }))}
                placeholder="Math, English, science..."
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">Location</span>
              <input
                value={searchForm.location}
                onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Kigali, Gasabo, Kacyiru..."
              />
            </label>
            <div className="flex flex-col justify-end gap-3">
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={searchForm.active}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 accent-turquoise"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={searchForm.verified}
                    onChange={(e) => setSearchForm(prev => ({ ...prev, verified: e.target.checked }))}
                    className="h-4 w-4 accent-turquoise"
                  />
                  Verified
                </label>
              </div>
              <PrimaryButton type="submit" label="Search Tutors" />
            </div>
          </form>
        </div>

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
