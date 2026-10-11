-- ====================================================================
-- BLOODCHAIN AI — MIGRATION: ADD ESTIMATED COST PER UNIT TO INVENTORY
-- ====================================================================

-- 1. ADD cost_per_unit COLUMN TO EXISTING blood_inventory TABLE
alter table public.blood_inventory
  add column if not exists cost_per_unit numeric(10, 2) default 1400.00 check (cost_per_unit >= 0);

-- 2. ADD COLUMN DOCUMENTATION
comment on column public.blood_inventory.cost_per_unit is
  'Prototype/demo estimated cost per unit. Not an official tariff.';

-- 3. POPULATE PROTOTYPE ESTIMATED COSTS FOR EXISTING DEMO RECORDS
update public.blood_inventory
set cost_per_unit = case
  when blood_group = 'O+' then 1400.00
  when blood_group = 'A+' then 1300.00
  when blood_group = 'B+' then 1350.00
  when blood_group = 'AB+' then 1500.00
  when blood_group = 'O-' then 1650.00
  when blood_group = 'A-' then 1350.00
  when blood_group = 'B-' then 1400.00
  when blood_group = 'AB-' then 1550.00
  else 1400.00
end
where cost_per_unit is null or cost_per_unit = 1400.00;

-- Custom variations by facility to demonstrate dynamic multi-source price ranges
update public.blood_inventory
set cost_per_unit = 1600.00
where hospital ilike '%Srirangam%' and blood_group = 'O+';

update public.blood_inventory
set cost_per_unit = 1450.00
where hospital ilike '%Thillai Nagar%' and blood_group = 'A+';

update public.blood_inventory
set cost_per_unit = 1500.00
where hospital ilike '%Apollo%' and blood_group = 'O+';

-- 4. UPDATE ai_recommendations TABLE IF PRESENT TO RECORD SNAPSHOT COST
alter table if exists public.ai_recommendations
  add column if not exists cost_per_unit numeric(10, 2),
  add column if not exists total_estimated_cost numeric(10, 2);
