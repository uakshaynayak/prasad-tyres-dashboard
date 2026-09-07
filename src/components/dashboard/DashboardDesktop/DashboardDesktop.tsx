"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TyreStatusChart } from "@/components/dashboard/TyreStatusChart";
import { RecentActivity, type Activity } from "@/components/dashboard/RecentActivity";
import { AttentionAlert } from "@/components/dashboard/AttentionAlert";
import {
  fetchReport, periodLabel, fmtAmt,
  type ReportApiData, type ReportPeriod,
} from "@/actions/reports";
import styles from "./DashboardDesktop.module.css";

// ── Static data (no API for these) ────────────────────────────

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "received",
    title: "Received 4 Tyres",
    subtitle: "Ramesh K.",
    vehicleBadge: "KA-01-AB-1234",
    time: "10:45 AM",
  },
  {
    id: "2",
    type: "delivered",
    title: "Delivered 2 Tyres",
    subtitle: "Suresh M.",
    vehicleBadge: "TN-02-XY-9876",
    time: "09:30 AM",
    amount: "₹12,500",
  },
  {
    id: "3",
    type: "expense",
    title: "Expense Logged: Transport",
    subtitle: "Admin",
    time: "09:00 AM",
    amount: "₹3,500",
    amountColor: "danger",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Received",
    subtitle: "Logistics Co.",
    time: "Yesterday",
    amount: "₹32,500",
  },
];

const ATTENTION_ITEMS = [
  "3 old pending tyres (> 30 days)",
  "2 unpaid deliveries over ₹10k",
  "High expense: Transport (₹5,000)",
];

const TABS: { id: ReportPeriod; label: string }[] = [
  { id: "daily",   label: "Daily"   },
  { id: "weekly",  label: "Weekly"  },
  { id: "monthly", label: "Monthly" },
];

// ── Helpers ────────────────────────────────────────────────────

function periodSuffix(tab: ReportPeriod): string {
  if (tab === "daily")   return "Today";
  if (tab === "weekly")  return "This Week";
  return "This Month";
}

function buildCards(data: ReportApiData, tab: ReportPeriod, cashInHand: number | null) {
  const suffix = periodSuffix(tab);
  return [
    { label: `Tyres Received — ${suffix}`,   value: String(data.tyres.received) },
    { label: `Tyres Delivered — ${suffix}`,  value: String(data.summary.tyresDeliveredForPeriod) },
    {
      label: "Pending Tyres",
      value: String(data?.summary?.totalPending?.qty ?? 0),
      badge: { text: "Needs Action", variant: "warning" as const },
    },
    { label: "Delivered & Unpaid", value: String(data.summary?.deliveredAndUnpaid?.qty ?? 0), valueColor: "danger" as const },
    { label: `Collection — ${suffix}`,   value: fmtAmt(data.summary?.collection ?? 0) },
    { label: "Pending Collection",          value: fmtAmt(data.summary?.totalUnpaid?.amount ?? 0) },
    { label: `Expenses — ${suffix}`,         value: fmtAmt(data?.expense ?? 0), valueColor: "danger" as const },
    {
      label: "Cash in Hand",
      value: cashInHand !== null ? fmtAmt(cashInHand) : "—",
      valueColor: "primary" as const,
      labelColor: "primary" as const,
    },
  ];
}

function buildSegments(data: ReportApiData) {
  const deliveredPaid = Math.max(0, data.tyres.delivered - data.tyres.deliveredButUnpaid);
  return [
    { label: "Pending",            count: data.tyres.notDelivered,       color: "#743B00" },
    { label: "Delivered & Paid",   count: deliveredPaid,                 color: "#0F4C81" },
    { label: "Delivered & Unpaid", count: data.tyres.deliveredButUnpaid, color: "#d93025" },
  ];
}

// ── Skeleton card ──────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "1.25rem", background: "var(--color-surface,#fff)", border: "1px solid var(--color-border,#e5e8ec)", borderRadius: "var(--radius-md,0.625rem)" }}>
      <span className={styles.skeleton} style={{ height: 14, width: "60%" }} />
      <span className={styles.skeleton} style={{ height: 28, width: "40%" }} />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────

const CASH_API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export function DashboardDesktop() {
  const [tab, setTab]         = useState<ReportPeriod>("daily");
  const [offset, setOffset]   = useState(0);
  const [data, setData]       = useState<ReportApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cashInHand, setCashInHand] = useState<number | null>(null);

  // Fetch cash summary once on mount
  useEffect(() => {
    fetch(`${CASH_API}/api/cash/summary`)
      .then((r) => r.json())
      .then((j) => { if (j.success) setCashInHand(j.data.cashInHand); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReport(tab, offset).then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [tab, offset]);

  function switchTab(t: ReportPeriod) {
    setTab(t);
    setOffset(0);
  }

  const cards    = data ? buildCards(data, tab, cashInHand) : null;
  const segments = data ? buildSegments(data) : [];
  const total    = data ? data.tyres.received : 0;

  return (
    <>
      {/* Period bar */}
      <div className={styles.periodBar}>
        <div className={styles.tabs}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={[styles.tab, tab === id ? styles.tabActive : ""].join(" ")}
              onClick={() => switchTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.periodNav}>
          <button
            className={styles.arrowBtn}
            onClick={() => setOffset((o) => o + 1)}
            aria-label="Previous period"
          >
            ‹
          </button>
          <span className={styles.periodLabel}>{periodLabel(tab, offset)}</span>
          <button
            className={styles.arrowBtn}
            onClick={() => setOffset((o) => o - 1)}
            disabled={offset === 0}
            aria-label="Next period"
          >
            ›
          </button>
        </div>
      </div>

      {/* Error */}
      {!loading && data === null && (
        <div className={styles.errorBanner}>Could not load report data. Please try again.</div>
      )}

      {/* Stat cards */}
      <div className={styles.statGrid}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : (cards ?? []).map((card) => <StatCard key={card.label} {...card} />)
        }
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <div className={styles.tyreStatusCard}>
          <h2 className={styles.cardTitle}>Tyre Status</h2>
          {loading
            ? <span className={styles.skeleton} style={{ height: 200, display: "block" }} />
            : <TyreStatusChart total={total} segments={segments} />
          }
          <AttentionAlert items={ATTENTION_ITEMS} />
        </div>

        <div className={styles.activityCard}>
          <RecentActivity activities={ACTIVITIES} />
        </div>
      </div>
    </>
  );
}
