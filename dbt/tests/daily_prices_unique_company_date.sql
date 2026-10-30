select
    company_id,
    trade_date,
    count(*) as number_of_rows
from {{ ref('stg_daily_prices') }}
group by
    company_id,
    trade_date
having count(*) > 1