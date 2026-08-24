import type { Bill, BillItem, ItemClaim, Participant, ParticipantTotal } from "@/types/bill";

const billId = "550e8400-e29b-41d4-a716-446655440000";

export const demoBill: Bill = {
  id: billId, code: "B7X2KP", restaurantName: "Baan Suan Sathorn", subtotal: 1000,
  serviceChargeRate: 0.1, serviceChargeAmount: 100, vatRate: 0.07, vatAmount: 77,
  discount: 50, total: 1127, isVatIncluded: false, status: "waiting",
};

export const demoParticipants: Participant[] = [
  { id: "host-shwan", billId, name: "Shwan", isHost: true, isReady: false },
  { id: "guest-mali", billId, name: "Mali", isHost: false, isReady: false },
  { id: "guest-ben", billId, name: "Ben", isHost: false, isReady: false },
];

export const demoItems: BillItem[] = [
  { id: "fried-rice", billId, thaiName: "ข้าวผัดกุ้ง", englishName: "Shrimp fried rice", quantity: 1, price: 120 },
  { id: "tom-yum", billId, thaiName: "ต้มยำกุ้ง", englishName: "Tom yum goong", quantity: 1, price: 220 },
  { id: "morning-glory", billId, thaiName: "ผัดผักบุ้งไฟแดง", englishName: "Morning glory", quantity: 1, price: 140 },
  { id: "grilled-chicken", billId, thaiName: "ไก่ย่าง", englishName: "Grilled chicken", quantity: 1, price: 260 },
  { id: "thai-tea", billId, thaiName: "ชาไทย", englishName: "Thai milk tea", quantity: 1, price: 65 },
  { id: "rice", billId, thaiName: "ข้าวสวย", englishName: "Steamed jasmine rice", quantity: 3, price: 30 },
  { id: "mango", billId, thaiName: "ข้าวเหนียวมะม่วง", englishName: "Mango sticky rice", quantity: 1, price: 105 },
];

export const demoClaims: ItemClaim[] = [
  makeClaim("fried-rice", "host-shwan"), makeClaim("tom-yum", "host-shwan"),
  makeClaim("tom-yum", "guest-mali"), makeClaim("morning-glory", "guest-mali"),
  makeClaim("morning-glory", "guest-ben"), makeClaim("grilled-chicken", "guest-ben"),
  makeClaim("thai-tea", "host-shwan"), makeClaim("rice", "host-shwan"),
  makeClaim("rice", "guest-mali"), makeClaim("rice", "guest-ben"),
];

function makeClaim(itemId: string, participantId: string): ItemClaim {
  return { id: `${itemId}-${participantId}`, billId, itemId, participantId };
}

export function findDemoBillByCode(code: string) {
  return code.toUpperCase() === demoBill.code ? demoBill : null;
}

export function itemTotal(item: BillItem) { return item.price * item.quantity; }
export function claimsForItem(itemId: string, claims: ItemClaim[]) { return claims.filter((entry) => entry.itemId === itemId); }

export function calculateParticipantSubtotal(participantId: string, items: BillItem[], claims: ItemClaim[]) {
  return items.reduce((total, item) => {
    const itemClaims = claimsForItem(item.id, claims);
    if (!itemClaims.some((entry) => entry.participantId === participantId)) return total;
    return total + itemTotal(item) / itemClaims.length;
  }, 0);
}

export function calculateParticipantTotal(participant: Participant, bill: Bill, items: BillItem[], claims: ItemClaim[]): ParticipantTotal {
  const foodSubtotal = calculateParticipantSubtotal(participant.id, items, claims);
  const ratio = bill.subtotal > 0 ? foodSubtotal / bill.subtotal : 0;
  const serviceCharge = bill.serviceChargeAmount * ratio;
  const vat = bill.vatAmount * ratio;
  const discount = bill.discount * ratio;
  return { participantId: participant.id, participantName: participant.name, foodSubtotal, serviceCharge, vat, discount, total: foodSubtotal + serviceCharge + vat - discount };
}

export function hasUnclaimedItems(items: BillItem[], claims: ItemClaim[]) { return items.some((item) => !claims.some((entry) => entry.itemId === item.id)); }
export function isFinalTotalBalanced(totals: ParticipantTotal[], billTotal: number) { return Math.abs(totals.reduce((sum, participant) => sum + participant.total, 0) - billTotal) < 0.01; }

export function baht(value: number) {
  return new Intl.NumberFormat("en-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 }).format(value).replace("THB", "฿").trim();
}
