"use client";

import { useState } from "react";
import styles from "./VehicleHistoryDesktop.module.css";

// ── Types ──────────────────────────────────────────────────────

type ActionType = "Tyres Received" | "Payment Received" | "Tyres Delivered" | "Old Tyres Received";
type EntryStatus = "Pending" | "Paid" | "Delivered" | null;

interface ActivityEntry {
  id: string;
  date: string;
  action: ActionType;
  details: string;
  amountLabel: string;
  amount: string;
  isPayment: boolean;
  status: EntryStatus;
  worker: string;
}

export interface VehicleData {
  vehicleNumber: string;
  model: string;
  isActive: boolean;
  stats: {
    totalReceived: number;
    totalDelivered: number;
    pendingAtCentre: number;
    totalExpected: string;
    totalPaid: string;
    outstandingBalance: string;
  };
  activityLog: ActivityEntry[];
}

interface Props {
  vehicles: Record<string, VehicleData>;
  defaultVehicle: string;
}

// ── Mock data ──────────────────────────────────────────────────

// Exported so page.tsx can reuse
export const VEHICLE_DB: Record<string, VehicleData> = {
  "KA-19-ME-5544": {
    vehicleNumber: "KA-19-ME-5544",
    model: "Ashok Leyland BOSS 1415",
    isActive: true,
    stats: {
      totalReceived: 42,
      totalDelivered: 38,
      pendingAtCentre: 4,
      totalExpected: "₹1,17,600",
      totalPaid: "₹1,05,000",
      outstandingBalance: "₹12,600",
    },
    activityLog: [
      {
        id: "1",
        date: "Oct 24, 2023",
        action: "Tyres Received",
        details: "Apollo EnduRace RT - 10 pcs",
        amountLabel: "Expected",
        amount: "₹11,200",
        isPayment: false,
        status: "Pending",
        worker: "Ramesh Kumar",
      },
      {
        id: "2",
        date: "Oct 22, 2023",
        action: "Payment Received",
        details: "Via UPI — Ref# 329012",
        amountLabel: "Received",
        amount: "₹5,000",
        isPayment: true,
        status: "Paid",
        worker: "—",
      },
      {
        id: "3",
        date: "Oct 20, 2023",
        action: "Tyres Delivered",
        details: "Apollo EnduRace RT - 6 pcs",
        amountLabel: "",
        amount: "—",
        isPayment: false,
        status: "Delivered",
        worker: "Suresh Pillai",
      },
      {
        id: "4",
        date: "Oct 18, 2023",
        action: "Old Tyres Received",
        details: "For retreading — 4 pcs",
        amountLabel: "",
        amount: "—",
        isPayment: false,
        status: null,
        worker: "Ramesh Kumar",
      },
    ],
  },
  "MH-43-AW-9081": {
    vehicleNumber: "MH-43-AW-9081",
    model: "Tata Prima 4928.S",
    isActive: true,
    stats: {
      totalReceived: 24,
      totalDelivered: 18,
      pendingAtCentre: 6,
      totalExpected: "₹62,400",
      totalPaid: "₹50,000",
      outstandingBalance: "₹12,400",
    },
    activityLog: [
      {
        id: "1",
        date: "Oct 24, 2023",
        action: "Payment Received",
        details: "Via UPI — Ref# 329012",
        amountLabel: "Received",
        amount: "₹8,000",
        isPayment: true,
        status: "Paid",
        worker: "—",
      },
      {
        id: "2",
        date: "Oct 20, 2023",
        action: "Tyres Delivered",
        details: "Apollo EnduRace RT - 4 pcs",
        amountLabel: "",
        amount: "—",
        isPayment: false,
        status: "Pending",
        worker: "Suresh Pillai",
      },
      {
        id: "3",
        date: "Oct 18, 2023",
        action: "Old Tyres Received",
        details: "For retreading — 6 pcs",
        amountLabel: "Expected",
        amount: "₹12,400",
        isPayment: false,
        status: null,
        worker: "Ramesh Kumar",
      },
    ],
  },
};

