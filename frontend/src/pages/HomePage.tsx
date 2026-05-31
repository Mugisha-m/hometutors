import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/PrimaryButton";

const HERO_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80";
const TUTOR_IMAGES = [
  "https://images.unsplash.com/photo-1607746882042-94463fe10e?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e04?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1544717305-2782549b51?auto=format&fit=crop&w=400&q=80",
];

const steps = [
  { number: "01", title: "Tutors Sign Up", desc: "Tutors register, complete their profile with skills, diploma, and bio, then set weekly availability." },
  { number: "02", title: "Recruiters Register", desc: "Recruiters sign up with their company name, and wait for admin approval to access contact details." },
  { number: "03", title: "Admin Approves", desc: "Admin reviews recruiter accounts and grants access to tutor contact information and documents." },
  { number: "04", title: "Connect & Hire", desc: "Approved recruiters browse verified tutors, view full profiles, and reach out directly." },
];

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-[32px] bg-cover bg-center text-white"
        style={{ backgroundImage: `linear-gradient(rgba(15,23,42,0.68), rgba(15,23,42,0.68)), url('${HERO_IMAGE}')` }}
      >
        <div className="relative mx-auto max-w-7xl px-8 py-28 sm:py-36">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block rounded-full bg-turquoise/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-turquoise">
              {t("app.name")}
            </span>
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              {t("home.title")}
            </h1>
            <p className="text-lg leading-relaxed text-slate-300">{t("home.subtitle")}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/tutors"><PrimaryButton label={t("home.browseTutors")} /></Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                {t("home.becomeTutor")}
              </Link>
            </div>
          </div>
        </div>

        {/* Floating tutor avatars */}
        <div className="absolute bottom-8 right-8 hidden gap-3 lg:flex">
          {TUTOR_IMAGES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="tutor"
              className="h-16 w-16 rounded-full border-2 border-white/40 object-cover shadow-lg"
              style={{ marginLeft: i > 0 ? "-12px" : 0 }}
            />
          ))}
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-turquoise/80 text-xs font-bold text-white shadow-lg" style={{ marginLeft: "-12px" }}>
            
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { value: "-", label: "Verified Tutors" },
          { value: "-", label: "Admin Oversight" },
          { value: "24/7", label: "Platform Access" },
          { value: "🔒", label: "Protected Contacts" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-turquoise">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-turquoise/10 text-2xl">🛡️</div>
          <p className="font-semibold text-charcoal">{t("home.features.adminOversight.title")}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{t("home.features.adminOversight.description")}</p>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-softgreen/10 text-2xl">📅</div>
          <p className="font-semibold text-charcoal">{t("home.features.weeklyStatus.title")}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{t("home.features.weeklyStatus.description")}</p>
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-crimson/10 text-2xl">🔒</div>
          <p className="font-semibold text-charcoal">{t("home.features.protectedContact.title")}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">{t("home.features.protectedContact.description")}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-[32px] bg-charcoal px-8 py-14">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-widest text-turquoise">Process</p>
          <h2 className="mt-2 text-3xl font-bold text-white">How It Works</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-3xl bg-white/5 p-6 text-white">
              <p className="text-4xl font-black text-turquoise/40">{step.number}</p>
              <p className="mt-3 font-semibold">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-[32px] bg-gradient-to-r from-turquoise to-softgreen p-12 text-center text-white shadow-lg">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-3 text-white/80">Join HomeTutors today — whether you're a tutor or a recruiter.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/signup" className="rounded-2xl bg-white px-8 py-3 text-sm font-bold text-charcoal shadow hover:bg-slate-100">
            Create Account
          </Link>
          <Link to="/tutors" className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white hover:bg-white/20">
            Browse Tutors
          </Link>
        </div>
      </div>

    </div>
  );
};

export default HomePage;
