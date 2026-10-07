import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import mr from "./locales/mr.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import bn from "./locales/bn.json";
import gu from "./locales/gu.json";
import pa from "./locales/pa.json";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const STORAGE_KEY = "agromitr_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🌱" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🌾" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🌿" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🍃" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🌽" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🌱" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🌴" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🌾" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🌿" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🌾" },
];

const TRANSLATIONS = {
  en,
  hi,
  mr,
  ta,
  te,
  kn,
  ml,
  bn,
  gu,
  pa,
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || "en";
  });

  const setLanguage = useCallback((newLang) => {
    if (!TRANSLATIONS[newLang]) {
      console.warn(`[i18n] Language '${newLang}' is not supported. Defaulting to 'en'.`);
      newLang = "en";
    }

    setLanguageState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);

    // Sync with backend if user is authenticated
    const token = localStorage.getItem("agromitr_access_token");
    if (token) {
      axios
        .put(
          `${API_URL}/auth/profile`,
          { preferred_language: newLang },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((response) => {
          if (response.data?.user) {
            localStorage.setItem("agromitr_user", JSON.stringify(response.data.user));
          }
        })
        .catch((err) => {
          // Silent catch for background preference sync
          console.debug("[i18n] Failed to sync language with profile:", err?.message);
        });
    }
  }, []);

  const t = useCallback(
    (key, params = null, fallback = null) => {
      const activeDict = TRANSLATIONS[language] || TRANSLATIONS.en;
      let text = activeDict[key];

      if (text === undefined || text === null) {
        // Fallback to English
        text = TRANSLATIONS.en[key];
        if (text === undefined || text === null) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[i18n] Missing translation key: "${key}"`);
          }
          text = fallback || key;
        }
      }

      if (params && typeof params === "object" && typeof text === "string") {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        });
      }

      return text;
    },
    [language]
  );

  const currentLanguageObj = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((lang) => lang.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageObj,
      dictionary: TRANSLATIONS[language] || TRANSLATIONS.en,
    }),
    [language, setLanguage, t, currentLanguageObj]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: "en",
      setLanguage: () => {},
      t: (key, _, fallback) => fallback || key,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageObj: SUPPORTED_LANGUAGES[0],
      dictionary: TRANSLATIONS.en,
    };
  }
  return context;
}

export default LanguageContext;
