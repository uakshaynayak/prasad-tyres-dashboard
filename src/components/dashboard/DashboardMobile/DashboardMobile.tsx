"use client";

import { useState, useEffect } from "react";
import { MobileQuickActions } from "@/components/dashboard/MobileQuickActions";
import { MobileTodaySummary } from "@/components/dashboard/MobileTodaySummary";
import { TyresIcon, DeliverIcon, PaymentsIcon, ExpensesIcon } from "@/components/icons";
import {
  fetchReport, periodLabel, fmtAmt,
  type ReportApiData, type ReportPeriod,
} from "@/actions/reports";
import styles from "./DashboardMobile.module.css";

const TABS: { id: ReportPeriod; label: string }[] = [
  { id: "daily",   label: "Daily"   },
  { id: "weekly",  label: "Weekly"  },
  { id: "monthly", label: "Monthly" },
];

const QUICK_ACTIONS = [
  { label: "Tyres Received", icon: <TyresIcon size={22} />,   bg: "#0F4C81",  href: "/tyres/receive"    },
  { label: "Tyres Delivered", icon: <DeliverIcon size={22} />, bg: "#90c6ec",  href: "/tyres/deliver"   },
  { label: "Payment Received", icon: <PaymentsIcon size={22} />, bg: "#0F4C81", href: "/payments/receive" },
  { label: "Expense", icon: <ExpensesIcon size={22} />,        bg: "#f4a9a8",  href: "/expenses/add"    },
];

function periodSuffix(tab: ReportPeriod): string {
  if (tab === "daily")   return "Today";
  if (tab === "weekly")  return "This Week";
  return "This Month";
}

function buildSummary(data: ReportApiData, tab: ReportPeriod) {
  const suffix = periodSuffix(tab);
  return [
    { label: `Tyres Received — ${suffix}`,  value: String(data.tyres.received) },
    { label: `Tyres Delivered — ${suffix}`, value: String(data.tyres.delivered) },
    { label: "Money Received",              value: fmtAmt(data.grossRevenue.received) },
    { label: "Expenses",                    value: fmtAmt(data.expense), valueColor: "danger" as const },
  ];
}

export function DashboardMobile() {
  const [tab, setTab]       = useState<ReportPeriod>("daily");
  const [offset, setOffset] = useState(0);
  const [data, setData]     = useState<ReportApiData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const summaryItems = data
    ? buildSummary(data, tab)
    : [
        { label: "Tyres Received",  value: "—" },
        { label: "Tyres Delivered", value: "—" },
        { label: "Money Received",  value: "—" },
        { label: "Expenses",        value: "—", valueColor: "danger" as const },
      ];

  const greetingDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <>
      <div className={styles.greeting}>
        <h2 className={styles.greetingTitle}>Good day!</h2>
        <p className={styles.greetingSub}>{greetingDate}</p>
      </div>

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

      {!loading && data === null && (
        <div className={styles.errorBanner}>Could not load report data.</div>
      )}

      <MobileQuickActions actions={QUICK_ACTIONS} />
      <MobileTodaySummary items={summaryItems} />
    </>
  );
}
