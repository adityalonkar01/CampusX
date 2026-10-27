(function () {
  "use strict";

  async function invoke(name, payload) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const { data, error } = await supabase.functions.invoke(name, { body: payload || {} });
    if (error) return { ok: false, message: error.message };
    return data || { ok: true };
  }

  async function listStudentRequests() {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, data: [], message: "Supabase is not configured yet." };
    const { data, error } = await supabase.from("student_account_requests").select("*").order("created_at", { ascending: false });
    if (error) return { ok: false, data: [], message: error.message };
    return { ok: true, data };
  }

  const approveStudentAccount = (requestId) => invoke("approve-student-account", { request_id: requestId });
  const suspendStudentAccount = (requestId) => invoke("suspend-student-account", { request_id: requestId });
  const activateStudentAccount = (requestId) => invoke("activate-student-account", { request_id: requestId });

  window.CampusXInstituteAdminAPI = {
    invoke,
    listStudentRequests,
    approveStudentAccount,
    suspendStudentAccount,
    activateStudentAccount
  };
})();
