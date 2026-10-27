(function () {
  "use strict";

  function isProfilePage() {
    const page = document.body?.dataset?.dashboardPage || "";
    return ["profile", "profile-account", "settings"].includes(page);
  }

  function addSupabasePasswordCard() {
    if (!isProfilePage()) return;
    const main = document.querySelector(".dashboard-main") || document.querySelector("main");
    if (!main || main.querySelector("#account-password-card")) return;
    const card = document.createElement("section");
    card.className = "card account-password-card";
    card.id = "account-password-card";
    card.innerHTML = `<div class="section-head"><div><span class="eyebrow">SUPABASE AUTH</span><h2>Change Password</h2><p>Update the authenticated Supabase account password. Passwords are managed by Supabase Auth, not stored in frontend JavaScript.</p></div></div><form id="account-password-form" class="account-password-form" novalidate><label class="form-field"><span>New Password</span><input id="account-new-password" type="password" autocomplete="new-password" minlength="10" required placeholder="Minimum 10 characters"></label><label class="form-field"><span>Confirm New Password</span><input id="account-confirm-password" type="password" autocomplete="new-password" minlength="10" required placeholder="Repeat new password"></label><p class="account-form-status" id="account-password-status" hidden></p><button class="btn btn-primary" type="submit">Update Password</button></form><p class="account-security-note">Supabase Auth handles password hashing and recovery emails. Do not store password hints or credentials in browser storage.</p>`;
    main.appendChild(card);
    const form = card.querySelector("#account-password-form");
    const status = card.querySelector("#account-password-status");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const next = card.querySelector("#account-new-password").value;
      const confirm = card.querySelector("#account-confirm-password").value;
      status.hidden = false;
      if (next.length < 10) {
        status.className = "account-form-status error";
        status.textContent = "Password must contain at least 10 characters.";
        return;
      }
      if (next !== confirm) {
        status.className = "account-form-status error";
        status.textContent = "New password and confirm password do not match.";
        return;
      }
      const result = await window.CampusXSupabaseAuth.updatePassword(next);
      status.className = `account-form-status ${result.ok ? "success" : "error"}`;
      status.textContent = result.message;
      if (result.ok) form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", () => window.setTimeout(addSupabasePasswordCard, 250));
  window.CampusXAccountSecurity = { addSupabasePasswordCard };
})();
