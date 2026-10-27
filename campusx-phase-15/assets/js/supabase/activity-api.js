(function () {
  "use strict";
  async function logActivity(entry) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "No authenticated user." };
    const { error } = await supabase.from("activity_logs").insert({
      actor_user_id: user.id,
      actor_role: entry.actor_role || null,
      module: entry.module,
      action: entry.action,
      record_type: entry.record_type || null,
      record_id: entry.record_id || null,
      description: entry.description || null
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  }
  window.CampusXActivityAPI = { logActivity };
})();
