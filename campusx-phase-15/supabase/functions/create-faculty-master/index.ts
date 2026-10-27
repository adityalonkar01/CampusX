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
    const payload = await req.json();
    const { user, adminClient } = await getCaller(req);
    await requireAdminRole(adminClient, user.id, "INSTITUTE_ADMIN");
    const record = { ...payload, created_by: user.id, updated_by: user.id };
    const { data, error } = await adminClient.from("faculty").insert(record).select().single();
    if (error) throw error;
    await logActivity(adminClient, user.id, "INSTITUTE_ADMIN", "Faculty Master", "CREATE", "faculty", data.id, `Created faculty master record.`);
    return json({ ok: true, message: "Faculty Master record created.", data });
  } catch (error) {
    return json({ ok: false, message: error.message }, 400);
  }
});
