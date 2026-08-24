CREATE TABLE "bills" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "code" VARCHAR(6) NOT NULL,
  "restaurant_name" TEXT NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "service_charge_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
  "service_charge_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "vat_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
  "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "is_vat_included" BOOLEAN NOT NULL DEFAULT false,
  "status" VARCHAR(16) NOT NULL DEFAULT 'waiting',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bills_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bills_status_check" CHECK ("status" IN ('waiting', 'splitting', 'settling', 'completed'))
);

CREATE TABLE "participants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "bill_id" UUID NOT NULL,
  "name" VARCHAR(80) NOT NULL,
  "is_host" BOOLEAN NOT NULL DEFAULT false,
  "is_ready" BOOLEAN NOT NULL DEFAULT false,
  "guest_token_hash" VARCHAR(64),
  "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bill_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "bill_id" UUID NOT NULL,
  "thai_name" TEXT NOT NULL DEFAULT '',
  "english_name" TEXT NOT NULL DEFAULT '',
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "bill_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bill_items_quantity_check" CHECK ("quantity" > 0),
  CONSTRAINT "bill_items_price_check" CHECK ("price" >= 0)
);

CREATE TABLE "item_claims" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "bill_id" UUID NOT NULL,
  "item_id" UUID NOT NULL,
  "participant_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "item_claims_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "bills_code_key" ON "bills"("code");
CREATE INDEX "participants_bill_id_idx" ON "participants"("bill_id");
CREATE UNIQUE INDEX "participants_guest_token_hash_key" ON "participants"("guest_token_hash");
CREATE UNIQUE INDEX "participants_bill_id_name_ci_key" ON "participants"("bill_id", lower("name"));
CREATE INDEX "bill_items_bill_id_idx" ON "bill_items"("bill_id");
CREATE UNIQUE INDEX "item_claims_item_id_participant_id_key" ON "item_claims"("item_id", "participant_id");
CREATE INDEX "item_claims_bill_id_idx" ON "item_claims"("bill_id");
CREATE INDEX "item_claims_participant_id_idx" ON "item_claims"("participant_id");

ALTER TABLE "participants" ADD CONSTRAINT "participants_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE;
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE;
ALTER TABLE "item_claims" ADD CONSTRAINT "item_claims_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE CASCADE;
ALTER TABLE "item_claims" ADD CONSTRAINT "item_claims_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "bill_items"("id") ON DELETE CASCADE;
ALTER TABLE "item_claims" ADD CONSTRAINT "item_claims_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE;

ALTER TABLE "bills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bill_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "item_claims" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can read bills" ON "bills" FOR SELECT TO anon USING (true);
CREATE POLICY "Guests can read participants" ON "participants" FOR SELECT TO anon USING (true);
CREATE POLICY "Guests can read bill items" ON "bill_items" FOR SELECT TO anon USING (true);
CREATE POLICY "Guests can read item claims" ON "item_claims" FOR SELECT TO anon USING (true);

GRANT SELECT ON "bills", "participants", "bill_items", "item_claims" TO anon, authenticated;
