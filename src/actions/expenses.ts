import type { ExpenseEntry } from "@/components/expenses/ExpensesDesktop";

// ── API types ──────────────────────────────────────────────────

interface ApiExpense {
  _id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: ApiExpense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ── Helpers ────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set(["Fuel", "Maintenance", "Rent", "Worker Advance", "Transport", "Other"]);

function mapCategory(raw: string): ExpenseEntry["category"] {
  return VALID_CATEGORIES.has(raw) ? (raw as ExpenseEntry["category"]) : "Other";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtAmount(n: number): string {
  return `-₹${n.toLocaleString("en-IN")}`;
}

function toExpenseEntry(e: ApiExpense): ExpenseEntry {
  return {
    id:          e._id,
    date:        fmtDate(e.date),
    category:    mapCategory(e.category),
    description: e.description,
    subcategory: e.description,
    amount:      fmtAmount(e.amount),
    rawAmount:   e.amount,
    rawDate:     e.date,
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

function isThisMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
      && d.getMonth()    === now.getMonth();
}

export interface ExpenseStats {
  desktop: { label: string; value: string; trend: string; trendUp: boolean }[];
  todayFormatted: string;
  todayDateLabel: string;
}

function computeStats(raw: ApiExpense[]): ExpenseStats {
  const todayAmt = raw.filter((e) => isToday(e.date)).reduce((s, e) => s + e.amount, 0);
  const monthAmt = raw.filter((e) => isThisMonth(e.date)).reduce((s, e) => s + e.amount, 0);

  const todayDateLabel = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return {
    desktop: [
      { label: "TODAY'S EXPENSES",       value: `₹${todayAmt.toLocaleString("en-IN")}`,  trend: "", trendUp: false },
      { label: "TOTAL MONTHLY EXPENSES", value: `₹${monthAmt.toLocaleString("en-IN")}`, trend: "", trendUp: false },
    ],
    todayFormatted: `₹${todayAmt.toLocaleString("en-IN")}`,
    todayDateLabel,
  };
}

// ── Fetch ──────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchExpenses(): Promise<{
  entries: ExpenseEntry[];
  todayEntries: ExpenseEntry[];
  stats: ExpenseStats;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/expenses?limit=100`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`fetchExpenses: HTTP ${res.status}`);
      return { entries: [], todayEntries: [], stats: computeStats([]) };
    }

    const json: ApiResponse = await res.json();

    if (!json.success) {
      console.error("fetchExpenses: API returned success=false");
      return { entries: [], todayEntries: [], stats: computeStats([]) };
    }

    const entries    = json.data.map(toExpenseEntry);
    const todayEntries = entries.filter((e) => isToday(e.rawDate));
    const stats      = computeStats(json.data);

    return { entries, todayEntries, stats };
  } catch (err) {
    console.error("fetchExpenses: fetch failed", err);
    return { entries: [], todayEntries: [], stats: computeStats([]) };
  }
}
