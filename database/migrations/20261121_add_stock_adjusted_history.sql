begin;

grant usage on schema brvm_dbt_dev to anon, authenticated;

grant select (
    company_id,
    trade_date,
    basis_date,
    raw_close_price,
    adjusted_close_price
)
on brvm_dbt_dev.mart_adjusted_daily_prices
to anon, authenticated;

create or replace function public.get_stock_adjusted_history(
    p_company_id bigint,
    p_basis_date date
)
returns table (
    trade_date date,
    basis_date date,
    raw_close_price numeric,
    adjusted_close_price numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
    select
        p.trade_date,
        p.basis_date,
        p.raw_close_price,
        p.adjusted_close_price
    from brvm_dbt_dev.mart_adjusted_daily_prices p
    where p.company_id = p_company_id
      and p.basis_date = p_basis_date
    order by p.trade_date;
$$;

revoke execute
on function public.get_stock_adjusted_history(bigint, date)
from public;

grant execute
on function public.get_stock_adjusted_history(bigint, date)
to anon, authenticated;

commit;
