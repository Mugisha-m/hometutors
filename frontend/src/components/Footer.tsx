import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getToken, getUserRole } from "../lib/auth";

const Footer = () => {
  const { t } = useTranslation();
  const token = getToken();
  const role = getUserRole();
  const dashboardLink = role === "ADMIN" ? "/admin" : role === "RECRUITER" ? "/dashboard/recruiter" : "/dashboard/tutor";

  return (
    <footer className="mt-16 border-t border-slate-800 bg-charcoal text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-4 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-turquoise px-3 py-2 text-sm font-bold text-white">HT</div>
              <span className="text-xl font-bold tracking-wide text-white">{t("app.name")}</span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              {t("footer.desc")}
            </p>
            <p className="text-xs font-medium italic text-turquoise/80">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{t("footer.links")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="transition-colors duration-150 hover:text-turquoise">{t("nav.home")}</Link>
              </li>
              <li>
                <Link to="/tutors" className="transition-colors duration-150 hover:text-turquoise">{t("nav.tutors")}</Link>
              </li>
              {token && (
                <>
                  <li>
                    <Link to="/messages" className="transition-colors duration-150 hover:text-turquoise">{t("nav.messages")}</Link>
                  </li>
                  <li>
                    <Link to={dashboardLink} className="transition-colors duration-150 hover:text-turquoise">
                      {role === "ADMIN" ? t("nav.admin") : t("nav.dashboard")}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{t("footer.contact")}</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="min-w-14 text-slate-500">Phone</span>
                <a href="tel:+250799399575" className="transition-colors hover:text-turquoise">+250 799 399 575</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-14 text-slate-500">Email</span>
                <a href="mailto:mugisharutijanaalbert@gmail.com" className="break-all transition-colors hover:text-turquoise">mugisharutijanaalbert@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="min-w-14 text-slate-500">Base</span>
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-slate-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>Copyright {new Date().getFullYear()} {t("app.name")}. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <Link to="/signup" className="transition-colors hover:text-turquoise">{t("nav.signup")}</Link>
            <span>|</span>
            <Link to="/login" className="transition-colors hover:text-turquoise">{t("nav.login")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
