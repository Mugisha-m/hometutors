import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

const PHOTO = "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("hometutors_token", res.data.data.token);
      window.dispatchEvent(new Event("authChange"));
      const role = res.data.data.user.role;
      navigate(role === "ADMIN" ? "/admin" : role === "RECRUITER" ? "/dashboard/recruiter" : "/dashboard/tutor");
    } catch {
      setError(t("login.error"));
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
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal/70 to-turquoise/40 p-10 flex flex-col justify-end">
            <p className="text-2xl font-bold text-white">Welcome back to HomeTutors</p>
            <p className="mt-2 text-sm text-white/70">Connect with qualified tutors across Rwanda.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="p-10 space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t("login.title")}</p>
            <h1 className="mt-2 text-2xl font-bold text-charcoal">{t("login.heading")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-charcoal">{t("login.phone")}</span>
              <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} placeholder={t("login.phonePlaceholder")} className="w-full" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-charcoal">{t("login.password")}</span>
              <input type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} placeholder={t("login.passwordPlaceholder")} className="w-full" />
            </label>
            {error && <p className="text-sm text-crimson">{error}</p>}
            <PrimaryButton label={submitting ? t("login.loggingIn") : t("login.loginButton")} type="submit" disabled={submitting} className="w-full justify-center" />
          </form>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <a href="/signup" className="font-semibold text-turquoise hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
