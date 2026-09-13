-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- It backs the "join from any device/account" + "mark as paid" features.

-- 1. Track per-participant payment status.
alter table public.participants
  add column if not exists has_paid boolean not null default false,
  add column if not exists paid_at timestamptz;

-- 2. Stop the same signed-in account from joining a bill twice
--    (guests keep user_id = null, so they're unaffected by this constraint).
create unique index if not exists participants_bill_user_unique
  on public.participants (bill_id, user_id)
  where user_id is not null;

-- 3. Invite codes must be unique for the join-by-code lookup to be safe.
create unique index if not exists bills_code_unique
  on public.bills (code)
  where code is not null;

-- 4. Let a joined participant (guest or account) update their own paid status.
--    Mirrors the existing trust model: guests are identified by having the
--    join link, not by a verified session, same as the pre-existing insert policy.
drop policy if exists "Participants can update their own paid status" on public.participants;
create policy "Participants can update their own paid status"
  on public.participants for update
  using (user_id is null or user_id = auth.uid())
  with check (user_id is null or user_id = auth.uid());

-- 4b. REQUIRED: currently there is no INSERT policy on participants at all,
--     so every join attempt (guest or signed-in) fails with
--     "new row violates row-level security policy for table participants".
--     This is the actual reason joining is broken today. Allow anyone with
--     the invite link to join a bill that hasn't been settled yet.
drop policy if exists "Anyone can join an unsettled bill" on public.participants;
create policy "Anyone can join an unsettled bill"
  on public.participants for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.bills b
      where b.id = participants.bill_id
        and b.settled_at is null
    )
  );

-- 4c. The host needs to be able to save the uploaded QR path back onto the
--     bill row. Add this only if bills doesn't already have an owner update
--     policy (harmless if it's redundant with an existing one).
drop policy if exists "Owners can update their bill" on public.bills;
create policy "Owners can update their bill"
  on public.bills for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 5. Storage bucket for host-uploaded PromptPay QR codes. Running this via
--    the SQL Editor (not the anon key) has permission to create it directly.
--    If your project rejects this insert, create it by hand instead:
--    Dashboard -> Storage -> New bucket -> name "payment-qr" -> Public bucket: ON
--    -- then still run the policies below.
insert into storage.buckets (id, name, public)
values ('payment-qr', 'payment-qr', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view payment QR codes" on storage.objects;
create policy "Anyone can view payment QR codes"
  on storage.objects for select
  using (bucket_id = 'payment-qr');

drop policy if exists "Authenticated users can upload payment QR codes" on storage.objects;
create policy "Authenticated users can upload payment QR codes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-qr');

drop policy if exists "Authenticated users can replace payment QR codes" on storage.objects;
create policy "Authenticated users can replace payment QR codes"
  on storage.objects for update to authenticated
  using (bucket_id = 'payment-qr')
  with check (bucket_id = 'payment-qr');
