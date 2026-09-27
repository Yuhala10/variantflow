-- Monthly row-run metering.
-- A row-run is one variant row exported or one supplier row imported.
-- The check and the increment happen in a single UPDATE, so concurrent requests
-- can never push an account past its monthly limit.
create or replace function public.consume_row_runs(p_user_id uuid, p_rows integer, p_limit integer)
returns table (allowed boolean, used integer)
language plpgsql
security definer set search_path = public
as $$
declare
  v_month date := date_trunc('month', timezone('utc', now()))::date;
  v_used integer;
begin
  insert into public.usage_monthly (user_id, month_start, row_runs)
  values (p_user_id, v_month, 0)
  on conflict (user_id, month_start) do nothing;

  update public.usage_monthly
     set row_runs = row_runs + greatest(p_rows, 0)
   where user_id = p_user_id
     and month_start = v_month
     and (p_limit is null or row_runs + greatest(p_rows, 0) <= p_limit)
  returning row_runs into v_used;

  if found then
    return query select true, v_used;
  else
    select row_runs into v_used from public.usage_monthly where user_id = p_user_id and month_start = v_month;
    return query select false, coalesce(v_used, 0);
  end if;
end;
$$;

-- Only the server (service role) may meter usage; signed-in users can still read their own totals.
revoke all on function public.consume_row_runs(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_row_runs(uuid, integer, integer) to service_role;
