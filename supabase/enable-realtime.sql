-- Run this once in the Supabase SQL Editor after `pnpm db:deploy`.
-- The existing `supabase_realtime` publication is owned by the Supabase
-- administrator, so this intentionally lives outside the Prisma migration.
ALTER PUBLICATION supabase_realtime ADD TABLE "bills";
ALTER PUBLICATION supabase_realtime ADD TABLE "participants";
ALTER PUBLICATION supabase_realtime ADD TABLE "item_claims";
