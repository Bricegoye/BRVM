begin;

grant usage on schema brvm_dbt_dev to anon, authenticated;

grant select (
    company_id,
    trade_date,
    reference_date_5_obs,
    adjusted_price_change_5_obs_pct
)
on brvm_dbt_dev.mart_price_performance
to anon, authenticated;

create or replace function public.get_stock_performance_5_obs(
    p_company_id bigint,
    p_trade_date date
)
returns table (
    reference_date date,
    adjusted_change_pct numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
    select
        p.reference_date_5_obs,
        p.adjusted_price_change_5_obs_pct
    from brvm_dbt_dev.mart_price_performance p
    where p.company_id = p_company_id
      and p.trade_date = p_trade_date;
$$;

revoke execute
on function public.get_stock_performance_5_obs(bigint, date)
from public;

grant execute
on function public.get_stock_performance_5_obs(bigint, date)
to anon, authenticated;

commit;
