document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  const portal = document.getElementById("portal");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const rememberMe = document.getElementById("remember-me");
  const submit = document.getElementById("login-submit");
  const status = document.getElementById("login-status");
  const toggle = document.getElementById("password-toggle");
  const forgot = document.getElementById("forgot-password");
  const portalInfo = document.getElementById("portal-info");
  const portalInfoText = document.getElementById("portal-info-text");
  const portalInfoIcon = document.getElementById("portal-info-icon");
  const toast = document.getElementById("login-toast");

  const portalDetails = {
    SUPER_ADMIN: { icon: "fa-building-columns", text: "Director-level institutional governance, monitoring, reports, audit visibility and strategic oversight." },
    INSTITUTE_ADMIN: { icon: "fa-building-user", text: "Manage institutional master records including students, faculty, programs, courses, departments, subjects, classes and academic years." },
    STUDENT_ADMIN: { icon: "fa-user-graduate", text: "Manage existing student records, requests, documents, academic information and operational student workflows." },
    FACULTY_ADMIN: { icon: "fa-chalkboard-user", text: "Manage faculty operations, lectures, timetable, attendance workflows, teaching resources and faculty services." },
    CR_ADMIN: { icon: "fa-users", text: "Coordinate assigned class information, communication, requests and representative responsibilities." },
    COUNCIL_ADMIN: { icon: "fa-people-group", text: "Manage council activities, events, initiatives and student engagement workflows." },
    CRC_ADMIN: { icon: "fa-building", text: "Coordinate company outreach, recruiters, placement opportunities and campus drives." },
    STUDENT_USER: { icon: "fa-user", text: "Access approved student dashboard, personal academic information, attendance summary, notices, documents and requests." }
  };

  const errorMap = {
    portal: document.getElementById("portal-error"),
    username: document.getElementById("username-error"),
    password: document.getElementById("password-error")
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3400);
  };

  const setFieldError = (field, message) => {
    const wrapper = field.closest(".form-field");
    const error = errorMap[field.name] || document.getElementById(`${field.id}-error`);
    wrapper?.classList.toggle("invalid", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
  };

  const setStatus = (message, type = "info") => {
    status.textContent = message;
    status.className = `login-status ${type}`;
    status.hidden = false;
  };

  const clearStatus = () => {
    status.textContent = "";
    status.className = "login-status";
    status.hidden = true;
  };

  const updatePortalInfo = () => {
    const detail = portalDetails[portal.value];
    if (!detail) {
      portalInfo.hidden = true;
      return;
    }
    portalInfoIcon.className = `fa-solid ${detail.icon}`;
    portalInfoText.textContent = detail.text;
    portalInfo.hidden = false;
  };

  const validatePortal = () => {
    if (!portal.value) {
      setFieldError(portal, "Please select a portal for context.");
      return false;
    }
    setFieldError(portal, "");
    return true;
  };

  const validateUsername = () => {
    const value = username.value.trim();
    if (!value) {
      setFieldError(username, "Please enter your email.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldError(username, "Please enter a valid email address.");
      return false;
    }
    setFieldError(username, "");
    return true;
  };

  const validatePassword = () => {
    if (!password.value) {
      setFieldError(password, "Please enter your password.");
      return false;
    }
    setFieldError(password, "");
    return true;
  };

  const setLoading = (loading) => {
    submit.disabled = loading;
    submit.setAttribute("aria-busy", String(loading));
    submit.querySelector(".button-label").hidden = loading;
    submit.querySelector(".button-loading").hidden = !loading;
    submit.querySelector(".button-arrow").hidden = loading;
  };

  portal.addEventListener("change", () => {
    updatePortalInfo();
    validatePortal();
    clearStatus();
  });

  [portal, username, password].forEach(field => {
    field.addEventListener("input", () => {
      clearStatus();
      if (field === portal) validatePortal();
      if (field === username) validateUsername();
      if (field === password) validatePassword();
    });
  });

  toggle?.addEventListener("click", () => {
    const visible = password.type === "text";
    password.type = visible ? "password" : "text";
    toggle.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    toggle.setAttribute("aria-pressed", String(!visible));
    toggle.innerHTML = `<i class="fa-regular ${visible ? "fa-eye" : "fa-eye-slash"}" aria-hidden="true"></i>`;
  });

  forgot?.addEventListener("click", async () => {
    if (!validateUsername()) return;
    setStatus("Sending Supabase password recovery request...", "info");
    const result = await window.CampusXSupabaseAuth.resetPassword(username.value.trim());
    setStatus(result.message, result.ok ? "success" : "error");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus();

    const valid = [validatePortal(), validateUsername(), validatePassword()].every(Boolean);
    if (!valid) {
      setStatus("Please correct the highlighted fields before signing in.", "error");
      showToast("Please check the highlighted fields.");
      return;
    }

    setLoading(true);
    setStatus("Verifying account with Supabase Auth...", "info");
    try {
      const result = await window.CampusXSupabaseAuth.signIn(username.value.trim(), password.value);
      if (!result.ok) {
        setStatus(result.message, "error");
        showToast(result.message);
        return;
      }
      if (portal.value && portal.value !== result.role) {
        setStatus(`Authenticated role is ${result.role}. Redirecting to the authorized dashboard.`, "warning");
      } else {
        setStatus("Login successful. Opening authorized dashboard...", "success");
      }
      window.setTimeout(() => { window.location.href = result.route; }, 600);
    } catch (error) {
      setStatus(error.message || "Login failed. Check Supabase configuration and migrations.", "error");
    } finally {
      setLoading(false);
    }

    void rememberMe?.checked;
  });

  updatePortalInfo();
});
