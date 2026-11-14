with expected as (
    select *
    from (values
        (date '2026-10-29', -1.19::numeric),
        (date '2026-11-02', -11.70::numeric)
    ) as cases(trade_date, expected_pct)
)
select
    e.trade_date,
    e.expected_pct,
    p.adjusted_price_change_5_obs_pct as actual_pct
from expected e
left join {{ ref('mart_price_performance') }} p
    on p.symbol = 'SNTS'
   and p.trade_date = e.trade_date
where p.adjusted_price_change_5_obs_pct is distinct from e.expected_pct
