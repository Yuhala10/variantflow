-- Owner/admin roles.
-- Rows can only be written with the service role or the Supabase SQL editor:
-- there are deliberately no insert/update/delete policies for signed-in users.
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin')),
  granted_at timestamptz not null default now(),
  note text
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can read their role" on public.user_roles;
create policy "Users can read their role" on public.user_roles for select using (auth.uid() = user_id);

revoke insert, update, delete on public.user_roles from anon, authenticated;

-- Profiles: the email column identifies payers in the payment webhook, so users
-- may only edit their display name. The email is kept in sync from auth.users below.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set email = new.email, updated_at = now() where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
after update of email on auth.users
for each row when (old.email is distinct from new.email)
execute procedure public.handle_user_email_change();

-- Payment tokens may only be applied once.
alter table public.payment_events add column if not exists payment_token text;
create unique index if not exists payment_events_payment_token_key on public.payment_events (payment_token);

-- To grant yourself owner access, run this once in the Supabase SQL editor
-- (replace the email with the one you sign in with):
--
--   insert into public.user_roles (user_id, role, note)
--   select id, 'owner', 'Founder account' from auth.users where email = 'you@example.com'
--   on conflict (user_id) do update set role = excluded.role;
