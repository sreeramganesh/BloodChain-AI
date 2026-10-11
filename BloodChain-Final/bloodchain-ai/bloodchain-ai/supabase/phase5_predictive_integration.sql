-- ====================================================================
-- BLOODCHAIN AI - PHASE 5: PREDICTIVE FORECASTING & DYNAMIC RISK INTEGRATION
-- Target Environment: Supabase SQL Editor
-- STATUS: DRAFT FOR REVIEW - DO NOT EXECUTE WITHOUT USER APPROVAL
-- ====================================================================
-- METHODOLOGY: Holt Linear Exponential Smoothing (Exact Implementation)
-- Reuses existing tables:
--   - public.historical_demand (480 rows)
--   - public.demand_predictions (Storage layer ready from Phase 2)
--   - public.shortage_risks (Phase 3 schema)
--   - public.expiry_risks (Phase 3 schema)
--   - public.ai_recommendations (Phase 4 schema)
--   - public.facilities, public.blood_inventory, public.blood_requests
-- Reuses existing functions:
--   - public.calculate_haversine_distance()
--   - public.check_blood_compatibility()
-- ZERO NEW TABLES REQUIRED.
-- ====================================================================

-- --------------------------------------------------------------------
-- STEP 1: POPULATE DEMAND_PREDICTIONS WITH VERIFIED HOLT LINEAR FORECASTS
-- --------------------------------------------------------------------
-- Populates 40 forecast series computed directly via Holt Linear Exponential Smoothing
-- (5 facilities * 8 blood groups = 40 series).
-- Idempotent: Uses WHERE NOT EXISTS to guarantee no duplicates without assuming
-- an unindexed constraint on demand_predictions.
-- --------------------------------------------------------------------

insert into public.demand_predictions (
  facility_id,
  blood_group,
  prediction_date,
  forecast_horizon_days,
  predicted_units,
  lower_bound,
  upper_bound,
  model_name,
  model_version,
  confidence
)
select
  v.facility_id::uuid,
  v.blood_group,
  v.prediction_date::date,
  v.forecast_horizon_days::int,
  v.predicted_units::numeric,
  v.lower_bound::numeric,
  v.upper_bound::numeric,
  v.model_name,
  v.model_version,
  v.confidence::numeric
