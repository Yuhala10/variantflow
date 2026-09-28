-- In-app feedback. Signed-in users can send messages and see their own;
-- owners and admins read and triage everything through the server (service role).
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  category text not null default 'other' check (category in ('bug', 'idea', 'question', 'other')),
  message text not null check (char_length(message) between 1 and 4000),
  page text,
  locale text,
  plan text,
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_user_created_idx on public.feedback (user_id, created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "Users can send feedback" on public.feedback;
drop policy if exists "Users can read their feedback" on public.feedback;
create policy "Users can send feedback" on public.feedback for insert with check (auth.uid() = user_id and status = 'new');
create policy "Users can read their feedback" on public.feedback for select using (auth.uid() = user_id);

revoke update, delete on public.feedback from anon, authenticated;
