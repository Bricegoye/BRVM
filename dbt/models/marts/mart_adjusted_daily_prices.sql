with prices as (
    select
        company_id,
        symbol,
        trade_date,
        close_price,
        max(trade_date) over (
            partition by company_id
        ) as basis_date
    from {{ ref('mart_daily_prices') }}
)

select
    p.company_id,
    p.symbol,
    p.trade_date,
    p.basis_date,
    p.close_price as raw_close_price,
    round(
        p.close_price / splits.split_factor,
        6
    ) as adjusted_close_price
from prices p
cross join lateral (
    select coalesce(
        exp(sum(ln(
            s.new_shares::numeric / s.old_shares
        ))),
        1::numeric
    ) as split_factor
    from {{ ref('corporate_action_splits') }} s
    where s.symbol = p.symbol
      and s.effective_date::date > p.trade_date
      and s.effective_date::date <= p.basis_date
) splits
