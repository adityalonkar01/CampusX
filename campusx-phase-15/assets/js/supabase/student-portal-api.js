(function () {
  "use strict";

  async function getCurrentStudentRecord() {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, message: "No authenticated Student Portal user." };
    const { data: link, error: linkError } = await supabase.from("student_users").select("student_record_id,status").eq("user_id", user.id).eq("role_key", "STUDENT_USER").maybeSingle();
    if (linkError) return { ok: false, message: linkError.message };
    if (!link || link.status !== "ACTIVE") return { ok: false, message: "Student Portal account is not active." };
    const { data: student, error } = await supabase.from("students").select("*").eq("id", link.student_record_id).maybeSingle();
    if (error) return { ok: false, message: error.message };
    return { ok: true, data: student };
  }

  async function createStudentRequest(request) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    if (!supabase) return { ok: false, message: "Supabase is not configured yet." };
    const student = await getCurrentStudentRecord();
    if (!student.ok) return student;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("student_requests").insert({
      student_id: student.data.id,
      request_type: request.request_type,
      description: request.description,
      status: "SUBMITTED",
      created_by: user.id
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Request submitted." };
  }

  window.CampusXStudentPortalAPI = { getCurrentStudentRecord, createStudentRequest };
})();
