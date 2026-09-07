"use server";

import { revalidatePath } from "next/cache";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface ExpenseCreatePayload {
  amount: number;
  date: string;
  category: string;
  description: string;
}

export async function createExpenseAction(
  payload: ExpenseCreatePayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { success: false, message: json.message ?? `HTTP ${res.status}` };
    revalidatePath("/expenses");
    return { success: true };
  } catch (err) {
    return { success: false, message: String(err) };
  }
}
