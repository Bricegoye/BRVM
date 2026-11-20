with expected as (
    select *
    from (values
        (date '2026-10-23', 4385::numeric),
        (date '2026-10-26', 4700::numeric)
    ) as cases(trade_date, expected_price)
)
select
    e.trade_date,
    e.expected_price,
    p.adjusted_close_price as actual_price
from expected e
left join {{ ref('mart_adjusted_daily_prices') }} p
    on p.symbol = 'SNTS'
   and p.trade_date = e.trade_date
where p.adjusted_close_price is distinct from e.expected_price
