import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

interface TutorSummary {
  id: string;
  displayName: string;
  skills: string;
  diploma: string;
  certificates: string;
  bio: string;
  profilePicture?: string;
  verified: boolean;
  activeThisWeek: boolean;
}

const TutorListPage = () => {
  const { t } = useTranslation();
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [query, setQuery] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTutors = async () => {
    setLoading(true);
    setError("");

    try {
      const params: any = {};
      if (query.trim()) params.q = query.trim();
      if (activeOnly) params.active = true;
      if (verifiedOnly) params.verified = true;

      const response = await axios.get("http://localhost:4000/api/tutors", { params });
      setTutors(response.data.data);
    } catch {
      setError(t('tutorList.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
  }, [query, activeOnly, verifiedOnly]);

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t('tutorList.title')}</p>
            <h1 className="mt-3 text-3xl font-bold text-charcoal">{t('tutorList.heading')}</h1>
            <p className="mt-2 max-w-2xl text-slate-500">{t('tutorList.subtitle')}</p>
          </div>
          <PrimaryButton label={t('tutorList.refresh')} onClick={loadTutors} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_0.9fr] xl:grid-cols-[2fr_0.9fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">{t('tutorList.searchLabel')}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('tutorList.searchPlaceholder')}
              className="w-full"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-charcoal">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              {t('tutorList.filterActive')}
            </label>
            <label className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-charcoal">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              {t('tutorList.filterVerified')}
            </label>
          </div>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-6 text-sm text-crimson">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[32px] bg-slate-100" />
          ))
        ) : tutors.length === 0 ? (
          <div className="rounded-[32px] bg-white p-12 text-center text-slate-500 shadow-sm">{t('tutorList.empty')}</div>
        ) : (
          tutors.map((tutor) => (
            <article key={tutor.id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal">{tutor.displayName}</h3>
                    <p className="mt-2 text-sm text-slate-500">{tutor.skills}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tutor.activeThisWeek ? "bg-softgreen/15 text-softgreen" : "bg-slate-100 text-slate-600"}`}>
                    {tutor.activeThisWeek ? t('tutorList.active') : t('tutorList.inactive')}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{tutor.bio}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className={`rounded-full px-3 py-1 ${tutor.verified ? "bg-turquoise/15 text-turquoise" : "bg-yellow-100 text-yellow-800"}`}>
                    {tutor.verified ? t('tutorList.verified') : t('tutorList.pending')}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{tutor.diploma}</span>
                </div>
                <div className="mt-6 text-right">
                  <Link to={`/tutors/${tutor.id}`} className="text-sm font-semibold text-turquoise hover:underline">
                    {t('tutorList.viewProfile')}
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default TutorListPage;
