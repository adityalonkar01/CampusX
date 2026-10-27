(function () {
  "use strict";

  const ADMIN_ROUTES = {
    SUPER_ADMIN: "super-admin/dashboard.html",
    INSTITUTE_ADMIN: "admin/dashboard.html",
    STUDENT_ADMIN: "student/dashboard.html",
    FACULTY_ADMIN: "faculty/dashboard.html",
    CR_ADMIN: "cr/dashboard.html",
    COUNCIL_ADMIN: "council/dashboard.html",
    CRC_ADMIN: "crc/dashboard.html"
  };

  const ROLE_PREFIXES = {
    SUPER_ADMIN: "super-admin/",
    INSTITUTE_ADMIN: "admin/",
    STUDENT_ADMIN: "student/",
    FACULTY_ADMIN: "faculty/",
    CR_ADMIN: "cr/",
    COUNCIL_ADMIN: "council/",
    CRC_ADMIN: "crc/",
    STUDENT_USER: "student-portal/"
  };

  function routeForRole(role) {
    if (role === "STUDENT_USER") return "student-portal/dashboard.html";
    return ADMIN_ROUTES[role] || "unauthorized.html";
  }

  function relativeRoute(route) {
    const path = window.location.pathname;
    const depth = path.split("/").filter(Boolean).length - 1;
    if (depth <= 0) return route;
    return "../".repeat(depth) + route;
  }

  async function resolveRole(userId) {
    const client = window.CampusXSupabaseConfig?.getClient?.();
    if (!client || !userId) return { ok: false, message: "Supabase is not configured." };

    const { data: adminRows, error: adminError } = await client
      .from("admin_users")
      .select("role_key,status")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .limit(1);
    if (adminError) throw adminError;
    if (Array.isArray(adminRows) && adminRows.length) {
      return { ok: true, role: adminRows[0].role_key, route: routeForRole(adminRows[0].role_key) };
    }

    const { data: studentRows, error: studentError } = await client
      .from("student_users")
      .select("role_key,status,student_record_id")
      .eq("user_id", userId)
      .eq("role_key", "STUDENT_USER")
      .eq("status", "ACTIVE")
      .limit(1);
    if (studentError) throw studentError;
    if (Array.isArray(studentRows) && studentRows.length) {
      return { ok: true, role: "STUDENT_USER", route: routeForRole("STUDENT_USER"), studentRecordId: studentRows[0].student_record_id };
    }

    const { data: profile } = await client
      .from("profiles")
      .select("status,user_category")
      .eq("id", userId)
      .maybeSingle();
    const status = profile?.status || "PENDING";
    return { ok: false, status, message: status === "PENDING" ? "Your account is pending approval." : "No active portal role is assigned to this account." };
  }

  async function redirectCurrentUser() {
    const client = window.CampusXSupabaseConfig?.getClient?.();
    if (!client) return { ok: false, message: "Supabase is not configured." };
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return { ok: false, message: "No authenticated Supabase user." };
    const resolved = await resolveRole(user.id);
    if (!resolved.ok) return resolved;
    window.location.href = relativeRoute(resolved.route);
    return resolved;
  }

  async function guardPage(expectedRole) {
    const client = window.CampusXSupabaseConfig?.getClient?.();
    if (!client || !expectedRole) return;
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      window.location.href = relativeRoute("login.html");
      return;
    }
    const resolved = await resolveRole(user.id);
    if (!resolved.ok || resolved.role !== expectedRole) {
      window.location.href = relativeRoute("unauthorized.html");
      return;
    }
    if (expectedRole === "CR_ADMIN") {
      const { data, error: assignmentError } = await client
        .from("class_representative_assignments")
        .select("id,class_id,status,start_date,end_date")
        .eq("cr_user_id", user.id)
        .eq("status", "ACTIVE")
        .order("start_date", { ascending: false })
        .limit(1);
      if (assignmentError) {
        document.body.dataset.crAssignment = "error";
        window.dispatchEvent(new CustomEvent("campusx:cr-assignment-error", { detail: { message: assignmentError.message } }));
        return;
      }
      if (!Array.isArray(data) || !data.length) {
        document.body.dataset.crAssignment = "none";
        window.dispatchEvent(new CustomEvent("campusx:cr-assignment-missing"));
        return;
      }
      document.body.dataset.crAssignment = data[0].class_id || "active";
    }
  }

  function expectedRoleFromPath() {
    const path = window.location.pathname.replace(/^\//, "");
    return Object.entries(ROLE_PREFIXES).find(([, prefix]) => path.includes(prefix))?.[0] || "";
  }


  document.addEventListener("DOMContentLoaded", () => {
    const expected = document.body?.dataset?.role || "";
    if (expected && window.CampusXSupabaseConfig?.isConfigured?.()) {
      guardPage(expected);
    }
  });

  window.CampusXRoleRouter = {
    routeForRole,
    resolveRole,
    redirectCurrentUser,
    guardPage,
    expectedRoleFromPath
  };
})();
