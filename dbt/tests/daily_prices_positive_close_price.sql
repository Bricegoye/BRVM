select
    price_id,
    company_id,
    trade_date,
    close_price
from {{ ref('stg_daily_prices') }}
where close_price <= 0