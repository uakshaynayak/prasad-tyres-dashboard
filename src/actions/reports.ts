// Client-callable fetch — uses NEXT_PUBLIC_API_BASE_URL
// Kept as a plain module so both Server Components and Client Components can import the types.

export interface ReportApiData {
  period: string;
  dateRange: { from: string; to: string };
  tyres: {
    received: number;
    delivered: number;
    notDelivered: number;
    deliveredButUnpaid: number;
  };
  grossRevenue: {
    received: number;
    expected: number;
    outstanding: number;
  };
  expense: number;
  netMoney: number;
  summary: {
    totalPending: { qty: number };
    totalUnpaid: { qty: number; amount: number };
    deliveredAndUnpaid: { qty: number; amount: number };
    collection: number;
    tyresDeliveredForPeriod: number;
  };
}

export type ReportPeriod = "daily" | "weekly" | "monthly";

// ── URL builder (runs in browser) ─────────────────────────────

export function buildReportUrl(tab: ReportPeriod, offset: number): string {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const params = new URLSearchParams({ period: tab });
  const now = new Date();

  if (tab === "daily") {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    params.set("date", d.toISOString().split("T")[0]);
  } else if (tab === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - offset * 7);
    params.set("date", d.toISOString().split("T")[0]);
  } else {
    // monthly
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    if (offset > 0) {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      params.set("month", `${d.getFullYear()}-${m}`);
    }
  }

  return `${API}/api/reports?${params.toString()}`;
}

// ── Human-readable period label ────────────────────────────────

export function periodLabel(tab: ReportPeriod, offset: number): string {
  const now = new Date();

  if (tab === "daily") {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  }

  if (tab === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() - offset * 7);
    const dow = d.getDay();
    const daysBack = dow === 0 ? 6 : dow - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - daysBack);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (dt: Date) => dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    return `${fmt(monday)} – ${fmt(sunday)}, ${monday.getFullYear()}`;
  }

  // monthly
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ── Fetch wrapper (browser) ────────────────────────────────────

export async function fetchReport(
  tab: ReportPeriod,
  offset: number
): Promise<ReportApiData | null> {
  try {
    const res = await fetch(buildReportUrl(tab, offset));
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? (json.data as ReportApiData) : null;
  } catch {
    return null;
  }
}

// ── Format helpers ─────────────────────────────────────────────

export function fmtAmt(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
