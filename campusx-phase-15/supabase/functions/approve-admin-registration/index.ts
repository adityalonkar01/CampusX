import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function clients(req: Request) {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("Authorization") ?? "";
  return {
    userClient: createClient(url, anon, { global: { headers: { Authorization: authHeader } } }),
    adminClient: createClient(url, service),
    token: authHeader.replace("Bearer ", ""),
  };
}

async function getCaller(req: Request) {
  const { userClient, adminClient, token } = clients(req);
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) throw new Error("Unauthenticated request.");
  return { user: data.user, adminClient };
}

async function requireAdminRole(adminClient: any, userId: string, role: string) {
  const { data, error } = await adminClient
    .from("admin_users")
    .select("role_key,status")
    .eq("user_id", userId)
    .eq("role_key", role)
    .eq("status", "ACTIVE")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Requires ${role}.`);
}

async function logActivity(adminClient: any, actor: string, role: string, module: string, action: string, recordType: string, recordId: string, description: string) {
  await adminClient.from("activity_logs").insert({ actor_user_id: actor, actor_role: role, module, action, record_type: recordType, record_id: recordId, description });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { request_id } = await req.json();
    if (!request_id) return json({ ok: false, message: "request_id is required." }, 400);
    const { user, adminClient } = await getCaller(req);
    await requireAdminRole(adminClient, user.id, "SUPER_ADMIN");

    const { data: request, error: requestError } = await adminClient
      .from("admin_registration_requests")
      .select("*")
      .eq("id", request_id)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) return json({ ok: false, message: "Registration request not found." }, 404);
    if (request.status !== "PENDING") return json({ ok: false, message: "Only pending requests can be approved." }, 409);
    if (request.requested_role === "STUDENT_USER") return json({ ok: false, message: "Student Portal users are approved by Institute Admin, not Super Admin registration." }, 400);

    const now = new Date().toISOString();
    const { error: roleError } = await adminClient.from("admin_users").upsert({
      user_id: request.user_id,
      role_key: request.requested_role,
      status: "ACTIVE",
      approved_by: user.id,
      approved_at: now,
    }, { onConflict: "user_id,role_key" });
    if (roleError) throw roleError;

    await adminClient.from("admin_registration_requests").update({ status: "APPROVED", reviewed_by: user.id, reviewed_at: now }).eq("id", request_id);
    await adminClient.from("profiles").update({ status: "ACTIVE" }).eq("id", request.user_id);
    await logActivity(adminClient, user.id, "SUPER_ADMIN", "Admin Registration", "APPROVE", "admin_registration_requests", request_id, `Approved ${request.email} as ${request.requested_role}.`);
    await adminClient.from("auth_audit_logs").insert({ user_id: request.user_id, email_reference: request.email, event_type: "ADMIN_APPROVED", status: "APPROVED" });
    return json({ ok: true, message: "Administrator registration approved." });
  } catch (error) {
    return json({ ok: false, message: error.message }, 400);
  }
});
