"use client";

import { useState } from "react";
import { CarIcon, PlusIcon } from "@/components/icons";
import type { PaymentEntry } from "../PaymentsDesktop";
import styles from "./PaymentsMobile.module.css";

interface MobileStat {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

interface PaymentsMobileProps {
  data: PaymentEntry[];
  stats: MobileStat[];
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function StatusBadge({ status }: { status: PaymentEntry["status"] }) {
  const cls =
    status === "Full Payment" ? styles.badgeFull
    : status === "Partial Payment" ? styles.badgePartial
    : styles.badgePending;
  const label =
    status === "Full Payment" ? "Full"
    : status === "Partial Payment" ? "Partial"
    : "Pending";
  return <span className={[styles.badge, cls].join(" ")}>{label}</span>;
}

export function PaymentsMobile({ data, stats }: PaymentsMobileProps) {
  const [search, setSearch] = useState("");

  const filtered = data.filter(
    (r) =>
      r.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.transactionId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.root}>
      {/* Search */}
      <label className={styles.searchBar}>
        <SearchIcon />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search vehicle number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={[styles.statTrend, s.trendUp ? styles.trendUp : styles.trendDown].join(" ")}>
              {s.trendUp ? "↗" : "↘"} {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Recent payments */}
      <p className={styles.sectionLabel}>RECENT PAYMENTS</p>

      <div className={styles.list}>
        {filtered.map((row) => (
          <div key={row.id} className={styles.card}>
            <div className={styles.cardLeft}>
              <div className={styles.vehicleIcon}>
                <CarIcon size={20} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.vehicleNo}>{row.vehicleNumber}</span>
                <span className={styles.cardMeta}>{row.tyreSize} · {row.date}</span>
              </div>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.amount}>{row.amountReceived}</span>
              <StatusBadge status={row.status} />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className={styles.empty}>No payments match your search.</p>
        )}
      </div>

      {/* FAB */}
      <button className={styles.fab} aria-label="Record new payment">
        <PlusIcon size={22} />
      </button>
    </div>
  );
}
