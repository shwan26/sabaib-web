"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  baht,
  calculateParticipantTotal,
  claimsForItem,
  demoBill,
  itemTotal,
} from "@/lib/demo-bill";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Bill, BillBundle, BillItem, ItemClaim, Participant } from "@/types/bill";
import {
  ArrowLeftIcon, ArrowRightIcon, CheckIcon, CreditCardIcon, InfoIcon,
  LockIcon, LogoMark, UsersIcon,
} from "@/components/icons";

type Step = "join" | "room" | "split" | "summary" | "payment";
type PaymentStatus = "unpaid" | "submitted" | "paid";
type Session = { participant: Participant | null; claimedItemIds: string[]; payment: PaymentStatus };

const emptySession: Session = { participant: null, claimedItemIds: [], payment: "unpaid" };
const itemEmoji: Record<string, string> = {
  "fried-rice": "🍤", "tom-yum": "🥘", "morning-glory": "🥬",
  "grilled-chicken": "🍗", "thai-tea": "🧋", rice: "🍚", mango: "🥭",
};

function storageKey(code: string) { return `sabaib-guest-${code.toUpperCase()}`; }
function itemLabel(item: BillItem) { return item.englishName || item.thaiName || "Receipt item"; }

export default function BillExperience({ code, step }: { code: string; step: Step }) {
  const router = useRouter();
  const normalizedCode = code.toUpperCase();
  const isDemo = normalizedCode === demoBill.code;
  const [session, setSession] = useState<Session>(emptySession);
  const [bundle, setBundle] = useState<BillBundle | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const persistSession = useCallback((next: Session) => {
    setSession(next);
    try { window.localStorage.setItem(storageKey(normalizedCode), JSON.stringify(next)); } catch { /* Optional persistence. */ }
  }, [normalizedCode]);

  const refreshBill = useCallback(async () => {
    const response = await fetch(`/api/bills/${encodeURIComponent(normalizedCode)}`, { cache: "no-store" });
    if (response.status === 404) { setNotFound(true); setLoaded(true); return; }
    if (!response.ok) throw new Error("Could not load this bill.");
    const nextBundle = await response.json() as BillBundle;
    setBundle(nextBundle);
    setSession((previous) => {
      const authenticatedParticipant = nextBundle.currentParticipantId
        ? nextBundle.participants.find((person) => person.id === nextBundle.currentParticipantId) ?? null
        : null;
      const participant = nextBundle.source === "supabase" ? authenticatedParticipant : previous.participant;
      const claimedItemIds = participant
        ? nextBundle.claims.filter((claim) => claim.participantId === participant.id).map((claim) => claim.itemId)
        : previous.claimedItemIds;
      const next = { ...previous, participant, claimedItemIds };
      try { window.localStorage.setItem(storageKey(normalizedCode), JSON.stringify(next)); } catch { /* Optional persistence. */ }
      return next;
    });
    setLoaded(true);
  }, [normalizedCode]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey(normalizedCode));
      // Hydrate the anonymous session after the server render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSession({ ...emptySession, ...JSON.parse(stored) });
    } catch { /* Continue without persistence. */ }
    void refreshBill().catch(() => setLoaded(true));
  }, [normalizedCode, refreshBill]);

  useEffect(() => {
    if (bundle?.source !== "supabase") return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const billId = bundle.bill.id;
    const refresh = () => { void refreshBill(); };
    const channel = supabase.channel(`bill-${billId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bills", filter: `id=eq.${billId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "participants", filter: `bill_id=eq.${billId}` }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "item_claims", filter: `bill_id=eq.${billId}` }, refresh)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [bundle?.bill.id, bundle?.source, refreshBill]);

  useEffect(() => {
    if (!bundle || bundle.source !== "supabase") return;
    if (step === "room" && bundle.bill.status === "splitting") router.replace(`/bill/${normalizedCode}/split`);
    if ((step === "room" || step === "split") && ["settling", "completed"].includes(bundle.bill.status)) router.replace(`/bill/${normalizedCode}/summary`);
  }, [bundle, normalizedCode, router, step]);

  async function join(name: string) {
    const response = await fetch(`/api/bills/${encodeURIComponent(normalizedCode)}/participants`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }),
    });
    const result = await response.json() as { participant?: Participant; error?: string };
    if (!response.ok || !result.participant) throw new Error(result.error || "Could not join this bill.");
    persistSession({ ...emptySession, participant: result.participant });
    await refreshBill();
    router.push(`/bill/${normalizedCode}`);
  }

  function startDemoSplit() {
    if (!bundle || !isDemo) return;
    setBundle({ ...bundle, bill: { ...bundle.bill, status: "splitting" } });
    router.push(`/bill/${normalizedCode}/split`);
  }

  function toggleItem(itemId: string) {
    const claimed = !session.claimedItemIds.includes(itemId);
    const claimedItemIds = claimed
      ? [...session.claimedItemIds, itemId]
      : session.claimedItemIds.filter((id) => id !== itemId);
    persistSession({ ...session, claimedItemIds });
    void fetch(`/api/bills/${encodeURIComponent(normalizedCode)}/claims`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemId, claimed }),
    }).then((response) => { if (!response.ok) void refreshBill(); });
  }

  async function finishClaiming() {
    const response = await fetch(`/api/bills/${encodeURIComponent(normalizedCode)}/ready`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ isReady: true }),
    });
    if (response.ok) router.push(`/bill/${normalizedCode}/summary`);
  }

  if (!loaded) return <BillLoading />;
  if (notFound || !bundle) return <BillNotFound code={normalizedCode} />;
  if (step !== "join" && !session.participant) return <JoinScreen code={normalizedCode} restaurantName={bundle.bill.restaurantName} isDemo={isDemo} onJoin={join} />;

  const { bill, participants, items, claims } = bundle;
  return (
    <div className="app-shell">
      <AppHeader code={normalizedCode} participant={session.participant} />
      {step === "join" && <JoinScreen code={normalizedCode} restaurantName={bill.restaurantName} isDemo={isDemo} onJoin={join} />}
      {step === "room" && session.participant && <WaitingRoom bill={bill} participants={participants} participant={session.participant} isDemo={isDemo} onStart={startDemoSplit} />}
      {step === "split" && session.participant && <SplitScreen code={normalizedCode} bill={bill} participants={participants} items={items} baseClaims={claims} participant={session.participant} selectedIds={session.claimedItemIds} onToggle={toggleItem} onDone={finishClaiming} />}
      {step === "summary" && session.participant && <SummaryScreen code={normalizedCode} bill={bill} items={items} baseClaims={claims} participant={session.participant} selectedIds={session.claimedItemIds} onContinue={() => router.push(`/bill/${normalizedCode}/payment`)} />}
      {step === "payment" && session.participant && <PaymentScreen code={normalizedCode} bill={bill} items={items} baseClaims={claims} participants={participants} participant={session.participant} selectedIds={session.claimedItemIds} payment={session.payment} onPayment={(payment) => persistSession({ ...session, payment })} />}
    </div>
  );
}

