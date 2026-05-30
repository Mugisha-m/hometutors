import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

interface DocumentItem { id: string; title: string; url: string; hidden: boolean; }
interface TutorDetail {
  id: string; displayName: string; skills: string; diploma: string;
  certificates: string; bio: string; profilePicture?: string;
  verified: boolean; contactPhone: string | null; contactEmail: string | null;
  documents: DocumentItem[]; activeThisWeek: boolean;
  district?: string | null; sector?: string | null; city?: string | null;
}

const FALLBACK = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80";

const TutorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tutor, setTutor] = useState<TutorDetail | null>(null);
  const [message, setMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) { navigate("/login"); return; }
    api.get(`/api/tutors/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setTutor(r.data.data))
      .catch(() => navigate("/login"));
  }, [id, navigate]);

  const requestContact = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) { navigate("/login"); return; }
    setRequesting(true); setMessage("");
    try {
      const r = await api.post(`/api/tutors/${id}/request-contact`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(r.data.data.message || t("tutorDetail.requestSuccess"));
      setRequested(true);
    } catch { setMessage(t("tutorDetail.requestFailure")); }
    finally { setRequesting(false); }
  };

  if (!tutor) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-turquoise border-t-transparent" />
    </div>
  );

  return (
    <section className="space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[32px] bg-charcoal">
        <img
          src={tutor.profilePicture || FALLBACK}
          alt={tutor.displayName}
          className="h-72 w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between w-full">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-widest text-turquoise">{t("tutorDetail.profileLabel")}</p>
              <h1 className="text-4xl font-bold text-white">{tutor.displayName}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tutor.activeThisWeek ? "bg-softgreen text-white" : "bg-slate-600 text-slate-200"}`}>
                  {tutor.activeThisWeek ? t("tutorDetail.activeThisWeek") : t("tutorDetail.notActive")}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tutor.verified ? "bg-turquoise text-white" : "bg-slate-600 text-slate-200"}`}>
                  {tutor.verified ? t("tutorDetail.adminVerified") : t("tutorDetail.awaitingVerification")}
                </span>
                {(tutor.district || tutor.sector || tutor.city) && (
                  <span className="rounded-full bg-charcoal/80 text-slate-200 px-3 py-1 text-xs font-semibold border border-white/10 flex items-center gap-1">
                    Location: {tutor.district ? `${tutor.district}, ` : ""}{tutor.sector ? `${tutor.sector}, ` : ""}{tutor.city || ""}
                  </span>
                )}
              </div>
            </div>
            {/* Avatar */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white/20 shadow-xl">
              <img src={tutor.profilePicture || FALLBACK} alt={tutor.displayName} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: bio + skills */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-[32px] bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-charcoal">About</h2>
            <p className="leading-relaxed text-slate-600">{tutor.bio || "No bio provided."}</p>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-charcoal">{t("tutorDetail.skillsEducation")}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.skills")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tutor.skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => (
                    <span key={skill} className="rounded-full bg-turquoise/10 px-3 py-1 text-sm font-medium text-turquoise">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.diploma")}</p>
                <p className="mt-1 text-slate-700">{tutor.diploma || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.certificates")}</p>
                <p className="mt-1 text-slate-700">{tutor.certificates || t("tutorDetail.noCertificates")}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          {tutor.documents.length > 0 && (
            <div className="rounded-[32px] bg-white p-8 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold text-charcoal">{t("tutorDetail.documents")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {tutor.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">DOC</div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-charcoal">{doc.title}</p>
                      {doc.hidden
                        ? <p className="text-xs text-slate-400">{t("tutorDetail.documentHidden")}</p>
                        : <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-turquoise hover:underline">{t("tutorDetail.viewDocument")}</a>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: contact */}
        <div className="space-y-6">
          {/* Location details card */}
          <div className="rounded-[32px] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-charcoal">{t("tutorDetail.location")}</h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.district")}</p>
                <p className="mt-1 font-semibold text-charcoal">{tutor.district || "-"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.sector")}</p>
                <p className="mt-1 font-semibold text-charcoal">{tutor.sector || "-"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.city")}</p>
                <p className="mt-1 font-semibold text-charcoal">{tutor.city || "-"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-charcoal">{t("tutorDetail.contactAccess")}</h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.phone")}</p>
                <p className="mt-1 font-semibold text-charcoal">{tutor.contactPhone ?? <span className="text-slate-400 font-normal">{t("tutorDetail.hidden")}</span>}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t("tutorDetail.email")}</p>
                <p className="mt-1 font-semibold text-charcoal">{tutor.contactEmail ?? <span className="text-slate-400 font-normal">{t("tutorDetail.hidden")}</span>}</p>
              </div>
            </div>
            <div className="mt-6">
              <PrimaryButton
                label={requested ? t("tutorDetail.requested") : t("tutorDetail.requestButton")}
                onClick={requestContact}
                disabled={requesting || requested}
              />
            </div>
            {message && <p className="mt-4 text-sm text-softgreen">{message}</p>}
          </div>
        </div>

      </div>
    </section>
  );
};

export default TutorDetailPage;
