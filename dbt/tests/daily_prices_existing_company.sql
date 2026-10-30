select
    prices.price_id,
    prices.company_id,
    prices.trade_date
from {{ ref('stg_daily_prices') }} as prices
left join {{ source('brvm', 'companies') }} as companies
    on prices.company_id = companies.company_id
where companies.company_id is null