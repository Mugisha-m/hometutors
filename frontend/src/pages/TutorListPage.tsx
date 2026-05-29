import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

interface TutorSummary {
  id: string;
  displayName: string;
  skills: string;
  diploma: string;
  bio: string;
  profilePicture?: string;
  verified: boolean;
  activeThisWeek: boolean;
  district?: string;
  sector?: string;
  city?: string;
}

const FALLBACK = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80";

const TutorListPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState<TutorSummary[]>([]);
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [locationQuery, setLocationQuery] = useState(() => searchParams.get("location") ?? "");
  const [activeOnly, setActiveOnly] = useState(() => searchParams.get("active") === "true");
  const [verifiedOnly, setVerifiedOnly] = useState(() => searchParams.get("verified") === "true");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTutors = async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, unknown> = {};
      if (query.trim()) params.q = query.trim();
      if (locationQuery.trim()) params.location = locationQuery.trim();
      if (activeOnly) params.active = true;
      if (verifiedOnly) params.verified = true;
      const response = await axios.get("http://localhost:4000/api/tutors", { params });
      setTutors(response.data.data);
    } catch {
      setError(t("tutorList.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (query.trim()) nextParams.set("q", query.trim());
    if (locationQuery.trim()) nextParams.set("location", locationQuery.trim());
    if (activeOnly) nextParams.set("active", "true");
    if (verifiedOnly) nextParams.set("verified", "true");
    setSearchParams(nextParams, { replace: true });
    loadTutors();
  }, [query, locationQuery, activeOnly, verifiedOnly]);

  return (
    <section className="space-y-8">

      {/* Header */}
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t("tutorList.title")}</p>
            <h1 className="mt-2 text-3xl font-bold text-charcoal">{t("tutorList.heading")}</h1>
            <p className="mt-2 max-w-xl text-slate-500">{t("tutorList.subtitle")}</p>
          </div>
          <PrimaryButton label={t("tutorList.refresh")} onClick={loadTutors} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">{t("tutorList.searchLabel")}</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("tutorList.searchPlaceholder")} className="w-full" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">{t("tutorList.searchLocationLabel")}</span>
            <input value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder={t("tutorList.searchLocationPlaceholder")} className="w-full" />
          </label>
          <div className="flex items-end gap-3">
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-charcoal hover:border-turquoise">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} className="h-4 w-4 accent-turquoise" />
              {t("tutorList.filterActive")}
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-charcoal hover:border-turquoise">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-turquoise" />
              {t("tutorList.filterVerified")}
            </label>
          </div>
        </div>
      </div>

      {error && <div className="rounded-3xl bg-crimson/10 p-5 text-sm text-crimson">{error}</div>}

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-[32px] bg-slate-100" />
            ))
          : tutors.length === 0
          ? <div className="col-span-3 rounded-[32px] bg-white p-16 text-center text-slate-400 shadow-sm">{t("tutorList.empty")}</div>
          : tutors.map((tutor) => (
              <article key={tutor.id} className="group overflow-hidden rounded-[32px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                {/* Photo */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={tutor.profilePicture || FALLBACK}
                    alt={tutor.displayName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${tutor.activeThisWeek ? "bg-softgreen text-white" : "bg-slate-700/80 text-slate-200"}`}>
                    {tutor.activeThisWeek ? t("tutorList.active") : t("tutorList.inactive")}
                  </span>
                  <p className="absolute bottom-4 left-4 text-lg font-bold text-white">{tutor.displayName}</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-3">
                  {(tutor.district || tutor.sector || tutor.city) && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>Location</span>
                      <span className="truncate">{tutor.district ? `${tutor.district}, ` : ""}{tutor.sector ? `${tutor.sector}, ` : ""}{tutor.city || ""}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-500 line-clamp-2">{tutor.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.skills.split(",").slice(0, 3).map((s) => s.trim()).filter(Boolean).map((skill) => (
                      <span key={skill} className="rounded-full bg-turquoise/10 px-3 py-1 text-xs font-medium text-turquoise">{skill}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tutor.verified ? "bg-softgreen/15 text-softgreen" : "bg-yellow-100 text-yellow-700"}`}>
                      {tutor.verified ? t("tutorList.verified") : t("tutorList.pending")}
                    </span>
                    <Link to={`/tutors/${tutor.id}`} className="text-sm font-semibold text-turquoise hover:underline">
                      {t("tutorList.viewProfile")} -&gt;
                    </Link>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
};

export default TutorListPage;
