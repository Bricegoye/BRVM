select
    price_id,
    company_id,
    trade_date
from {{ ref('stg_daily_prices') }}
where trade_date > (current_timestamp at time zone 'Africa/Abidjan')::date