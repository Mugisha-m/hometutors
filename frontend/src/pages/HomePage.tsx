import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/PrimaryButton";

const backgroundImage =
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1400&q=80";

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <section className="space-y-10">
      <div
        className="relative overflow-hidden rounded-[32px] bg-cover bg-center text-white"
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.72)), url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
          <div className="max-w-3xl space-y-8">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/90">{t('app.name')}</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{t('home.title')}</h1>
            <p className="text-lg leading-8 text-slate-200/90">{t('home.subtitle')}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/tutors">
                <PrimaryButton label={t('home.browseTutors')} />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {t('home.becomeTutor')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="font-semibold text-charcoal">{t('home.features.adminOversight.title')}</p>
          <p className="mt-3 text-sm text-slate-600">{t('home.features.adminOversight.description')}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="font-semibold text-charcoal">{t('home.features.weeklyStatus.title')}</p>
          <p className="mt-3 text-sm text-slate-600">{t('home.features.weeklyStatus.description')}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="font-semibold text-charcoal">{t('home.features.protectedContact.title')}</p>
          <p className="mt-3 text-sm text-slate-600">{t('home.features.protectedContact.description')}</p>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
