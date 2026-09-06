"use client";

import { useState } from "react";
import { CalendarIcon, ExportIcon, TrendUpIcon } from "@/components/icons";
import { RecordPaymentDrawer } from "../RecordPaymentDrawer";
import styles from "./PaymentsDesktop.module.css";

// ── Types ─────────────────────────────────────────────────────────

export type PaymentStatus = "Full Payment" | "Partial Payment" | "Pending";

export interface PaymentEntry {
  id: string;
  date: string;
  transactionId: string;
  vehicleNumber: string;
  tyreSize: string;
  amountReceived: string;
  outstandingBalance: string;
  hasOutstanding: boolean;
  status: PaymentStatus;
  time: string;
  paymentMethod: string;
}

interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

interface PaymentsDesktopProps {
  data: PaymentEntry[];
  stats: StatCard[];
}

// ── Sub-components ────────────────────────────────────────────────

function Stat({ label, value, trend, trendUp }: StatCard) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <div className={styles.statIcon}>
          <CalendarIcon size={20} />
        </div>
        {trend && (
          <span className={[styles.trendBadge, trendUp ? styles.trendUp : styles.trendDown].join(" ")}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cls =
    status === "Full Payment" ? styles.badgeFull
    : status === "Partial Payment" ? styles.badgePartial
    : styles.badgePending;
  const label =
    status === "Full Payment" ? ["Full", "Payment"]
    : status === "Partial Payment" ? ["Partial", "Payment"]
    : ["Pending"];
  return (
    <span className={[styles.badge, cls].join(" ")}>
      {label.map((line, i) => (
        <span key={i} className={styles.badgeLine}>{line}</span>
      ))}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export function PaymentsDesktop({ data, stats }: PaymentsDesktopProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paged = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pages: (number | "...")[] = [];
  if (totalPages <= 4) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...");
  }

  return (
    <div className={styles.root}>
      {/* Page subtitle + CTA */}
      <div className={styles.pageHeader}>
        <p className={styles.subtitle}>Overview and management of incoming payments.</p>
        <button className={styles.recordBtn} onClick={() => setDrawerOpen(true)}>+ Record New Payment</button>
      </div>

      {/* Stat cards */}
      <div className={styles.statsRow}>
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>

      {/* Recent payments table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Payments</h2>
          <div className={styles.tableActions}>
            <button className={styles.actionBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
              </svg>
              Filter
            </button>
            <button className={styles.actionBtn}>
              <ExportIcon size={15} />
              Export
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Transaction ID</th>
                <th className={styles.th}>Vehicle No.</th>
                <th className={styles.th}>Tyre Size</th>
                <th className={[styles.th, styles.thRight].join(" ")}>Amount Received</th>
                <th className={[styles.th, styles.thRight].join(" ")}>Outstanding</th>
                <th className={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  <td className={styles.td}>{row.date}</td>
                  <td className={styles.td}><span className={styles.txnId}>{row.transactionId}</span></td>
                  <td className={[styles.td, styles.tdVehicle].join(" ")}>{row.vehicleNumber}</td>
                  <td className={styles.td}>{row.tyreSize}</td>
                  <td className={[styles.td, styles.tdRight, styles.tdAmount].join(" ")}>{row.amountReceived}</td>
                  <td className={[styles.td, styles.tdRight, row.hasOutstanding ? styles.tdOutstanding : ""].join(" ")}>
                    {row.outstandingBalance}
                  </td>
                  <td className={styles.td}>
                    <PaymentStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, data.length)} of {data.length} entries
          </span>
          <div className={styles.paginationControls}>
            <button
              className={styles.pageNavBtn}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            {pages.map((p, i) =>
              p === "..." ? (
                <span key={`el-${i}`} className={styles.pageEllipsis}>…</span>
              ) : (
                <button
                  key={p}
                  className={[styles.pageBtn, p === currentPage ? styles.pageBtnActive : ""].join(" ")}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className={styles.pageNavBtn}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <RecordPaymentDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
