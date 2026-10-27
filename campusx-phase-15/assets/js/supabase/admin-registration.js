(function () {
  "use strict";

  const ADMIN_ROLE_KEYS = new Set([
    "SUPER_ADMIN",
    "INSTITUTE_ADMIN",
    "STUDENT_ADMIN",
    "FACULTY_ADMIN",
    "CR_ADMIN",
    "COUNCIL_ADMIN",
    "CRC_ADMIN"
  ]);

  function setStatus(el, message, type) {
    if (!el) return;
    el.hidden = false;
    el.className = `login-status ${type || "info"}`;
    el.textContent = message;
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function strongEnough(password) {
    return password.length >= 10 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);
  }

  async function submitAdminRegistration(form) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };

    const data = Object.fromEntries(new FormData(form).entries());
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");
    const confirm = String(data.confirmPassword || "");
    const fullName = String(data.fullName || "").trim();
    const requestedRole = String(data.requestedRole || "").trim().toUpperCase();

    if (!fullName || !email || !requestedRole || !password || !confirm) {
      return { ok: false, message: "Complete all required fields." };
    }
    if (!validEmail(email)) return { ok: false, message: "Enter a valid email address." };
    if (!ADMIN_ROLE_KEYS.has(requestedRole)) return { ok: false, message: "Select a valid administrative role." };
    if (password !== confirm) return { ok: false, message: "Password and confirm password must match." };
    if (!strongEnough(password)) {
      return { ok: false, message: "Password must be at least 10 characters and include uppercase, lowercase, a number and a symbol." };
    }

    /*
     * IMPORTANT:
     * Do not insert into public.profiles or public.admin_registration_requests here.
     * With Supabase email confirmation enabled, signUp() can create auth.users without
     * creating an authenticated browser session. A direct browser insert would then
     * fail RLS because auth.uid() is null. Migration 011 installs a SECURITY DEFINER
     * auth.users trigger that creates the pending profile and registration request.
     */
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_category: "ADMIN",
          full_name: fullName,
          requested_role: requestedRole
        }
      }
    });

    if (signUpError) {
      return { ok: false, message: signUpError.message || "Unable to submit the registration request." };
    }
    if (!signUpData?.user) {
      return { ok: false, message: "Registration could not be completed. Please try again." };
    }

    // If email confirmation is disabled, signUp can return a live session. Pending
    // administrators should not remain signed in before approval.
    if (signUpData.session) {
      await supabase.auth.signOut();
    }

    const message = signUpData.session
      ? "Registration submitted. Your account is pending Super Admin approval."
      : "Registration submitted. Check your email if verification is required. Your requested role remains pending until Super Admin approval.";

    return { ok: true, message };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-admin-registration-form]");
    if (!form) return;
    const status = document.getElementById("admin-register-status");
    const submitButton = form.querySelector('button[type="submit"]');

    form.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.target || "");
        if (!target) return;
        const willShow = target.type === "password";
        target.type = willShow ? "text" : "password";
        button.setAttribute("aria-pressed", String(willShow));
        button.setAttribute("aria-label", `${willShow ? "Hide" : "Show"} ${target.id === "confirmPassword" ? "confirm password" : "password"}`);
        const icon = button.querySelector("i");
        if (icon) icon.className = `fa-regular ${willShow ? "fa-eye-slash" : "fa-eye"}`;
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitButton) submitButton.disabled = true;
      setStatus(status, "Submitting registration request...", "info");
      try {
        const result = await submitAdminRegistration(form);
        setStatus(status, result.message, result.ok ? "success" : "error");
        if (result.ok) form.reset();
      } catch (error) {
        console.error("Admin registration failed:", error);
        setStatus(status, "Unable to complete registration right now. Please try again.", "error");
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  });

  window.CampusXAdminRegistration = { submitAdminRegistration };
})();
