import type { TyreEntry } from "@/components/tyres/TyresTable";

// ── API types ──────────────────────────────────────────────────

interface ApiTyre {
  _id: string;
  date: string;
  vehicleNo: string;
  tyreSize: string;
  tyreNo: string;
  tyreMake: string;
  rate: number;
  qty: number;
  total: number;
  deliveryStatus: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiTyre[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// ── Helpers ────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function mapDeliveryStatus(s: string): TyreEntry["status"] {
  if (s === "Delivered") return "Delivered";
  return "Pending";
}

function mapPaymentStatus(s: string): TyreEntry["payment"] {
  if (s === "Paid")    return "Paid";
  if (s === "Partial") return "Partial";
  return "Unpaid";
}

function toTyreEntry(t: ApiTyre): TyreEntry {
  return {
    id:          t._id,
    date:        formatDate(t.date),
    vehicleNo:   t.vehicleNo,
    tyreSize:    t.tyreSize,
    qty:         t.qty,
    expectedAmt: formatAmount(t.total),
    status:      mapDeliveryStatus(t.deliveryStatus),
    payment:     mapPaymentStatus(t.paymentStatus),
  };
}

// ── Fetch ──────────────────────────────────────────────────────

const API_BASE = process.env.API_BASE_URL;

export async function fetchTyres(): Promise<TyreEntry[]> {
  try {
    const res = await fetch(`${API_BASE}/api/tyres`, {
      cache: "no-store", // always fresh data
    });

    if (!res.ok) {
      console.error(`fetchTyres: HTTP ${res.status}`);
      return [];
    }

    const json: ApiResponse = await res.json();

    if (!json.success) {
      console.error("fetchTyres: API returned success=false");
      return [];
    }

    return json.data.map(toTyreEntry);
  } catch (err) {
    console.error("fetchTyres: fetch failed", err);
    return [];
  }
}
