"use client";

import { useState, useEffect } from "react";
import { PlusIcon } from "@/components/icons";
import {
  fetchReport, periodLabel, fmtAmt,
  type ReportApiData, type ReportPeriod,
} from "@/actions/reports";
import styles from "./ReportsMobile.module.css";

// ── Constants ──────────────────────────────────────────────────

const TABS: { id: ReportPeriod; label: string }[] = [
  { id: "daily",   label: "Daily"   },
  { id: "weekly",  label: "Weekly"  },
  { id: "monthly", label: "Monthly" },
];

// ── Skeleton ───────────────────────────────────────────────────

function Skel({ h = 20, w = "80%" }: { h?: number; w?: string }) {
  return (
    <span className={styles.skeleton} style={{ height: h, width: w, display: "block", borderRadius: 6 }} />
  );
}

// ── Stat tile ──────────────────────────────────────────────────

function StatTile({
  label, value, sub, loading, danger,
}: { label: string; value: string; sub?: string; loading: boolean; danger?: boolean }) {
  return (
    <div className={[styles.statTile, danger ? styles.statTileDanger : ""].join(" ")}>
      <span className={styles.statTileLabel}>{label}</span>
      {loading ? <Skel h={28} w="70%" /> : (
        <span className={[styles.statTileValue, danger ? styles.statTileValueDanger : ""].join(" ")}>{value}</span>
      )}
      {sub && !loading && <span className={styles.statTileSub}>{sub}</span>}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────

export function ReportsMobile() {
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

  function switchTab(t: ReportPeriod) { setTab(t); setOffset(0); }

  const label = periodLabel(tab, offset);
  const netPositive = (data?.netMoney ?? 0) >= 0;

  return (
    <div className={styles.root}>
      {/* Tab bar */}
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
      </div>

      {/* Period navigator */}
      <div className={styles.periodNav}>
        <button className={styles.periodArrow} onClick={() => setOffset((o) => o + 1)}>‹</button>
        <span className={styles.periodLabel}>{label}</span>
        <button
          className={styles.periodArrow}
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
        >
          ›
        </button>
      </div>

      {/* Net position hero */}
      <div className={[styles.heroBanner, netPositive ? styles.heroBannerGreen : styles.heroBannerRed].join(" ")}>
        <div className={styles.heroLeft}>
          <div className={styles.heroLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Net Position
          </div>
          {loading ? <Skel h={36} w="120px" /> : (
            <span className={styles.heroValue}>{fmtAmt(data?.netMoney ?? 0)}</span>
          )}
        </div>
        <div className={styles.heroRight}>
          {!loading && (
            <span className={styles.heroTrend}>
              {netPositive ? "↗ Positive" : "↘ Negative"}
            </span>
          )}
        </div>
      </div>

      {/* Tyres section */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>INVENTORY OVERVIEW</p>
        <div className={styles.tileGrid}>
          <StatTile label="Received"       value={String(data?.tyres.received ?? 0)}            sub="tyres" loading={loading} />
          <StatTile label="Delivered"      value={String(data?.tyres.delivered ?? 0)}            sub="tyres" loading={loading} />
          <StatTile label="Pending"        value={String(data?.tyres.notDelivered ?? 0)}         sub="in yard" loading={loading} />
          <StatTile label="Delivered Unpaid" value={String(data?.tyres.deliveredButUnpaid ?? 0)} sub="needs follow-up" loading={loading} danger />
        </div>
      </div>

      {/* Revenue section */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>FINANCIALS</p>
        <div className={styles.finList}>
          <div className={styles.finRow}>
            <span className={styles.finRowLabel}>Gross Revenue (Received)</span>
            {loading ? <Skel h={18} w="80px" /> : (
              <span className={styles.finRowValue}>{fmtAmt(data?.grossRevenue.received ?? 0)}</span>
            )}
          </div>
          <div className={styles.finRow}>
            <span className={styles.finRowLabel}>Expected Total</span>
            {loading ? <Skel h={18} w="80px" /> : (
              <span className={styles.finRowValue}>{fmtAmt(data?.grossRevenue.expected ?? 0)}</span>
            )}
          </div>
          <div className={styles.finRow}>
            <span className={styles.finRowLabel}>Outstanding</span>
            {loading ? <Skel h={18} w="80px" /> : (
              <span className={[styles.finRowValue, styles.finRowValueAmber].join(" ")}>
                {fmtAmt(data?.grossRevenue.outstanding ?? 0)}
              </span>
            )}
          </div>
          <div className={[styles.finRow, styles.finRowDivider].join(" ")}>
            <span className={styles.finRowLabel}>Total Expenses</span>
            {loading ? <Skel h={18} w="80px" /> : (
              <span className={[styles.finRowValue, styles.finRowValueRed].join(" ")}>
                {fmtAmt(data?.expense ?? 0)}
              </span>
            )}
          </div>
          <div className={[styles.finRow, styles.finRowBold].join(" ")}>
            <span className={styles.finRowLabel}>Net Position</span>
            {loading ? <Skel h={18} w="80px" /> : (
              <span className={[styles.finRowValue, netPositive ? styles.finRowValueGreen : styles.finRowValueRed].join(" ")}>
                {fmtAmt(data?.netMoney ?? 0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error state */}
      {!loading && data === null && (
        <div className={styles.errorBanner}>
          Failed to load report. Check that the backend is running.
        </div>
      )}

      {/* FAB */}
      <button className={styles.fab} aria-label="Export">
        <PlusIcon size={22} />
      </button>
    </div>
  );
}
