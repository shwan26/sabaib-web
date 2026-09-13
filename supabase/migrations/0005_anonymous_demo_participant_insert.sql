-- Allow anonymous users to add a participant only to the demo bill.
-- The fixed bill UUID avoids relying on a bills-table RLS subquery during INSERT.

grant insert on table public.participants to anon;
grant select on table public.participants to anon;

drop policy if exists "Anonymous can join demo bill" on public.participants;
create policy "Anonymous can join demo bill"
  on public.participants for insert
  to anon
  with check (
    bill_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );

drop policy if exists "Anonymous can view demo participants" on public.participants;
create policy "Anonymous can view demo participants"
  on public.participants for select
  to anon
  using (
    bill_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
  );
