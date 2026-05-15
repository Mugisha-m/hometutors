import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

interface DocumentItem {
  id: string;
  title: string;
  url: string;
  hidden: boolean;
}

interface TutorDetail {
  id: string;
  displayName: string;
  skills: string;
  diploma: string;
  certificates: string;
  bio: string;
  profilePicture?: string;
  verified: boolean;
  contactPhone: string | null;
  contactEmail: string | null;
  documents: DocumentItem[];
  activeThisWeek: boolean;
}

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
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:4000/api/tutors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => setTutor(response.data.data))
      .catch(() => navigate("/login"));
  }, [id, navigate]);

  const requestContact = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setRequesting(true);
    setMessage("");

    try {
      const response = await axios.post(`http://localhost:4000/api/tutors/${id}/request-contact`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.data.message || t('tutorDetail.requestSuccess'));
      setRequested(true);
    } catch {
      setMessage(t('tutorDetail.requestFailure'));
    } finally {
      setRequesting(false);
    }
  };

  if (!tutor) {
    return <p className="text-slate-600">{t('tutorDetail.loading')}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t('tutorDetail.profileLabel')}</p>
            <h1 className="text-3xl font-bold text-charcoal">{tutor.displayName}</h1>
            <p className="text-slate-600">{tutor.bio}</p>
          </div>
          <div className="space-y-3 rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
            <p>{tutor.activeThisWeek ? t('tutorDetail.activeThisWeek') : t('tutorDetail.notActive')}</p>
            <p>{tutor.verified ? t('tutorDetail.adminVerified') : t('tutorDetail.awaitingVerification')}</p>
            <p>{t('tutorDetail.certificates')}: {tutor.certificates || t('tutorDetail.noCertificates')}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-charcoal">{t('tutorDetail.skillsEducation')}</h2>
            <p className="text-slate-600"><strong>{t('tutorDetail.skills')}:</strong> {tutor.skills}</p>
            <p className="mt-3 text-slate-600"><strong>{t('tutorDetail.diploma')}:</strong> {tutor.diploma}</p>
            <p className="mt-3 text-slate-600"><strong>{t('tutorDetail.certificates')}:</strong> {tutor.certificates}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-charcoal">{t('tutorDetail.contactAccess')}</h2>
            <p className="text-slate-600">{t('tutorDetail.phone')}: <span className="font-semibold text-charcoal">{tutor.contactPhone ?? t('tutorDetail.hidden')}</span></p>
            <p className="mt-2 text-slate-600">{t('tutorDetail.email')}: <span className="font-semibold text-charcoal">{tutor.contactEmail ?? t('tutorDetail.hidden')}</span></p>
            <div className="mt-6">
              <PrimaryButton label={requested ? t('tutorDetail.requested') : t('tutorDetail.requestButton')} onClick={requestContact} disabled={requesting || requested} />
            </div>
            {message && <p className="mt-4 text-sm text-softgreen">{message}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="mb-5 text-xl font-semibold text-charcoal">{t('tutorDetail.documents')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tutor.documents.map((doc) => (
            <div key={doc.id} className="rounded-3xl border border-slate-200 p-5">
              <p className="font-semibold text-charcoal">{doc.title}</p>
              <p className="mt-2 text-sm text-slate-500">{doc.hidden ? t('tutorDetail.documentHidden') : t('tutorDetail.documentAvailable')}</p>
              {!doc.hidden && (
                <a href={doc.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-turquoise hover:underline">
                  {t('tutorDetail.viewDocument')}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TutorDetailPage;
