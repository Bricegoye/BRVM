select
    company_id,
    symbol,
    company_name,
    sector_id,
    is_active
from {{ source('brvm', 'companies') }}