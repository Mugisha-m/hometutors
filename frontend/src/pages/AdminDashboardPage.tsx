import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useTranslation } from "react-i18next";

interface Stats {
  totalTutors: number;
  totalRecruiters: number;
  pendingRecruiters: number;
  totalMessages: number;
}

const statCards = (stats: Stats, loading: boolean) => [
  { label: "Total Tutors", value: stats.totalTutors, color: "text-turquoise", bg: "bg-turquoise/10", icon: "🎓" },
  { label: "Total Recruiters", value: stats.totalRecruiters, color: "text-softgreen", bg: "bg-softgreen/10", icon: "🏢" },
  { label: "Pending Approvals", value: stats.pendingRecruiters, color: "text-crimson", bg: "bg-crimson/10", icon: "⏳" },
  { label: "Messages Logged", value: stats.totalMessages, color: "text-charcoal", bg: "bg-slate-100", icon: "💬" },
].map(c => ({ ...c, value: loading ? "—" : c.value }));

const actions = [
  { title: "Approve Recruiters", desc: "Review and approve new recruiter accounts and contact access requests.", icon: "✅", to: "/admin/approvals", active: true },
  { title: "Messages & Notifications", desc: "View all platform messages and send messages to any user.", icon: "✉️", to: "/messages", active: true },
  { title: "User Management", desc: "View all users, their roles, approval status, and delete accounts.", icon: "👥", to: "/admin/users", active: true },
  { title: "Payment Tracking", desc: "Monitor recruiter payments and update payment statuses.", icon: "💳", to: "/admin/payments", active: true },
  { title: "Tutor Verification", desc: "Verify tutor profiles and review their uploaded documents.", icon: "🔍", to: "/admin/approvals", active: true },
  { title: "Content Moderation", desc: "Delete inappropriate messages or profiles from the platform.", icon: "🛡️", to: "/admin/users", active: true },
];

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({ totalTutors: 0, totalRecruiters: 0, pendingRecruiters: 0, totalMessages: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) { setError(t("admin.notLoggedIn")); return; }
    setLoading(true);
    api.get("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setStats(r.data.data))
      .catch(() => setError(t("admin.dashboardError")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="rounded-[32px] bg-charcoal p-8 text-white">
        <p className="text-sm uppercase tracking-widest text-turquoise">{t("admin.title")}</p>
        <h1 className="mt-2 text-3xl font-bold">{t("admin.heading")}</h1>
        <p className="mt-2 text-slate-400">Manage tutors, recruiters, messages, and platform activity.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/admin/approvals" className="rounded-2xl bg-turquoise px-5 py-2 text-sm font-semibold text-white hover:bg-teal-400">
            {t("admin.manageApprovals")}
          </Link>
          <Link to="/messages" className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20">
            {t("admin.sendMessages")}
          </Link>
          <Link to="/admin/users" className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20">
            Users
          </Link>
          <Link to="/admin/payments" className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/20">
            Payments
          </Link>
        </div>
      </div>

      {error && <p className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</p>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards(stats, loading).map((card) => (
          <div key={card.label} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${card.bg}`}>
              {card.icon}
            </div>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-1 text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">{t("admin.actions")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group rounded-3xl border border-slate-200 p-5 transition hover:border-turquoise hover:bg-turquoise/5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xl group-hover:bg-turquoise/10">
                {action.icon}
              </div>
              <p className="font-semibold text-charcoal">{action.title}</p>
              <p className="mt-1 text-sm text-slate-500">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

    </section>
  );
};

export default AdminDashboardPage;
