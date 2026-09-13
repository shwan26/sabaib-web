-- Allow anonymous users to read the demo bill's receipt items only.

grant select on table public.receipt_items to anon;

drop policy if exists "Anonymous can view demo receipt items" on public.receipt_items;
create policy "Anonymous can view demo receipt items"
  on public.receipt_items for select
  to anon
  using (
    bill_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );
