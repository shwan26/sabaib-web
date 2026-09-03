import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { BillBundle, BillStatus, Participant } from "@/types/bill";
import { getPrisma } from "@/lib/db/prisma";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toParticipant(row: { id: string; billId: string; name: string; role: string; isReady: boolean }): Participant {
  return { id: row.id, billId: row.billId, name: row.name, isHost: row.role === "host", isReady: row.isReady };
}

export async function findBillBundle(code: string): Promise<BillBundle | null> {
  const row = await getPrisma().bill.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      participants: { orderBy: { joinedAt: "asc" } },
      receipt_items: { orderBy: { created_at: "asc" }, include: { claims: true } },
    },
  });
  if (!row) return null;

  const participants = [...row.participants].sort((a, b) => Number(b.role === "host") - Number(a.role === "host"));

  return {
    source: "supabase",
    bill: {
      id: row.id,
      code: row.code ?? "",
      restaurantName: row.restaurantName ?? "",
      subtotal: Number(row.subtotal),
      serviceChargeRate: Number(row.service_charge_percent) / 100,
      serviceChargeAmount: Number(row.serviceChargeAmount),
      vatRate: Number(row.vat_percent) / 100,
      vatAmount: Number(row.vatAmount),
      discount: Number(row.discount_amount),
      total: Number(row.total_amount),
      isVatIncluded: false,
      status: row.status as BillStatus,
    },
    participants: participants.map(toParticipant),
    items: row.receipt_items.map((item) => ({
      id: item.id,
      billId: item.bill_id,
      thaiName: item.original_name,
      englishName: item.translated_name ?? "",
      quantity: Number(item.quantity),
      price: Number(item.unit_price),
    })),
    claims: row.receipt_items.flatMap((item) =>
      item.claims.map((claim) => ({
        id: claim.id,
        billId: row.id,
        itemId: claim.itemId,
        participantId: claim.participantId,
      })),
    ),
  };
}

export async function createGuestParticipant(code: string, name: string) {
  const prisma = getPrisma();
  const cleanName = name.trim();
  const bill = await prisma.bill.findUnique({
    where: { code: code.trim().toUpperCase() },
    select: { id: true },
  });
  if (!bill) return null;
  const duplicate = await prisma.participant.findFirst({
    where: { billId: bill.id, name: { equals: cleanName, mode: "insensitive" } },
  });
  if (duplicate) throw new Error("NAME_TAKEN");
  const token = randomBytes(32).toString("base64url");
  const row = await prisma.participant.create({
    data: { billId: bill.id, name: cleanName, role: "member", guestTokenHash: tokenHash(token) },
  });
  return { participant: toParticipant(row), token };
}

export async function authenticateGuest(code: string, token: string | undefined) {
  if (!token) return null;
  const row = await getPrisma().participant.findFirst({
    where: { guestTokenHash: tokenHash(token), bill: { code: code.trim().toUpperCase() }, role: "member" },
  });
  return row ? toParticipant(row) : null;
}

export async function setGuestClaim(participant: Participant, itemId: string, claimed: boolean) {
  const prisma = getPrisma();
  const item = await prisma.receipt_items.findFirst({
    where: { id: itemId, bill_id: participant.billId },
    select: { id: true },
  });
  if (!item) throw new Error("ITEM_NOT_FOUND");
  if (claimed) {
    await prisma.itemClaim.upsert({
      where: { itemId_participantId: { itemId, participantId: participant.id } },
      create: { itemId, participantId: participant.id },
      update: {},
    });
  } else {
    await prisma.itemClaim.deleteMany({ where: { itemId, participantId: participant.id } });
  }
}

export async function setGuestReady(participant: Participant, isReady: boolean) {
  await getPrisma().participant.update({ where: { id: participant.id }, data: { isReady } });
}
