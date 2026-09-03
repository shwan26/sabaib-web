-- Seed the bill used by the “Try the demo bill” link (`/join/B7X2KP`).
-- Run this in the Supabase SQL Editor after applying the database migrations.
-- The fixed UUIDs make this script safe to run repeatedly and keep claims stable.

begin;

insert into public.bills (
  id,
  code,
  restaurant_name,
  currency,
  subtotal,
  service_charge_percent,
  service_charge_amount,
  vat_percent,
  vat_amount,
  discount_amount,
  total_amount,
  status,
  keep_forever
) values (
  '550e8400-e29b-41d4-a716-446655440000',
  'B7X2KP',
  'Baan Suan Sathorn',
  'THB',
  1000.00,
  10.00,
  100.00,
  7.00,
  77.00,
  50.00,
  1127.00,
  'waiting',
  true
)
on conflict (code) do update set
  restaurant_name = excluded.restaurant_name,
  currency = excluded.currency,
  subtotal = excluded.subtotal,
  service_charge_percent = excluded.service_charge_percent,
  service_charge_amount = excluded.service_charge_amount,
  vat_percent = excluded.vat_percent,
  vat_amount = excluded.vat_amount,
  discount_amount = excluded.discount_amount,
  total_amount = excluded.total_amount,
  status = excluded.status,
  keep_forever = excluded.keep_forever;

insert into public.participants (id, bill_id, name, role, is_ready)
values
  ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Shwan', 'host', false),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Mali', 'member', false),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Ben', 'member', false)
on conflict (id) do update set
  bill_id = excluded.bill_id,
  name = excluded.name,
  role = excluded.role,
  is_ready = excluded.is_ready;

insert into public.receipt_items (id, bill_id, original_name, translated_name, quantity, unit_price, total_price)
values
  ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'ข้าวผัดกุ้ง', 'Shrimp fried rice', 1, 120.00, 120.00),
  ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'ต้มยำกุ้ง', 'Tom yum goong', 1, 220.00, 220.00),
  ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'ผัดผักบุ้งไฟแดง', 'Morning glory', 1, 140.00, 140.00),
  ('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'ไก่ย่าง', 'Grilled chicken', 1, 260.00, 260.00),
  ('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', 'ชาไทย', 'Thai milk tea', 1, 65.00, 65.00),
  ('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', 'ข้าวสวย', 'Steamed jasmine rice', 3, 30.00, 90.00),
  ('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', 'ข้าวเหนียวมะม่วง', 'Mango sticky rice', 1, 105.00, 105.00)
on conflict (id) do update set
  bill_id = excluded.bill_id,
  original_name = excluded.original_name,
  translated_name = excluded.translated_name,
  quantity = excluded.quantity,
  unit_price = excluded.unit_price,
  total_price = excluded.total_price;

insert into public.item_claims (id, item_id, participant_id, share)
values
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 1),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 1),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 1),
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 1),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 1),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 1),
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 1),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', 1),
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', 1),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 1)
on conflict (item_id, participant_id) do update set share = excluded.share;

commit;
