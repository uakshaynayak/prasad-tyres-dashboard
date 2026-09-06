"use client";

import { useState } from "react";
import { CalendarIcon, FuelIcon, WrenchIcon, HomeIcon, PersonIcon, TruckIcon, ReceiptIcon } from "@/components/icons";
// ReceiptIcon kept for category "Other" fallback
import { AddExpenseDrawer } from "../AddExpenseDrawer";
import styles from "./ExpensesDesktop.module.css";

// ── Types ─────────────────────────────────────────────────────────

export type ExpenseCategory = "Fuel" | "Maintenance" | "Rent" | "Worker Advance" | "Transport" | "Other";

export interface ExpenseEntry {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  subcategory: string;
  amount: string;
  rawAmount: number;
  rawDate: string;
}

interface StatCard {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

interface ExpensesDesktopProps {
  data: ExpenseEntry[];
  stats: StatCard[];
}

// ── Category config ────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { Icon: React.ComponentType<{ size?: number }>; colorClass: string }
> = {
  Fuel:            { Icon: FuelIcon,    colorClass: styles.catFuel       },
  Maintenance:     { Icon: WrenchIcon,  colorClass: styles.catMaintenance },
  Rent:            { Icon: HomeIcon,    colorClass: styles.catRent        },
  "Worker Advance":{ Icon: PersonIcon,  colorClass: styles.catWorker      },
  Transport:       { Icon: TruckIcon,   colorClass: styles.catTransport   },
  Other:           { Icon: ReceiptIcon, colorClass: styles.catOther       },
};

function CategoryBadge({ category }: { category: ExpenseCategory }) {
  const { Icon, colorClass } = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.Other;
  return (
    <span className={[styles.catBadge, colorClass].join(" ")}>
      <Icon size={12} />
      {category}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────

function Stat({ label, value, trend, trendUp }: StatCard) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <div className={styles.statIcon}><CalendarIcon size={18} /></div>
      </div>
      <div className={styles.statBottom}>
        <span className={styles.statValue}>{value}</span>
        {trend && (
          <span className={[styles.trendBadge, trendUp ? styles.trendUp : styles.trendDown].join(" ")}>
            {trendUp ? "↗" : "↘"}{trend}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export function ExpensesDesktop({ data, stats }: ExpensesDesktopProps) {
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.root}>
      {/* Stat cards */}
      <div className={styles.statsRow}>
        {stats.map((s) => <Stat key={s.label} {...s} />)}
      </div>

      {/* Expense logs table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2 className={styles.tableTitle}>Expense Logs</h2>
            <p className={styles.tableSubtitle}>Review and manage operational costs.</p>
          </div>
          <button className={styles.addBtn} onClick={() => setDrawerOpen(true)}>+ Add Expense</button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Description</th>
                <th className={[styles.th, styles.thRight].join(" ")}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  <td className={styles.td}>{row.date}</td>
                  <td className={styles.td}>
                    <CategoryBadge category={row.category} />
                  </td>
                  <td className={styles.td}>{row.description}</td>
                  <td className={[styles.td, styles.tdRight, styles.tdAmount].join(" ")}>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, data.length)} of {data.length} entries
          </span>
          <div className={styles.pageButtons}>
            <button
              className={styles.pageNavBtn}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className={styles.pageNavBtn}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AddExpenseDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
