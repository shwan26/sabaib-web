-- Limit anonymous joining to the public demo bill.
-- Authenticated users keep their existing bill-joining policies.

grant select on table public.bills to anon;
grant insert on table public.participants to anon;

drop policy if exists "Anyone can join an unsettled bill" on public.participants;
drop policy if exists "Anonymous can join demo bill" on public.participants;
create policy "Anonymous can join demo bill"
  on public.participants for insert
  to anon
  with check (
    exists (
      select 1
      from public.bills b
      where b.id = participants.bill_id
        and b.code = 'B7X2KP'
        and b.settled_at is null
    )
  );

-- The public join endpoint only needs anonymous access to this demo bill.
drop policy if exists "Anyone can view unsettled bills by invite code" on public.bills;
drop policy if exists "Anonymous can view demo bill by invite code" on public.bills;
create policy "Anonymous can view demo bill by invite code"
  on public.bills for select
  to anon
  using (code = 'B7X2KP' and settled_at is null);