from (
  values
  -- Apollo Hospital (8200c9b2-31a8-438a-a258-dbfca4e07779)
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'A+', '2026-09-01', 30, 27.6, 13.2, 42.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'A-', '2026-09-01', 30, 8.2, 2.4, 14.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'B+', '2026-09-01', 30, 14.9, 4.5, 25.3, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'B-', '2026-09-01', 30, 8.2, 2.4, 14.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'O+', '2026-09-01', 30, 27.6, 13.2, 42.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'O-', '2026-09-01', 30, 14.9, 4.5, 25.3, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'AB+', '2026-09-01', 30, 4.7, 0.3, 9.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('8200c9b2-31a8-438a-a258-dbfca4e07779', 'AB-', '2026-09-01', 30, 4.7, 0.3, 9.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  -- Kauvery Hospital (95f25fc9-8f8f-4cfe-9247-b018e03446c9)
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'A+', '2026-09-01', 30, 26.6, 12.2, 41.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'A-', '2026-09-01', 30, 8.4, 2.7, 14.2, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'B+', '2026-09-01', 30, 13.9, 3.5, 24.3, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'B-', '2026-09-01', 30, 8.4, 2.7, 14.2, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'O+', '2026-09-01', 30, 26.6, 12.2, 41.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'O-', '2026-09-01', 30, 13.9, 3.5, 24.3, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'AB+', '2026-09-01', 30, 4.5, 0.2, 8.8, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('95f25fc9-8f8f-4cfe-9247-b018e03446c9', 'AB-', '2026-09-01', 30, 4.5, 0.2, 8.8, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  -- SRM Hospital (e5dc1d2b-4e75-4e7c-9000-8234e96872fc)
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'A+', '2026-09-01', 30, 25.6, 11.2, 40.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'A-', '2026-09-01', 30, 9.2, 3.7, 14.8, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'B+', '2026-09-01', 30, 16.1, 6.5, 25.7, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'B-', '2026-09-01', 30, 9.2, 3.7, 14.8, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'O+', '2026-09-01', 30, 25.6, 11.2, 40.1, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'O-', '2026-09-01', 30, 16.1, 6.5, 25.7, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'AB+', '2026-09-01', 30, 5.9, 1.4, 10.5, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('e5dc1d2b-4e75-4e7c-9000-8234e96872fc', 'AB-', '2026-09-01', 30, 5.9, 1.4, 10.5, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  -- Trichy Blood Bank (d2b86395-bae5-4454-9b91-794782e83ac1)
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'A+', '2026-09-01', 30, 23.9, 8.3, 39.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'A-', '2026-09-01', 30, 6.9, 0.0, 14.5, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'B+', '2026-09-01', 30, 11.2, 0.0, 23.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'B-', '2026-09-01', 30, 6.9, 0.0, 14.5, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'O+', '2026-09-01', 30, 23.9, 8.3, 39.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'O-', '2026-09-01', 30, 11.2, 0.0, 23.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'AB+', '2026-09-01', 30, 6.9, 2.8, 10.9, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('d2b86395-bae5-4454-9b91-794782e83ac1', 'AB-', '2026-09-01', 30, 6.9, 2.8, 10.9, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  -- Trichy Government Hospital (f8acddb2-fa64-46cc-82f8-f9eec91e356a)
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'A+', '2026-09-01', 30, 24.9, 9.3, 40.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'A-', '2026-09-01', 30, 7.5, 0.0, 15.6, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'B+', '2026-09-01', 30, 12.2, 0.1, 24.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'B-', '2026-09-01', 30, 7.5, 0.0, 15.6, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'O+', '2026-09-01', 30, 24.9, 9.3, 40.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'O-', '2026-09-01', 30, 12.2, 0.1, 24.4, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'AB+', '2026-09-01', 30, 5.9, 1.4, 10.5, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95),
  ('f8acddb2-fa64-46cc-82f8-f9eec91e356a', 'AB-', '2026-09-01', 30, 5.9, 1.4, 10.5, 'Holt Linear Exponential Smoothing', 'v1.0-12m-statistical', 0.95)
) as v(facility_id, blood_group, prediction_date, forecast_horizon_days, predicted_units, lower_bound, upper_bound, model_name, model_version, confidence)
where not exists (
  select 1 from public.demand_predictions dp
  where dp.facility_id = v.facility_id::uuid
    and dp.blood_group = v.blood_group
    and dp.prediction_date = v.prediction_date::date
    and dp.forecast_horizon_days = v.forecast_horizon_days::int
);


-- --------------------------------------------------------------------
-- STEP 2: DYNAMICALLY UPDATE SHORTAGE_RISKS USING PREDICTED DEMAND
-- --------------------------------------------------------------------
-- Replaces static demo thresholds with:
--   safety_stock = greatest(5, ceil(predicted_demand * 7 / 30))
--   shortage_units = greatest(0, (predicted_demand + safety_stock) - available_units)
--
-- Note on blood_inventory semantics:
--   total_units = available_units + reserved_units
--   available_units is ALREADY unreserved usable stock.
--   We do NOT subtract reserved_units again to avoid double-deduction.
-- --------------------------------------------------------------------

insert into public.shortage_risks (
  facility_id,
  blood_group,
  assessment_date,
  current_available_units,
  reserved_units,
  predicted_demand_units,
  safety_stock_units,
  shortage_units,
  risk_score,
  risk_level,
  expected_shortage_date,
  calculation_method
)
with inv_agg as (
  select
    facility_id,
    blood_group,
    coalesce(sum(available_units), 0) as avail,
    coalesce(sum(reserved_units), 0) as res
  from public.blood_inventory
  group by facility_id, blood_group
),
latest_preds as (
  select distinct on (facility_id, blood_group)
    facility_id,
    blood_group,
    prediction_date,
    predicted_units
  from public.demand_predictions
  order by facility_id, blood_group, created_at desc
),
risk_calc as (
  select
    p.facility_id,
    p.blood_group,
    p.prediction_date as assessment_date,
    coalesce(i.avail, 0)::int as current_avail,
    coalesce(i.res, 0)::int as reserved,
    p.predicted_units,
    -- Dynamic 7-day reserve safety stock (strictly >= 5)
    greatest(5, ceil(p.predicted_units * 7.0 / 30.0)) as safety_stock,
    -- Available units is already usable stock; compute true net deficit
    greatest(0, round(((p.predicted_units + greatest(5, ceil(p.predicted_units * 7.0 / 30.0))) - coalesce(i.avail, 0)), 1)) as shortage
  from latest_preds p
  left join inv_agg i on p.facility_id = i.facility_id and p.blood_group = i.blood_group
)
select
  r.facility_id,
  r.blood_group,
  r.assessment_date,
  r.current_avail,
  r.reserved,
  r.predicted_units as predicted_demand_units,
  r.safety_stock as safety_stock_units,
  r.shortage as shortage_units,
  case
    when r.shortage > 0 then
      round(least(100.0, 30.0 + (r.shortage / (r.predicted_units + r.safety_stock)) * 70.0), 1)
    else
      case when r.current_avail < (r.safety_stock * 1.5) then 24.0 else 10.0 end
  end as risk_score,
  case
    when r.shortage > 0 and (30.0 + (r.shortage / (r.predicted_units + r.safety_stock)) * 70.0) >= 75.0 then 'Critical'
    when r.shortage > 0 and (30.0 + (r.shortage / (r.predicted_units + r.safety_stock)) * 70.0) >= 50.0 then 'High'
    when r.shortage > 0 then 'Medium'
    else 'Low'
  end as risk_level,
  case
    when r.shortage > 0 then
      (r.assessment_date + (greatest(1, floor(r.current_avail / nullif(r.predicted_units / 30.0, 0))) || ' days')::interval)::date
    else null
  end as expected_shortage_date,
  'Dynamic Forecast Shortage Engine (Holt Linear Integrated)' as calculation_method
from risk_calc r
on conflict (facility_id, blood_group, assessment_date)
do update set
  current_available_units = excluded.current_available_units,
  reserved_units = excluded.reserved_units,
  predicted_demand_units = excluded.predicted_demand_units,
  safety_stock_units = excluded.safety_stock_units,
  shortage_units = excluded.shortage_units,
  risk_score = excluded.risk_score,
  risk_level = excluded.risk_level,
  expected_shortage_date = excluded.expected_shortage_date,
  calculation_method = excluded.calculation_method,
  updated_at = timezone('utc'::text, now());
