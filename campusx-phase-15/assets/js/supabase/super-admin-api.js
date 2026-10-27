(function () {
  "use strict";

  async function invoke(name, payload) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const { data, error } = await supabase.functions.invoke(name, { body: payload || {} });
    if (error) return { ok: false, message: error.message };
    return data || { ok: true };
  }

  async function listAdminRegistrations() {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, data: [], message: "Supabase is not configured yet." };
    const { data, error } = await supabase.from("admin_registration_requests").select("*").order("created_at", { ascending: false });
    if (error) return { ok: false, data: [], message: error.message };
    return { ok: true, data };
  }

  async function renderAdminRegistrationsPage() {
    if (document.body.dataset.dashboardPage !== "admin-registrations") return;
    const main = document.querySelector(".dashboard-main") || document.querySelector("main") || document.getElementById("dashboard-app");
    if (!main) return;
    main.innerHTML = `<div class="page-heading"><div><span class="eyebrow">SUPER ADMIN · SUPABASE</span><h1>Admin Registrations</h1><p>Review pending administrative account requests. Approval is handled through the active Supabase Edge Function set.</p></div></div><section class="card"><div class="section-head"><div><h2>Registration Requests</h2><p id="admin-registration-status">Loading Supabase requests...</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Requested Role</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody id="admin-registration-body"><tr><td colspan="6">Loading...</td></tr></tbody></table></div></section>`;
    const body = document.getElementById("admin-registration-body");
    const status = document.getElementById("admin-registration-status");
    const result = await listAdminRegistrations();
    if (!result.ok) {
      status.textContent = result.message;
      body.innerHTML = `<tr><td colspan="6">${result.message}</td></tr>`;
      return;
    }
    status.textContent = `${result.data.length} request(s) found.`;
    body.innerHTML = result.data.map(row => `<tr><td>${row.full_name}</td><td>${row.email}</td><td>${row.requested_role}</td><td><span class="status-badge">${row.status}</span></td><td>${new Date(row.created_at).toLocaleString()}</td><td>${row.status === "PENDING" ? `<button class="btn btn-sm btn-primary" data-approve-admin="${row.id}">Approve</button>` : `<span class="muted">No action</span>`}</td></tr>`).join("") || `<tr><td colspan="6">No registration requests.</td></tr>`;
  }

  document.addEventListener("click", async (event) => {
    const approve = event.target.closest("[data-approve-admin]");
    if (!approve) return;
    const id = approve.dataset.approveAdmin;
    const result = await invoke("approve-admin-registration", { request_id: id });
    alert(result.message || (result.ok ? "Action completed." : "Action failed."));
    if (result.ok) renderAdminRegistrationsPage();
  });

  document.addEventListener("DOMContentLoaded", renderAdminRegistrationsPage);

  window.CampusXSuperAdminAPI = { listAdminRegistrations, renderAdminRegistrationsPage };
})();
