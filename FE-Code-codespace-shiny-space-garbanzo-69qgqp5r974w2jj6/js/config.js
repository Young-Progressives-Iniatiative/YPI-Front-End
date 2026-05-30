// Config module - central  hub for API communication

const config = (() => {
  let settings = {}; // settings dictionary 

  async function loadSettings() {
    // loads settings from settings.json within config folder
    try {
      const response = await fetch("/config/settings.json");
      if (!response.ok) throw new Error("Failed to load settings");
      settings = await response.json();
      return settings;
    } catch (error) {
      // if there is an error with recieving the settings.json (i.e. it was deleted, corrupted, etc.), we instead load the defaults
      console.error("Settings load error:", error);
      return getDefaults();
    }
  }

  function getDefaults() {
    // getDefaults - acts a safety net with hardcoded values that mimic what should be in settings.json
    // this allows it to run if something goes wrong with the settings.json
    return {
      api: {
        baseUrl: process.env.API_URL || "http://localhost:3000/api", // calls API from env, or localhost for testing
        endpoints: {
          cms: "/cms",
          blog: "/blog",
          team: "/team",
          events: "/events",
          contact: "/contact",
          interest: "/interest",
          donate: "/donate",
        },
      },
      cms: {
        // defines Content Management System
        type: "custom",
        editableFields: ["mission", "bio", "testimonials", "articles"],
      },
      accessibility: {
        // defines accessibility rules
        wcagLevel: "AA",
        minContrastRatio: 4.5,
        focusIndicatorWidth: "3px"
      },
      languages: {
        default: "en",
        supported: ["en", "es", "fr"], // languages currently supported
      },
      features: {
        // feature toggles - allows to turn features on or off
        // in case a feature breaks, we can toggle features on or off and allow the overall site to still work
        cookieConsent: true,
        multiLanguage: true,
        darkMode: true,
        analytics: true,
      },
    };
  }

  // gets API URL function
  function getAPIURL(endpoint) {
    // reads API from settings.json otherwise uses getDefalt's api
    const base = settings.api?.baseUrl || getDefaults().api.baseUrl;
    return `${base}${endpoint}`;
  }

  // Fetch method w/ error handling
  async function api(endpoint, options = {}) {
    const url = getAPIURL(endpoint);
    const defaultOptions = { // creates a object that holds the config of how a browser should use a API request
      headers: {
        "Content-Type": "application/json", // data format defaults to JSON as we mostly works with JSON, 
      },
      ...options, // takes any custom configs pass into function within options and dumps into this new defaultOptions object
    };


    // try catch ensure that the website doesnt crash wehn talking to API 
    try {
      const response = await fetch(url, defaultOptions); // triggers newtwork reuest to url with defaultOptions object

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      return { success: false, error: error.message };
    }
  }

  // GET request function
  async function get(endpoint) {
    return api(endpoint, { method: "GET" });
  }

  // POST request function
  async function post(endpoint, data) {
    return api(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request function
  async function put(endpoint, data) {
    return api(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request function
  async function deleteRequest(endpoint) {
    return api(endpoint, { method: "DELETE" });
  }

  // Get specific setting
  function get(key, defaultValue = null) {
    const keys = key.split(".");
    let value = settings;

    for (const k of keys) {
      value = value?.[k];
    }

    return value !== undefined ? value : defaultValue;
  }

  // Initialize configuration
  async function init() {
    await loadSettings();
    console.log("Configuration loaded:", settings);
  }

  return { // woth this return makes these functions public
    init,
    loadSettings,
    getDefaults,
    getAPIURL,
    api,
    get,
    post,
    put,
    deleteRequest,
    settings: () => settings,
  };
})();