function AppHeader({ code, participant }: { code: string; participant: Participant | null }) {
  return <header className="app-header"><Link href="/" className="brand"><LogoMark /><span>SabaiB</span></Link><div className="header-meta"><span className="code-chip">Bill {code}</span>{participant && <span className="guest-avatar">{participant.name[0].toUpperCase()}</span>}</div></header>;
}

function JoinScreen({ code, restaurantName, isDemo, onJoin }: { code: string; restaurantName: string; isDemo: boolean; onJoin: (name: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Please enter at least 2 characters.");
    setPending(true); setError("");
    try { await onJoin(name); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not join this bill."); setPending(false); }
  }
  return <main className="center-main"><section className="join-card"><div className="penguin-welcome"><LogoMark /><span>👋</span></div><p className="eyebrow">JOINING</p><h1>{restaurantName}</h1><p className="muted">You’ve been invited to split this bill.</p><div className="bill-code-panel"><small>Bill code</small><strong>{code}</strong></div><form onSubmit={submit} className="join-form" noValidate><label htmlFor="guest-name">Your name</label><input id="guest-name" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder="e.g. Alex" autoComplete="name" autoFocus aria-describedby={error ? "name-error" : undefined} />{error && <p className="form-error" id="name-error">{error}</p>}<button className="primary-button" type="submit" disabled={pending}>{pending ? "Joining…" : <>Join bill <ArrowRightIcon /></>}</button></form>{!isDemo && <div className="join-alt"><span className="join-alt-divider">or</span><Link href="/login" className="join-alt-link">Sign in to keep a record of your bills</Link></div>}<p className="privacy-note"><LockIcon /> No account or password needed.</p></section></main>;
}

function WaitingRoom({ bill, participants, participant, isDemo, onStart }: { bill: Bill; participants: Participant[]; participant: Participant; isDemo: boolean; onStart: () => void }) {
  const host = participants.find((person) => person.isHost)?.name || "the host";

  useEffect(() => {
    if (!isDemo) return;
    const timer = window.setTimeout(onStart, 2000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  return <main className="page-main narrow-page"><section className="room-hero"><div className="pulse-mark"><UsersIcon /></div><p className="eyebrow">YOU’RE IN</p><h1>Waiting for the host</h1><p>{isDemo ? `${host} is starting the split…` : `We’ll move everyone to the items when ${host} starts splitting.`}</p></section><section className="room-card"><div className="room-heading"><div><small>{bill.restaurantName}</small><h2>{participants.length} joined</h2></div><span className="live-pill"><i /> Live</span></div><div className="participant-list">{participants.map((person) => <div key={person.id}><span className="avatar">{person.name[0].toUpperCase()}</span><b>{person.name}{person.id === participant.id && <small> You</small>}</b>{person.isReady && <span className="ready-pill">Ready</span>}{person.isHost && <span className="host-pill">Host</span>}</div>)}</div></section>{isDemo && <button className="skip-wait" onClick={onStart}>Skip wait <ArrowRightIcon /></button>}</main>;
}

function useGuestClaims(participant: Participant, selectedIds: string[], baseClaims: ItemClaim[]) {
  return useMemo<ItemClaim[]>(() => [
    ...baseClaims.filter((claim) => claim.participantId !== participant.id),
    ...selectedIds.map((itemId) => ({ id: `${itemId}-${participant.id}`, billId: participant.billId, itemId, participantId: participant.id })),
  ], [baseClaims, participant, selectedIds]);
}

type BillScreenData = { bill: Bill; items: BillItem[]; baseClaims: ItemClaim[]; participant: Participant; selectedIds: string[] };

function SplitScreen({ code, bill, participants, items, baseClaims, participant, selectedIds, onToggle, onDone }: BillScreenData & { code: string; participants: Participant[]; onToggle: (id: string) => void; onDone: () => Promise<void> }) {
  const claims = useGuestClaims(participant, selectedIds, baseClaims);
  const total = calculateParticipantTotal(participant, bill, items, claims);
  return <main className="page-main"><Link href={`/bill/${code}`} className="back-link"><ArrowLeftIcon /> Back to bill room</Link><section className="split-heading"><div><p className="eyebrow">WELCOME, {participant.name.toUpperCase()}</p><h1>What did you have?</h1><p>Claim every dish you ate. Shared dishes split automatically.</p></div><div className="running-total"><small>Your running total</small><strong>{baht(total.total)}</strong></div></section><div className="split-grid"><section className="items-card"><div className="section-title"><h2>Receipt items</h2><span>{items.length} items</span></div>{items.map((item) => { const selected = selectedIds.includes(item.id); const itemClaims = claimsForItem(item.id, claims); const names = itemClaims.map((entry) => participants.find((person) => person.id === entry.participantId)?.name).filter(Boolean); return <button className={`claim-row ${selected ? "selected" : ""}`} key={item.id} onClick={() => onToggle(item.id)} aria-pressed={selected}><span className="check-box">{selected && <CheckIcon />}</span><span className="food-icon">{itemEmoji[item.id] || "🍽️"}</span><span className="item-details"><b>{itemLabel(item)}</b>{item.thaiName && <small lang="th">{item.thaiName}</small>}<small>{item.quantity > 1 ? `${item.quantity} × ${baht(item.price)}` : names.length ? `Claimed by ${names.join(" · ")}` : "Not claimed yet"}</small>{item.quantity > 1 && names.length > 0 && <small>Claimed by {names.join(" · ")}</small>}</span><span className="item-price"><b>{baht(itemTotal(item))}</b>{itemClaims.length > 1 && <small>{baht(itemTotal(item) / itemClaims.length)} each</small>}</span></button>; })}</section><aside className="total-card"><p className="eyebrow">YOUR SHARE</p><h2>{baht(total.total)}</h2><p>{selectedIds.length ? `${selectedIds.length} claimed ${selectedIds.length === 1 ? "item" : "items"}` : "Choose your dishes to begin"}</p><div className="calculation-lines"><span><label>Food subtotal</label><b>{baht(total.foodSubtotal)}</b></span><span><label>Service + VAT − discount</label><b>{baht(total.serviceCharge + total.vat - total.discount)}</b></span></div><button className="primary-button" onClick={() => void onDone()} disabled={!selectedIds.length}>I’m done <ArrowRightIcon /></button><small>You can return and update your claims.</small></aside></div></main>;
}

function SummaryScreen({ code, bill, items, baseClaims, participant, selectedIds, onContinue }: BillScreenData & { code: string; onContinue: () => void }) {
  const claims = useGuestClaims(participant, selectedIds, baseClaims); const total = calculateParticipantTotal(participant, bill, items, claims); const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  return <main className="page-main narrow-page"><Link href={`/bill/${code}/split`} className="back-link"><ArrowLeftIcon /> Edit my items</Link><section className="summary-hero"><div className="success-mark"><CheckIcon /></div><p className="eyebrow">ALL SET, {participant.name.toUpperCase()}</p><h1>You owe <em>{baht(total.total)}</em></h1><p>Charges and discount are allocated in proportion to your food subtotal.</p></section><section className="summary-card"><div className="section-title"><h2>Your bill</h2><span>{selectedItems.length} items</span></div><div className="summary-items">{selectedItems.map((item) => { const splitCount = claimsForItem(item.id, claims).length; return <div key={item.id}><span>{itemEmoji[item.id] || "🍽️"} <b>{itemLabel(item)}</b>{splitCount > 1 && <small>Split {splitCount} ways</small>}</span><strong>{baht(itemTotal(item) / splitCount)}</strong></div>; })}</div><div className="summary-lines"><span><label>Food subtotal</label><b>{baht(total.foodSubtotal)}</b></span><span><label>Service charge ({bill.serviceChargeRate * 100}%)</label><b>{baht(total.serviceCharge)}</b></span><span><label>VAT ({bill.vatRate * 100}%)</label><b>{baht(total.vat)}</b></span><span className="discount"><label>Discount share</label><b>−{baht(total.discount)}</b></span></div><div className="summary-total"><span>Total to pay</span><strong>{baht(total.total)}</strong></div><button className="primary-button" onClick={onContinue}>Continue to payment <ArrowRightIcon /></button></section></main>;
}

function PaymentScreen({ code, bill, items, baseClaims, participants, participant, selectedIds, payment, onPayment }: BillScreenData & { code: string; participants: Participant[]; payment: PaymentStatus; onPayment: (payment: PaymentStatus) => void }) {
  const claims = useGuestClaims(participant, selectedIds, baseClaims); const total = calculateParticipantTotal(participant, bill, items, claims); const host = participants.find((person) => person.isHost)?.name || "the host";
  return <main className="page-main narrow-page"><Link href={`/bill/${code}/summary`} className="back-link"><ArrowLeftIcon /> Back to summary</Link><section className="payment-card"><div className="payment-icon"><CreditCardIcon /></div><p className="eyebrow">SETTLE UP</p><h1>Pay {host}</h1><div className="amount-panel"><small>Amount to pay</small><strong>{baht(total.total)}</strong></div><FakeQr /><p className="muted">Scan with any Thai banking app</p><div className="status-buttons">{(["unpaid", "submitted", "paid"] as const).map((status) => <button key={status} onClick={() => onPayment(status)} className={payment === status ? "active" : ""}><span>{payment === status && <CheckIcon />}</span>{status === "unpaid" ? "Unpaid" : status === "submitted" ? "Proof submitted" : "Paid"}</button>)}</div><div className="info-note"><InfoIcon /> Payment status is local for now; SabaiB does not verify bank transfers.</div></section></main>;
}

function FakeQr() { const pattern = "11111110010111111111000001011101000001010111010100101110101011101011010101110101110101010111010100000100111010000011111110101011111110000000011000000000110110101110100101110101010100111101100011101001101001110101111010001110111110101101110010001000001010011001101111111000101011111000000101111101000001111111101010101111111"; return <div className="qr-code" aria-label="Demo PromptPay QR code">{pattern.split("").map((bit, index) => <i className={bit === "1" ? "dark" : ""} key={index} />)}</div>; }
function BillNotFound({ code }: { code: string }) { return <div className="app-shell"><AppHeader code={code} participant={null} /><main className="center-main"><section className="not-found-card"><LogoMark /><p className="eyebrow">BILL {code}</p><h1>Bill not found</h1><p>Check the invite link or ask your friend for a new one.</p><Link className="primary-button" href="/">Go home</Link></section></main></div>; }
function BillLoading() { return <div className="app-shell"><header className="app-header"><div className="brand"><LogoMark /><span>SabaiB</span></div></header><main className="center-main"><div className="loading-card"><LogoMark /><p>Opening bill…</p></div></main></div>; }
