select
    prices.price_id,
    prices.company_id,
    companies.symbol,
    companies.company_name,
    prices.trade_date,
    prices.close_price,
    prices.previous_close,
    prices.variation_percent,
    prices.volume
from {{ ref('stg_daily_prices') }} as prices
left join {{ ref('stg_companies') }} as companies
    on prices.company_id = companies.company_id
