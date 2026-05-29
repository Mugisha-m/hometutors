import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getToken, getUserRole } from "../lib/auth";

const Footer = () => {
  const { t } = useTranslation();
  const token = getToken();
  const role = getUserRole();
  const dashboardLink = role === "ADMIN" ? "/admin" : role === "RECRUITER" ? "/dashboard/recruiter" : "/dashboard/tutor";

  return (
    <footer className="bg-charcoal text-slate-300 mt-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          
          {/* Logo & Description */}
          <div className="space-y-4 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-turquoise px-3 py-2 text-white font-bold text-sm">HT</div>
              <span className="text-xl font-bold text-white tracking-wide">{t("app.name")}</span>
            </div>
            <p className="max-w-md text-sm text-slate-400 leading-relaxed">
              {t("footer.desc")}
            </p>
            <p className="text-xs text-turquoise/80 italic font-medium">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{t("footer.links")}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-turquoise transition-colors duration-150">{t("nav.home")}</Link>
              </li>
              <li>
                <Link to="/tutors" className="hover:text-turquoise transition-colors duration-150">{t("nav.tutors")}</Link>
              </li>
              {token && (
                <>
                  <li>
                    <Link to="/messages" className="hover:text-turquoise transition-colors duration-150">{t("nav.messages")}</Link>
                  </li>
                  <li>
                    <Link to={dashboardLink} className="hover:text-turquoise transition-colors duration-150">
                      {role === "ADMIN" ? t("nav.admin") : t("nav.dashboard")}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">{t("footer.contact")}</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+250 799 399 575</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span className="break-all">info@hometutors.rw</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="my-8 border-slate-800" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {t("app.name")}. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-turquoise transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-turquoise transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
