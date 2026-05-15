import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:4000/api/auth/login", { phone, password });
      localStorage.setItem("hometutors_token", response.data.data.token);
      window.dispatchEvent(new Event("authChange"));
      const role = response.data.data.user.role;
      if (role === "TUTOR") {
        navigate("/dashboard/tutor");
      } else if (role === "RECRUITER") {
        navigate("/dashboard/recruiter");
      } else if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-[32px] bg-white p-8 shadow-lg">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-turquoise">{t('login.title')}</p>
        <h1 className="mt-3 text-3xl font-bold text-charcoal">{t('login.heading')}</h1>
        <p className="mt-2 text-slate-500">{t('login.subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="space-y-2">
          <span className="text-sm font-medium text-charcoal">{t('login.phone')}</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('login.phonePlaceholder')} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-charcoal">{t('login.password')}</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('login.passwordPlaceholder')} />
        </label>
        {error && <p className="text-sm text-crimson">{error}</p>}
        <div className="flex justify-end">
          <PrimaryButton label={loading ? t('login.loggingIn') : t('login.loginButton')} type="submit" />
        </div>
      </form>
    </section>
  );
};

export default LoginPage;
