(function () {
  "use strict";

  function client() {
    return window.CampusXSupabaseConfig?.getClient?.() || null;
  }

  async function signIn(email, password) {
    const supabase = client();
    if (!supabase) {
      return { ok: false, message: "Supabase is not configured yet. Add your project URL and publishable key in assets/js/supabase/supabase-client.js." };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: String(email || "").trim().toLowerCase(), password });
    if (error) return { ok: false, message: error.message || "Invalid email or password." };
    const resolved = await window.CampusXRoleRouter.resolveRole(data.user.id);
    if (!resolved.ok) {
      await supabase.auth.signOut();
      return { ok: false, message: resolved.message || "No active portal role assigned." };
    }
    return { ok: true, role: resolved.role, route: resolved.route, user: data.user };
  }

  async function signOut() {
    const supabase = client();
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = window.location.pathname.includes("/") ? "../login.html" : "login.html";
  }

  async function resetPassword(email) {
    const supabase = client();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const redirectTo = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "/auth/reset-password.html")}`;
    const { error } = await supabase.auth.resetPasswordForEmail(String(email || "").trim().toLowerCase(), { redirectTo });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "If this email is registered, Supabase will send password recovery instructions." };
  }

  async function updatePassword(newPassword) {
    const supabase = client();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Password updated successfully. Please sign in again." };
  }

  async function currentUser() {
    const supabase = client();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
  }

  document.addEventListener("click", async (event) => {
    const logout = event.target.closest("[data-logout='true'], [data-supabase-logout]");
    if (logout) {
      event.preventDefault();
      await signOut();
    }
  });

  window.CampusXSupabaseAuth = { signIn, signOut, resetPassword, updatePassword, currentUser };
})();
