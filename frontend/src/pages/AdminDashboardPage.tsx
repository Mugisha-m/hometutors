import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalTutors: 0, totalRecruiters: 0, pendingRecruiters: 0, totalMessages: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      setError(t('admin.notLoggedIn'));
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:4000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => setStats(response.data.data))
      .catch(() => setError(t('admin.dashboardError')))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t('admin.title')}</p>
            <h1 className="text-3xl font-bold text-charcoal">{t('admin.heading')}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/approvals"><PrimaryButton label={t('admin.manageApprovals')} /></Link>
            <Link to="/messages"><PrimaryButton label={t('admin.sendMessages')} /></Link>
          </div>
        </div>
      </div>

      {error && <p className="rounded-3xl bg-crimson/10 p-4 text-sm text-crimson">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">{t('admin.totalTutors')}</p>
          <p className="mt-3 text-3xl font-bold text-charcoal">{loading ? "-" : stats.totalTutors}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">{t('admin.totalRecruiters')}</p>
          <p className="mt-3 text-3xl font-bold text-charcoal">{loading ? "-" : stats.totalRecruiters}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">{t('admin.pendingApprovals')}</p>
          <p className="mt-3 text-3xl font-bold text-charcoal">{loading ? "-" : stats.pendingRecruiters}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">{t('admin.messagesLogged')}</p>
          <p className="mt-3 text-3xl font-bold text-charcoal">{loading ? "-" : stats.totalMessages}</p>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">{t('admin.actions')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/approvals" className="rounded-3xl border border-slate-200 p-4 hover:border-turquoise hover:bg-turquoise/5">
            <p className="font-semibold text-charcoal">{t('admin.approveRecruiters')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('admin.approveRecruitersDesc')}</p>
          </Link>
          <Link to="/messages" className="rounded-3xl border border-slate-200 p-4 hover:border-turquoise hover:bg-turquoise/5">
            <p className="font-semibold text-charcoal">{t('admin.sendMessagesLabel')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('admin.sendMessagesDesc')}</p>
          </Link>
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="font-semibold text-charcoal">{t('admin.monitorTraffic')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('admin.monitorTrafficDesc')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="font-semibold text-charcoal">{t('admin.moderation')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('admin.moderationDesc')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="font-semibold text-charcoal">{t('admin.paymentTracking')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('admin.paymentTrackingDesc')}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 p-4">
            <p className="font-semibold text-charcoal">{t('admin.userManagement')}</p>
            <p className="mt-2 text-sm text-slate-600">{t('admin.userManagementDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