// ── Stat card ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string | number;
  variant?: "default" | "amber" | "red";
}) {
  return (
    <div className={[styles.statCard, styles[`statCard--${variant}`]].join(" ")}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────

function StatusBadge({ status }: { status: EntryStatus }) {
  if (!status) return <span className={styles.statusNone}>—</span>;
  return (
    <span className={[styles.badge, styles[`badge--${status.toLowerCase()}`]].join(" ")}>
      {status}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────

export function VehicleHistoryDesktop({ vehicles, defaultVehicle }: Props) {
  const [query, setQuery] = useState(defaultVehicle);
  const [searched, setSearched] = useState(defaultVehicle);

  const vehicle = vehicles[searched] ?? null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(query.trim().toUpperCase());
  }

  return (
    <div className={styles.root}>
      {/* Search bar */}
      <form className={styles.searchBar} onSubmit={handleSearch}>
        <div className={styles.searchInputWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter vehicle number (e.g. KA-19-ME-5544)"
          />
        </div>
        <button type="submit" className={styles.searchBtn}>Search</button>
      </form>

      {!vehicle ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c8cdd5" strokeWidth="1.5" aria-hidden="true">
            <path d="M1 3h15l3 4.5V17H1V3z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="14.5" cy="17.5" r="2.5" />
          </svg>
          <p className={styles.emptyTitle}>No vehicle found</p>
          <p className={styles.emptyText}>Enter a valid vehicle number and press Search to view its history.</p>
        </div>
      ) : (
        <>
          {/* Page header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Vehicle History: {vehicle.vehicleNumber}</h1>
              <p className={styles.pageSubtitle}>
                Detailed chronological record and financial summary for specific vehicles.
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className={styles.statsGrid}>
            <StatCard label="TOTAL TYRES RECEIVED"  value={vehicle.stats.totalReceived} />
            <StatCard label="TOTAL TYRES DELIVERED" value={vehicle.stats.totalDelivered} />
            <StatCard label="PENDING AT CENTRE"     value={vehicle.stats.pendingAtCentre} variant="amber" />
            <StatCard label="TOTAL EXPECTED"        value={vehicle.stats.totalExpected} />
            <StatCard label="TOTAL PAID"            value={vehicle.stats.totalPaid} />
            <StatCard label="OUTSTANDING BALANCE"   value={vehicle.stats.outstandingBalance} variant="red" />
          </div>

          {/* Activity log */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Activity Log</h2>
              <button className={styles.filterBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
                </svg>
                Filter
              </button>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>ACTION</th>
                    <th>DETAILS</th>
                    <th>AMOUNT / PAYMENT</th>
                    <th>STATUS</th>
                    <th>WORKER</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicle.activityLog.map((entry) => (
                    <tr key={entry.id}>
                      <td className={styles.colDate}>{entry.date}</td>
                      <td>
                        <span className={styles.actionChip} data-action={entry.action.toLowerCase().replace(/ /g, "-")}>
                          {entry.action}
                        </span>
                      </td>
                      <td className={styles.colDetails}>{entry.details}</td>
                      <td>
                        {entry.amount === "—" ? (
                          <span className={styles.dash}>—</span>
                        ) : (
                          <span className={entry.isPayment ? styles.amountPayment : styles.amountExpected}>
                            {entry.amountLabel && <span className={styles.amountLabel}>{entry.amountLabel}: </span>}
                            {entry.amount}
                          </span>
                        )}
                      </td>
                      <td><StatusBadge status={entry.status} /></td>
                      <td className={styles.colWorker}>{entry.worker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>
              Showing {vehicle.activityLog.length} of {vehicle.activityLog.length} entries
            </div>
          </div>
        </>
      )}
    </div>
  );
}
