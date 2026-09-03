ALTER TABLE "public"."participants"
  ADD COLUMN "is_ready" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "guest_token_hash" VARCHAR(64);

CREATE UNIQUE INDEX "participants_guest_token_hash_key" ON "public"."participants"("guest_token_hash");
