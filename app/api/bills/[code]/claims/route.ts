import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authenticateGuest, setGuestClaim } from "@/lib/db/bills";
import { isDatabaseConfigured } from "@/lib/db/config";
import { guestCookieName } from "@/lib/db/session";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = (await request.json().catch(() => null)) as { itemId?: unknown; claimed?: unknown } | null;
  if (typeof body?.itemId !== "string" || typeof body.claimed !== "boolean") return NextResponse.json({ error: "Invalid claim." }, { status: 400 });
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: true });
  const token = (await cookies()).get(guestCookieName(code))?.value;
  const participant = await authenticateGuest(code, token);
  if (!participant) return NextResponse.json({ error: "Join this bill first." }, { status: 401 });
  try {
    await setGuestClaim(participant, body.itemId, body.claimed);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "ITEM_NOT_FOUND") return NextResponse.json({ error: "Item not found." }, { status: 404 });
    throw error;
  }
}
