select
    price_id,
    company_id,
    trade_date,
    volume
from {{ ref('stg_daily_prices') }}
where volume < 0