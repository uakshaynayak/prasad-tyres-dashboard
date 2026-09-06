import type { PaymentEntry } from "@/components/payments/PaymentsDesktop";

// ── API types ──────────────────────────────────────────────────

interface ApiTyreEntry {
  _id: string;
  vehicleNo: string;
  tyreSize: string;
  tyreMake: string;
  rate: number;
  qty: number;
  total: number;
  deliveryStatus: string;
  paymentStatus: string;
}

interface ApiPayment {
  _id: string;
  tyreEntryId: ApiTyreEntry;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Helpers ────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtAmount(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function shortRef(id: string): string {
  return `TXN-${id.slice(-8).toUpperCase()}`;
}

function mapStatus(amount: number, total: number): PaymentEntry["status"] {
  if (amount >= total) return "Full Payment";
  if (amount > 0)     return "Partial Payment";
  return "Pending";
}

function toPaymentEntry(p: ApiPayment): PaymentEntry {
  const tyre  = p.tyreEntryId;
  const outstanding = Math.max(0, tyre.total - p.amount);
  return {
    id:                 p._id,
    date:               fmtDate(p.paymentDate),
    time:               fmtTime(p.paymentDate),
    transactionId:      shortRef(p._id),
    vehicleNumber:      tyre.vehicleNo,
    tyreSize:           tyre.tyreSize,
    amountReceived:     fmtAmount(p.amount),
    outstandingBalance: fmtAmount(outstanding),
    hasOutstanding:     outstanding > 0,
    status:             mapStatus(p.amount, tyre.total),
    paymentMethod:      "—",
  };
}

// ── Stats helpers ──────────────────────────────────────────────

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
      && d.getMonth()    === now.getMonth()
      && d.getDate()     === now.getDate();
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso).getTime();
  const now = Date.now();
  return now - d <= 7 * 24 * 60 * 60 * 1000;
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
      && d.getMonth()    === now.getMonth();
}

export interface PaymentStats {
  desktop: { label: string; value: string; trend: string; trendUp: boolean }[];
  mobile:  { label: string; value: string; trend: string; trendUp: boolean }[];
}

function computeStats(raw: ApiPayment[]): PaymentStats {
  const today = raw.filter((p) => isToday(p.paymentDate)).reduce((s, p) => s + p.amount, 0);
  const week  = raw.filter((p) => isThisWeek(p.paymentDate)).reduce((s, p) => s + p.amount, 0);
  const month = raw.filter((p) => isThisMonth(p.paymentDate)).reduce((s, p) => s + p.amount, 0);

  return {
    desktop: [
      { label: "MONEY RECEIVED TODAY",      value: fmtAmount(today), trend: "", trendUp: true },
      { label: "MONEY RECEIVED THIS WEEK",  value: fmtAmount(week),  trend: "", trendUp: true },
      { label: "MONEY RECEIVED THIS MONTH", value: fmtAmount(month), trend: "", trendUp: true },
    ],
    mobile: [
      { label: "TODAY",     value: fmtAmount(today), trend: "", trendUp: true },
      { label: "THIS WEEK", value: fmtAmount(week),  trend: "", trendUp: true },
    ],
  };
}

// ── Fetch ──────────────────────────────────────────────────────

const API_BASE = process.env.API_BASE_URL;

export async function fetchPayments(): Promise<{
  entries: PaymentEntry[];
  stats: PaymentStats;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/payments?limit=100`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`fetchPayments: HTTP ${res.status}`);
      return { entries: [], stats: computeStats([]) };
    }

    const json: ApiResponse = await res.json();

    if (!json.success) {
      console.error("fetchPayments: API returned success=false");
      return { entries: [], stats: computeStats([]) };
    }

    return {
      entries: json.data.map(toPaymentEntry),
      stats:   computeStats(json.data),
    };
  } catch (err) {
    console.error("fetchPayments: fetch failed", err);
    return { entries: [], stats: computeStats([]) };
  }
}
