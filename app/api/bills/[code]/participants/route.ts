import { NextResponse } from "next/server";
import { createGuestParticipant } from "@/lib/db/bills";
import { isDatabaseConfigured } from "@/lib/db/config";
import { guestCookieName } from "@/lib/db/session";
import { demoBill } from "@/lib/demo-bill";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Name must be 2–80 characters." }, { status: 400 });

  if (!isDatabaseConfigured()) {
    if (code !== demoBill.code) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    return NextResponse.json({ participant: { id: crypto.randomUUID(), billId: demoBill.id, name, isHost: false, isReady: false } }, { status: 201 });
  }

  try {
    const result = await createGuestParticipant(code, name);
    if (!result) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    const response = NextResponse.json({ participant: result.participant }, { status: 201 });
    response.cookies.set(guestCookieName(code), result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/api/bills/${code}`,
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "NAME_TAKEN") return NextResponse.json({ error: "That name is already in this bill." }, { status: 409 });
    throw error;
  }
}
