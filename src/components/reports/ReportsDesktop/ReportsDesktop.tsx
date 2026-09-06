"use client";

import { useState, useEffect } from "react";
import { ExportIcon, TruckIcon } from "@/components/icons";
import {
  fetchReport, periodLabel, fmtAmt,
  type ReportApiData, type ReportPeriod,
} from "@/actions/reports";
import styles from "./ReportsDesktop.module.css";

// ── Inline icons ───────────────────────────────────────────────

function DownArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
    </svg>
  );
}

function ReceiptIconSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2l-3 2-2-2-2 2-2-2-2 2-3-2z" />
      <line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" />
    </svg>
  );
}

function WrenchIconSm() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ColumnChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

// ── Skeleton ───────────────────────────────────────────────────

function Skeleton({ h = 32, w = "100%" }: { h?: number; w?: string }) {
  return (
    <span
      className={styles.skeleton}
      style={{ height: h, width: w, display: "block", borderRadius: 6 }}
    />
  );
}

// ── Constants ──────────────────────────────────────────────────

const TABS: { id: ReportPeriod; label: string }[] = [
  { id: "daily",   label: "Daily"   },
  { id: "weekly",  label: "Weekly"  },
  { id: "monthly", label: "Monthly" },
];

// ── Component ──────────────────────────────────────────────────

export function ReportsDesktop() {
  const [tab,     setTab]    = useState<ReportPeriod>("monthly");
  const [offset,  setOffset] = useState(0);
  const [data,    setData]   = useState<ReportApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchReport(tab, offset).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [tab, offset]);

  // Reset offset when tab changes
  function switchTab(t: ReportPeriod) {
    setTab(t);
    setOffset(0);
  }

  const label = periodLabel(tab, offset);

  return (
    <div className={styles.root}>
      {/* Header row */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Performance Reports</h1>
          <p className={styles.subtitle}>Comprehensive analysis of inventory and financial health.</p>
        </div>
        <div className={styles.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={[styles.tab, tab === t.id ? styles.tabActive : ""].join(" ")}
              onClick={() => switchTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          <button className={[styles.tab, styles.tabCustom].join(" ")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Custom Range
          </button>
        </div>
      </div>

      {/* Period navigator */}
      <div className={styles.periodBar}>
        <div className={styles.periodLeft}>
          <button className={styles.arrowBtn} onClick={() => setOffset((o) => o + 1)}>&#8249;</button>
          <div>
            <span className={styles.periodSub}>VIEWING REPORT FOR</span>
            <span className={styles.periodLabel}>{label}</span>
          </div>
          <button
            className={styles.arrowBtn}
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
          >
            &#8250;
          </button>
        </div>
        <button className={styles.exportBtn}>
          <ExportIcon size={15} />
          Export PDF
        </button>
      </div>

      {/* Inventory cards */}
      <div className={styles.inventoryRow}>
        <div className={styles.invCard}>
          <div className={styles.invCardTop}>
            <span className={styles.invLabel}>Tyres Received</span>
            <div className={styles.invIcon} style={{ background: "#dbeafe", color: "#1e40af" }}>
              <DownArrowIcon />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <span className={styles.invValue}>{data?.tyres.received ?? 0}</span>
          )}
        </div>

        <div className={styles.invCard}>
          <div className={styles.invCardTop}>
            <span className={styles.invLabel}>Tyres Delivered</span>
            <div className={styles.invIcon} style={{ background: "#dbeafe", color: "#1e40af" }}>
              <TruckIcon size={16} />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <span className={styles.invValue}>{data?.tyres.delivered ?? 0}</span>
          )}
        </div>

        <div className={styles.invCard}>
          <div className={styles.invCardTop}>
            <span className={styles.invLabel}>Pending Delivery</span>
            <div className={styles.invIcon} style={{ background: "#fef9c3", color: "#854d0e" }}>
              <HourglassIcon />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <>
              <span className={styles.invValue}>{data?.tyres.notDelivered ?? 0}</span>
              <span className={styles.invNote}>Currently in yard</span>
            </>
          )}
        </div>

        <div className={[styles.invCard, styles.invCardRed].join(" ")}>
          <div className={styles.invCardTop}>
            <span className={[styles.invLabel, styles.invLabelRed].join(" ")}>Delivered &amp; Unpaid</span>
            <div className={styles.invIcon} style={{ background: "#fee2e2", color: "#991b1b" }}>
              <WarningIcon />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <>
              <span className={[styles.invValue, styles.invValueRed].join(" ")}>{data?.tyres.deliveredButUnpaid ?? 0}</span>
              <span className={styles.invAlert}>Requires immediate follow-up</span>
            </>
          )}
        </div>
      </div>

      {/* Financial cards */}
      <div className={styles.financialRow}>
        <div className={styles.finCard}>
          <div className={styles.finCardTop}>
            <span className={styles.finLabel}>Gross Revenue (Received)</span>
            <div className={styles.invIcon} style={{ background: "#f3f4f6", color: "#6b7280" }}>
              <ReceiptIconSm />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <span className={styles.finValue}>{fmtAmt(data?.grossRevenue.received ?? 0)}</span>
          )}
          <div className={styles.finFooter}>
            <div className={styles.finFooterItem}>
              <span className={styles.finFooterLabel}>Expected Total</span>
              {loading ? <Skeleton h={18} w="80px" /> : (
                <span className={styles.finFooterValue}>{fmtAmt(data?.grossRevenue.expected ?? 0)}</span>
              )}
            </div>
            <div className={[styles.finFooterItem, styles.finFooterDivider].join(" ")}>
              <span className={styles.finFooterLabel}>Outstanding</span>
              {loading ? <Skeleton h={18} w="80px" /> : (
                <span className={[styles.finFooterValue, styles.finOutstanding].join(" ")}>
                  {fmtAmt(data?.grossRevenue.outstanding ?? 0)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.finCard}>
          <div className={styles.finCardTop}>
            <span className={styles.finLabel}>
              {tab === "daily" ? "Daily" : tab === "weekly" ? "Weekly" : "Monthly"} Expenses
            </span>
            <div className={styles.invIcon} style={{ background: "#f3f4f6", color: "#6b7280" }}>
              <WrenchIconSm />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <span className={styles.finValue}>{fmtAmt(data?.expense ?? 0)}</span>
          )}
        </div>

        <div className={[styles.finCard, styles.finCardNavy].join(" ")}>
          <div className={styles.finCardTop}>
            <span className={styles.finLabelLight}>
              Net {tab === "daily" ? "Daily" : tab === "weekly" ? "Weekly" : "Monthly"} Position
            </span>
            <div className={styles.invIcon} style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
              <ColumnChartIcon />
            </div>
          </div>
          {loading ? <Skeleton h={36} /> : (
            <span className={[styles.finValueLight, (data?.netMoney ?? 0) < 0 ? styles.finValueNegative : ""].join(" ")}>
              {fmtAmt(data?.netMoney ?? 0)}
            </span>
          )}
          <span className={styles.finSubLight}>Received minus Expenses</span>
        </div>
      </div>

      {/* Error state */}
      {!loading && data === null && (
        <div className={styles.errorBanner}>
          Failed to load report data. Check that the backend is running.
        </div>
      )}
    </div>
  );
}
