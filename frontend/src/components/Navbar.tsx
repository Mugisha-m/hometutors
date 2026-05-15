import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { getToken, getUserRole, logout } from "../lib/auth";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());

  const dashboardLink = role === "ADMIN" ? "/admin" : role === "RECRUITER" ? "/dashboard/recruiter" : "/dashboard/tutor";
  const dashboardLabel = role === "ADMIN" ? t('nav.admin') : t('nav.dashboard');

  const syncAuth = () => {
    setToken(getToken());
    setRole(getUserRole());
  };

  useEffect(() => {
    window.addEventListener("storage", syncAuth);
    window.addEventListener("authChange", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("authChange", syncAuth);
    };
  }, []);


  const links = [
    { label: t('nav.home'), to: "/" },
    { label: t('nav.tutors'), to: "/tutors" }
  ];

  if (token) {
    links.push({ label: t('nav.messages'), to: "/messages" });
  }

  if (role === "ADMIN") {
    links.push({ label: t('nav.admin'), to: "/admin" });
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-turquoise px-3 py-2 text-white">HT</div>
            <div>
              <p className="font-bold text-charcoal">{t('app.name')}</p>
              <p className="text-sm text-slate-500">{t('nav.tagline')}</p>
            </div>
          </div>
          <button
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-charcoal md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? t('nav.close') : t('nav.menu')}
          </button>
        </div>

        <div className={`flex flex-col gap-4 md:flex-row md:items-center ${menuOpen ? "block" : "hidden"} md:block`}>
          <nav className="flex flex-col gap-2 text-sm font-medium text-charcoal md:flex-row md:gap-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? "rounded-2xl bg-turquoise/10 px-4 py-2 text-turquoise" : "rounded-2xl px-4 py-2 text-charcoal hover:bg-slate-100"
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">
            <LanguageSwitcher />
            {token ? (
              <>
                <NavLink
                  to={dashboardLink}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-charcoal shadow-sm hover:border-turquoise hover:text-turquoise"
                  onClick={() => setMenuOpen(false)}
                >
                  {dashboardLabel}
                </NavLink>
                <button
                  onClick={logout}
                  className="rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-600"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 md:flex-row">
                <NavLink
                  to="/login"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-charcoal shadow-sm hover:border-turquoise hover:text-turquoise"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.login')}
                </NavLink>
                <NavLink
                  to="/signup"
                  className="rounded-full bg-softgreen px-4 py-2 text-sm text-white shadow-sm hover:bg-emerald-500"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.signup')}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
