(function () {
  "use strict";

  const CONFIG = {
    url: "https://wwfqtxpkkpzqtnrgkitm.supabase.co",
    publishableKey: "sb_publishable_Fz_ywlASz5r2P5tokEgX5A_7g17kZbn"
  };

  function isConfigured() {
    return Boolean(
      CONFIG.url &&
      CONFIG.publishableKey &&
      !CONFIG.url.includes("YOUR_SUPABASE") &&
      !CONFIG.publishableKey.includes("YOUR_SUPABASE") &&
      window.supabase?.createClient
    );
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!window.CampusXSupabaseClient) {
      window.CampusXSupabaseClient = window.supabase.createClient(CONFIG.url, CONFIG.publishableKey);
    }
    return window.CampusXSupabaseClient;
  }

  window.CampusXSupabaseConfig = {
    ...CONFIG,
    isConfigured,
    getClient
  };
})();
