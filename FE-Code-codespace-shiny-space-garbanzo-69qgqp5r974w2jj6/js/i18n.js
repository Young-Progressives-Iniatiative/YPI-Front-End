// i18n -internationalization
// Multi-language support module

const i18n = (() => {
  let currentLanguage = localStorage.getItem("language") || "en"; // object to hold current language in use for the website
  let translations = {}; // dictionary data structure to hold reference code and its corresponding translations

  // Load translations dictionary
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
      translations[lang] = await response.json();
      return translations[lang];
    } catch (error) {
      console.error("Translation load error:", error);
      return translations[lang] || {};
    }
  }

  // function to change language 
  async function setLanguage(lang) {
    if (lang === currentLanguage) return; // if lang is the same as the current language, doesn't need to do anything
    if (!translations[lang]) { // if lang isn't already within translations, calls loadTranslation 
      await loadTranslations(lang);
    }

    currentLanguage = lang; // update currentLangage
    localStorage.setItem("language", lang);
  }

  return {
    loadTranslations,
    setLanguage
  };
})();
