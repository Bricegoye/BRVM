with historical_prices as (
    select
        company_id,
        symbol,
        company_name,
        trade_date,
        close_price,
        lag(trade_date, 5) over company_history as reference_date_5_obs,
        lag(close_price, 5) over company_history as reference_close_5_obs
    from {{ ref('mart_daily_prices') }}
    window company_history as (
        partition by company_id
        order by trade_date
    )
),

adjusted_prices as (
    select
        p.*,
        p.reference_close_5_obs / splits.split_factor
            as adjusted_reference_close_5_obs
    from historical_prices p
    cross join lateral (
        select coalesce(
            exp(sum(ln(s.new_shares::numeric / s.old_shares))),
            1::numeric
        ) as split_factor
        from {{ ref('corporate_action_splits') }} s
        where s.symbol = p.symbol
          and s.effective_date::date > p.reference_date_5_obs
          and s.effective_date::date <= p.trade_date
    ) splits
)

select
    company_id,
    symbol,
    company_name,
    trade_date,
    close_price,
    reference_date_5_obs,
    reference_close_5_obs,
    round(
        100.0 * (close_price / nullif(reference_close_5_obs, 0) - 1),
        2
    ) as price_change_5_obs_pct,
    adjusted_reference_close_5_obs,
    round(
        100.0 * (close_price / nullif(adjusted_reference_close_5_obs, 0) - 1),
        2
    ) as adjusted_price_change_5_obs_pct
from adjusted_prices
