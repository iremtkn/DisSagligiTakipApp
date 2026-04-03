import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from '../app/locales/tr.json';
import en from '../app/locales/en.json';
import de from '../app/locales/de.json';

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    de: { translation: de } 
  },
  lng: 'tr',
  fallbackLng: 'tr',
  interpolation: { escapeValue: false }
});

export default i18n;