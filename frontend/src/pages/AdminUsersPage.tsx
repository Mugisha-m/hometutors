import { useEffect, useState } from "react";
import api from "../lib/api";

interface UserItem {
  id: string;
  phone: string;
  email?: string;
  role: string;
  adminApproved: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-crimson/10 text-crimson",
  TUTOR: "bg-turquoise/10 text-turquoise",
  RECRUITER: "bg-softgreen/10 text-softgreen",
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const token = localStorage.getItem("hometutors_token");

  const loadUsers = () => {
    if (!token) { setError("Login as admin to load users."); return; }
    setLoading(true);
    api.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setUsers(r.data.data))
      .catch(() => setError("Unable to load user list."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const deleteUser = async (id: string, phone: string) => {
    if (!confirm(`Delete user ${phone}? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  };

  const unapproveUser = async (id: string) => {
    try {
      await api.post("/api/admin/unapprove-recruiter", { userId: id }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, adminApproved: false } : u));
    } catch {
      setError("Failed to unapprove user.");
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.phone.includes(search) || (u.email ?? "").includes(search);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Admin</p>
            <h1 className="mt-1 text-3xl font-bold text-charcoal">User Management</h1>
            <p className="mt-1 text-slate-500">{users.length} total users</p>
          </div>
          <button onClick={loadUsers} className="rounded-2xl bg-turquoise px-5 py-2 text-sm font-semibold text-white hover:bg-teal-400">
            Refresh
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by phone or email…"
            className="flex-1"
          />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="sm:w-40">
            <option value="ALL">All roles</option>
            <option value="TUTOR">Tutor</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</div>}

      <div className="overflow-hidden rounded-[32px] bg-white shadow-sm">
        {/* Table header */}
        <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-100 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 md:grid">
          <span>Phone</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span></span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-slate-50 mx-4 my-2 rounded-2xl" />
              ))
            : filtered.length === 0
            ? <p className="p-8 text-slate-400">No users found.</p>
            : filtered.map((user) => (
                <div key={user.id} className="grid grid-cols-1 gap-2 px-6 py-4 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4">
                  <span className="font-medium text-charcoal">{user.phone}</span>
                  <span className="text-sm text-slate-500">{user.email || "—"}</span>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${roleColors[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                    {user.role}
                  </span>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${user.adminApproved ? "bg-softgreen/15 text-softgreen" : "bg-yellow-100 text-yellow-700"}`}>
                    {user.adminApproved ? "Approved" : "Pending"}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    {user.role === "RECRUITER" && user.adminApproved && (
                      <button
                        onClick={() => unapproveUser(user.id)}
                        className="w-fit rounded-xl bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-200 transition"
                      >
                        Unapprove
                      </button>
                    )}
                    {user.role !== "ADMIN" && (
                      <button
                        onClick={() => deleteUser(user.id, user.phone)}
                        className="w-fit rounded-xl bg-crimson/10 px-3 py-1 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white transition"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
};

export default AdminUsersPage;
