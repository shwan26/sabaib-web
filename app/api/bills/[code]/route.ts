import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { demoBill, demoClaims, demoItems, demoParticipants, findDemoBillByCode } from "@/lib/demo-bill";
import { authenticateGuest, findBillBundle } from "@/lib/db/bills";
import { isDatabaseConfigured } from "@/lib/db/config";
import { guestCookieName } from "@/lib/db/session";
import type { BillBundle } from "@/types/bill";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  if (!isDatabaseConfigured()) {
    if (!findDemoBillByCode(code)) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    const demo: BillBundle = { bill: demoBill, participants: demoParticipants, items: demoItems, claims: demoClaims, source: "demo" };
    return NextResponse.json(demo);
  }
  const bundle = await findBillBundle(code);
  if (!bundle) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  const token = (await cookies()).get(guestCookieName(code))?.value;
  const participant = await authenticateGuest(code, token);
  return NextResponse.json({ ...bundle, currentParticipantId: participant?.id });
}
