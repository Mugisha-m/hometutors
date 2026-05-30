import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

const PHOTO = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80";

const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ phone: "", email: "", password: "", role: "TUTOR", name: "", companyName: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await api.post("/api/auth/signup", form);
      localStorage.setItem("hometutors_token", res.data.data.token);
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    } catch {
      setError(t("signup.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-xl">
      <div className="grid lg:grid-cols-2">

        {/* Photo side */}
        <div className="relative hidden lg:block">
          <img src={PHOTO} alt="tutoring" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/70 to-softgreen/40 p-10 flex flex-col justify-end">
            <p className="text-2xl font-bold text-white">Join HomeTutors</p>
            <p className="mt-2 text-sm text-white/70">Register as a tutor or recruiter and get started today.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="p-10 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t("signup.title")}</p>
            <h1 className="mt-2 text-2xl font-bold text-charcoal">{t("signup.heading")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("signup.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-charcoal">{t("signup.phone")}</span>
                <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder={t("signup.phonePlaceholder")} />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-charcoal">{t("signup.email")}</span>
                <input value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder={t("signup.emailPlaceholder")} />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-charcoal">{t("signup.password")}</span>
              <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder={t("signup.passwordPlaceholder")} className="w-full" />
            </label>

            {/* Role toggle */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-charcoal">{t("signup.role")}</span>
              <div className="grid grid-cols-2 gap-3">
                {["TUTOR", "RECRUITER"].map((r) => (
                  <button
                    key={r} type="button"
                    onClick={() => handleChange("role", r)}
                    className={`rounded-2xl border py-3 text-sm font-semibold transition ${form.role === r ? "border-turquoise bg-turquoise/10 text-turquoise" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                  >
                    {r === "TUTOR" ? `🎓 ${t("signup.tutor")}` : `🏢 ${t("signup.recruiter")}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-charcoal">{t("signup.name")}</span>
                <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder={t("signup.namePlaceholder")} />
              </label>
              {form.role === "RECRUITER" && (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-charcoal">{t("signup.company")}</span>
                  <input value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} placeholder={t("signup.companyPlaceholder")} />
                </label>
              )}
            </div>

            {error && <p className="text-sm text-crimson">{error}</p>}
            <PrimaryButton label={submitting ? t("signup.creating") : t("signup.createAccount")} type="submit" disabled={submitting} className="w-full justify-center" />
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-turquoise hover:underline">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
