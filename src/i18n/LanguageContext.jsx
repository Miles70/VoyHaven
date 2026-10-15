import { supportedLanguages, normalizeLanguage, requestedLanguage } from "../../shared/languages.js";
import { useLocation, useNavigate } from "react-router-dom";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import translations from "./translations";

const LanguageContext = createContext(null);

function detectInitialLanguage() {
  const urlLanguage = requestedLanguage(new URLSearchParams(globalThis.window?.location?.search || "").get("lang")) || requestedLanguage(globalThis.window?.location?.pathname?.split("/")[1]);
  if (supportedLanguages.includes(urlLanguage)) {
    try { localStorage.setItem("language", urlLanguage); } catch { /* Optional storage. */ }
    return urlLanguage;
  }
  let savedLanguage;
  try { savedLanguage = localStorage.getItem("language"); } catch { /* Optional storage. */ }

  if (supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguage = globalThis.navigator?.language || "";

  return normalizeLanguage(browserLanguage);
}

export function RoutedLanguageProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  return <LanguageProvider location={location} navigate={navigate}>{children}</LanguageProvider>;
}

export function LanguageProvider({ children, location, navigate, initialLanguage }) {
  const [preferredLanguage, setLanguageState] = useState(() => initialLanguage || detectInitialLanguage());
  const queryLanguage = new URLSearchParams(location?.search || "").get("lang");
  const urlLanguage = requestedLanguage(queryLanguage) || requestedLanguage(location?.pathname?.split("/")[1]);
  const language = urlLanguage || preferredLanguage;

  useEffect(() => {
    if (urlLanguage) {
      setLanguageState(urlLanguage);
      try { localStorage.setItem("language", urlLanguage); } catch { /* Optional storage. */ }
    }
  }, [urlLanguage]);

  useEffect(() => {
    if (!location || !navigate || urlLanguage) return;
    const params = new URLSearchParams(location.search);
    params.set("lang", language);
    navigate({ pathname: location.pathname, search: `?${params}`, hash: location.hash }, { replace: true, state: location.state });
  }, [location, navigate, language, urlLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const setLanguage = useCallback((nextLanguage) => {
    if (!supportedLanguages.includes(nextLanguage)) {
      return;
    }

    try { localStorage.setItem("language", nextLanguage); } catch { /* Optional storage. */ }
    setLanguageState(nextLanguage);
    if (location && navigate) {
      const params = new URLSearchParams(location.search);
      params.set("lang", nextLanguage);
      navigate({ pathname: location.pathname, search: `?${params}`, hash: location.hash }, { replace: true, state: location.state });
    }
  }, [location, navigate]);

  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en;

    function t(path) {
      return path.split(".").reduce((current, key) => {
        return current?.[key];
      }, dictionary) || path;
    }

    return {
      language,
      setLanguage,
      supportedLanguages,
      t,
    };
  }, [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}