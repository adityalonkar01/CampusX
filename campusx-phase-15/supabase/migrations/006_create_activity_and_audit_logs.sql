-- Prompt 13: Activity and auth audit logs.
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  actor_role text,
  module text not null,
  action text not null,
  record_type text,
  record_id text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  email_reference text,
  event_type text not null,
  ip_address text,
  user_agent text,
  status text,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_actor_idx on public.activity_logs(actor_user_id, created_at desc);
create index if not exists activity_logs_module_action_idx on public.activity_logs(module, action);
create index if not exists auth_audit_logs_user_idx on public.auth_audit_logs(user_id, created_at desc);
create index if not exists auth_audit_logs_event_idx on public.auth_audit_logs(event_type, created_at desc);
