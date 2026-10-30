with source_count as (
    select count(*) as total
    from {{ ref('stg_daily_prices') }}
),
mart_count as (
    select count(*) as total
    from {{ ref('mart_daily_prices') }}
)
select
    source_count.total as source_rows,
    mart_count.total as mart_rows
from source_count
cross join mart_count
where source_count.total <> mart_count.total
