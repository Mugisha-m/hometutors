import { useEffect, useState } from "react";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";

interface UserItem {
  id: string;
  phone: string;
  email?: string;
  role: string;
  adminApproved: boolean;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      setError("Login as admin to load users.");
      return;
    }

    axios
      .get("http://localhost:4000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => setUsers(response.data.data))
      .catch(() => setError("Unable to load user list."));
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Admin users</p>
            <h1 className="text-3xl font-bold text-charcoal">User management</h1>
          </div>
          <PrimaryButton label="Refresh" onClick={() => window.location.reload()} />
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</div>}

      <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-200 px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-500 sm:grid-cols-6">
          <span>#</span>
          <span className="col-span-2">Phone</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
        </div>
        <div className="space-y-2 p-4">
          {users.map((user, index) => (
            <div key={user.id} className="grid grid-cols-5 gap-4 rounded-3xl border border-slate-200 p-4 text-sm sm:grid-cols-6">
              <span className="font-semibold text-charcoal">{index + 1}</span>
              <span className="col-span-2 text-slate-700">{user.phone}</span>
              <span className="text-slate-600">{user.email || "—"}</span>
              <span className="text-slate-700">{user.role}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.adminApproved ? "bg-softgreen/15 text-softgreen" : "bg-yellow-100 text-yellow-800"}`}>{user.adminApproved ? "Approved" : "Pending"}</span>
            </div>
          ))}
          {users.length === 0 && <p className="text-slate-500">No users found.</p>}
        </div>
      </div>
    </section>
  );
};

export default AdminUsersPage;
