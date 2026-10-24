-- Server-only data access.
-- The browser never queries these tables: every read and write goes through the app's API with
-- the service role, always filtered to the signed-in user the server has verified. Removing
-- direct access for the public keys closes bypasses such as a Free account inserting extra
-- projects straight through Supabase's REST API. Row-level security stays on underneath.
--
-- Safe to run at any time; the app does not depend on these grants.
revoke all on table
  public.profiles,
  public.projects,
  public.subscriptions,
  public.usage_monthly,
  public.payment_events,
  public.user_roles
from anon, authenticated;
