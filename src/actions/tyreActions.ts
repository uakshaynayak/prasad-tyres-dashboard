"use server";

import { revalidatePath } from "next/cache";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:5000";

// ── Create ─────────────────────────────────────────────────────

export interface TyreCreatePayload {
  date: string;
  vehicleNo: string;
  tyreSize: string;
  tyreNo: string;
  tyreMake: string;
  rate: number;
  qty: number;
  deliveryStatus: string;
  paymentStatus: string;
}

export async function createTyreAction(
  payload: TyreCreatePayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/tyres`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, message: json.message ?? `HTTP ${res.status}` };
    revalidatePath("/tyres");
    return { success: true };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

// ── Update ─────────────────────────────────────────────────────

export interface TyreUpdatePayload {
  date?: string;
  vehicleNo?: string;
  tyreSize?: string;
  tyreNo?: string;
  tyreMake?: string;
  rate?: number;
  qty?: number;
  deliveryStatus?: string;
  deliveryDate?: string;
  paymentStatus?: string;
}

// ── Record Payment ─────────────────────────────────────────────

export async function recordPaymentAction(
  tyreEntryId: string,
  amount: number,
  paymentDate: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tyreEntryId, amount, paymentDate }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, message: json.message ?? `HTTP ${res.status}` };
    revalidatePath("/payments");
    revalidatePath("/tyres");
    return { success: true };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}

// ── Update ─────────────────────────────────────────────────────

export async function updateTyreAction(
  id: string,
  updates: TyreUpdatePayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/tyres/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
console.log("asdsa",JSON.stringify(updates))
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { success: false, message: json.message ?? `HTTP ${res.status}` };
    }

    revalidatePath("/tyres");
    return { success: true };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
