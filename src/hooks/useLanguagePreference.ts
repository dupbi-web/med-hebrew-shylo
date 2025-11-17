import { useState, useEffect } from 'react';

const LANGUAGE_PREFERENCE_KEY = 'languagePreference';

export function useLanguagePreference() {
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (stored) {
      setLanguage(stored);
    }
  }, []);

  const setLanguagePreference = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
  };

  return {
    language,
    setLanguagePreference,
  };
}

export function getLanguagePreference(): string | null {
  return localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
}

export function setLanguagePreferenceSync(lang: string): void {
  localStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
}
