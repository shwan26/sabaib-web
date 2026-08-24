import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authenticateGuest, setGuestReady } from "@/lib/db/bills";
import { isDatabaseConfigured } from "@/lib/db/config";
import { guestCookieName } from "@/lib/db/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = (await request.json().catch(() => null)) as { isReady?: unknown } | null;
  if (typeof body?.isReady !== "boolean") return NextResponse.json({ error: "Invalid ready state." }, { status: 400 });
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: true });
  const token = (await cookies()).get(guestCookieName(code))?.value;
  const participant = await authenticateGuest(code, token);
  if (!participant) return NextResponse.json({ error: "Join this bill first." }, { status: 401 });
  await setGuestReady(participant, body.isReady);
  return NextResponse.json({ ok: true });
}
