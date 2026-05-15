import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-slate-600">{t('language.switch')}:</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          i18n.language === 'en'
            ? 'bg-turquoise text-white'
            : 'bg-slate-200 text-charcoal hover:bg-slate-300'
        }`}
      >
        {t('language.english')}
      </button>
      <button
        onClick={() => changeLanguage('rw')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          i18n.language === 'rw'
            ? 'bg-turquoise text-white'
            : 'bg-slate-200 text-charcoal hover:bg-slate-300'
        }`}
      >
        {t('language.kinyarwanda')}
      </button>
    </div>
  );
};

export default LanguageSwitcher;