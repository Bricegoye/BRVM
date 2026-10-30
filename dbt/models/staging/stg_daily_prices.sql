select
    price_id,
    company_id,
    trade_date,
    open_price,
    high_price,
    low_price,
    close_price,
    previous_close,
    variation,
    variation_percent,
    volume,
    turnover,
    transactions,
    created_at
from {{ source('brvm', 'daily_prices') }}