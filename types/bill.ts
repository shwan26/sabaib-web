export type BillStatus = "waiting" | "splitting" | "settling" | "completed";

export interface Bill {
  id: string;
  code: string;
  restaurantName: string;
  subtotal: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  total: number;
  isVatIncluded: boolean;
  status: BillStatus;
}

export interface Participant {
  id: string;
  billId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
}

export interface BillItem {
  id: string;
  billId: string;
  thaiName: string;
  englishName: string;
  quantity: number;
  price: number;
}

export interface BillBundle {
  bill: Bill;
  participants: Participant[];
  items: BillItem[];
  claims: ItemClaim[];
  source: "supabase" | "demo";
  currentParticipantId?: string;
}

export interface ItemClaim {
  id: string;
  billId: string;
  itemId: string;
  participantId: string;
}

export interface ParticipantTotal {
  participantId: string;
  participantName: string;
  foodSubtotal: number;
  serviceCharge: number;
  vat: number;
  discount: number;
  total: number;
}
