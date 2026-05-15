import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ phone: "", email: "", password: "", role: "TUTOR", name: "", companyName: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:4000/api/auth/signup", form);
      localStorage.setItem("hometutors_token", response.data.data.token);
      navigate("/");
    } catch {
      setError(t('signup.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-[32px] bg-white p-8 shadow-lg">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t('signup.title')}</p>
        <h1 className="mt-3 text-3xl font-bold text-charcoal">{t('signup.heading')}</h1>
        <p className="mt-2 text-slate-500">{t('signup.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">{t('signup.phone')}</span>
            <input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder={t('signup.phonePlaceholder')} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">{t('signup.email')}</span>
            <input value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder={t('signup.emailPlaceholder')} />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-charcoal">{t('signup.password')}</span>
          <input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} placeholder={t('signup.passwordPlaceholder')} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-charcoal">{t('signup.role')}</span>
          <select value={form.role} onChange={(e) => handleChange("role", e.target.value)}>
            <option value="TUTOR">{t('signup.tutor')}</option>
            <option value="RECRUITER">{t('signup.recruiter')}</option>
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">{t('signup.name')}</span>
            <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder={t('signup.namePlaceholder')} />
          </label>
          {form.role === "RECRUITER" && (
            <label className="space-y-2">
              <span className="text-sm font-medium text-charcoal">{t('signup.company')}</span>
              <input value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} placeholder={t('signup.companyPlaceholder')} />
            </label>
          )}
        </div>

        {error && <p className="text-sm text-crimson">{error}</p>}

        <div className="flex justify-end">
          <PrimaryButton label={submitting ? t('signup.creating') : t('signup.createAccount')} type="submit" />
        </div>
      </form>
    </section>
  );
};

export default SignupPage;
