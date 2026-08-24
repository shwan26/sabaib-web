import "server-only";
import { createHash, randomBytes } from "node:crypto";
import type { BillBundle, BillStatus, Participant } from "@/types/bill";
import { getPrisma } from "@/lib/db/prisma";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function findBillBundle(code: string): Promise<BillBundle | null> {
  const row = await getPrisma().bill.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: {
      participants: { orderBy: [{ isHost: "desc" }, { joinedAt: "asc" }] },
      items: { orderBy: { id: "asc" } },
      claims: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!row) return null;
  return {
    source: "supabase",
    bill: {
      id: row.id,
      code: row.code,
      restaurantName: row.restaurantName,
      subtotal: Number(row.subtotal),
      serviceChargeRate: Number(row.serviceChargeRate),
      serviceChargeAmount: Number(row.serviceChargeAmount),
      vatRate: Number(row.vatRate),
      vatAmount: Number(row.vatAmount),
      discount: Number(row.discount),
      total: Number(row.total),
      isVatIncluded: row.isVatIncluded,
      status: row.status as BillStatus,
    },
    participants: row.participants.map((participant) => ({
      id: participant.id,
      billId: participant.billId,
      name: participant.name,
      isHost: participant.isHost,
      isReady: participant.isReady,
    })),
    items: row.items.map((item) => ({
      id: item.id,
      billId: item.billId,
      thaiName: item.thaiName,
      englishName: item.englishName,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    claims: row.claims.map((claim) => ({
      id: claim.id,
      billId: claim.billId,
      itemId: claim.itemId,
      participantId: claim.participantId,
    })),
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
    data: { billId: bill.id, name: cleanName, isHost: false, guestTokenHash: tokenHash(token) },
  });
  const participant: Participant = {
    id: row.id,
    billId: row.billId,
    name: row.name,
    isHost: row.isHost,
    isReady: row.isReady,
  };
  return { participant, token };
}

export async function authenticateGuest(code: string, token: string | undefined) {
  if (!token) return null;
  const row = await getPrisma().participant.findFirst({
    where: {
      guestTokenHash: tokenHash(token),
      bill: { code: code.trim().toUpperCase() },
      isHost: false,
    },
  });
  return row
    ? ({ id: row.id, billId: row.billId, name: row.name, isHost: row.isHost, isReady: row.isReady } satisfies Participant)
    : null;
}

export async function setGuestClaim(participant: Participant, itemId: string, claimed: boolean) {
  const prisma = getPrisma();
  const item = await prisma.billItem.findFirst({
    where: { id: itemId, billId: participant.billId },
    select: { id: true },
  });
  if (!item) throw new Error("ITEM_NOT_FOUND");
  if (claimed) {
    await prisma.itemClaim.upsert({
      where: { itemId_participantId: { itemId, participantId: participant.id } },
      create: { billId: participant.billId, itemId, participantId: participant.id },
      update: {},
    });
  } else {
    await prisma.itemClaim.deleteMany({
      where: { itemId, participantId: participant.id, billId: participant.billId },
    });
  }
}

export async function setGuestReady(participant: Participant, isReady: boolean) {
  await getPrisma().participant.update({ where: { id: participant.id }, data: { isReady } });
}
