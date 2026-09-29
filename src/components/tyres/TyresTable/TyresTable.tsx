"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "../FilterBar";
import { AddEntryModal } from "../AddEntryModal";
import { TyreDetailDrawer } from "../TyreDetailDrawer";
import { TyreStatusBadge, PaymentBadge, type TyreStatus, type PaymentStatus } from "@/components/shared/StatusBadge";
import { Pagination } from "@/components/shared/Pagination";
import styles from "./TyresTable.module.css";

// ── Types ────────────────────────────────────────────────────────

export interface TyreEntry {
  id: string;
  date: string;
  vehicleNo: string;
  tyreSize: string;
  qty: number;
  expectedAmt: string;
  status: TyreStatus;
  payment: PaymentStatus;
  partialAmount?: string;
}

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
}

interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Helpers ──────────────────────────────────────────────────────

const API  = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const LIMIT = 10;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtAmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
function mapStatus(s: string): TyreStatus {
  return s === "Delivered" ? "Delivered" : "Pending";
}
function mapPayment(s: string): PaymentStatus {
  if (s === "Paid")            return "Paid";
  if (s === "Partially Paid")  return "Partial";
  return "Unpaid";
}
function toEntry(t: ApiTyre): TyreEntry {
  return {
    id:          t._id,
    date:        fmtDate(t.date),
    vehicleNo:   t.vehicleNo,
    tyreSize:    t.tyreSize,
    qty:         t.qty,
    expectedAmt: fmtAmt(t.total),
    status:      mapStatus(t.deliveryStatus),
    payment:     mapPayment(t.paymentStatus),
  };
}

function mapPaymentToApi(p: string): string {
  if (p === "Unpaid")  return "Pending";
  if (p === "Partial") return "Partially Paid";
  return p;
}

function buildUrl(page: number, status: string, payment: string, search: string, tyreSize: string): string {
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status)  params.set("deliveryStatus", status);
  if (payment) params.set("paymentStatus",  mapPaymentToApi(payment));
  if (search.trim()) params.set("search", search.trim());
  if (tyreSize.trim()) params.set("tyreSize", tyreSize.trim());
  return `${API}/api/tyres?${params}`;
}

// ── Skeleton row ─────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className={styles.tr}>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className={styles.td}>
          <span className={styles.skeleton} style={{ width: i === 1 ? "80px" : i === 4 ? "70px" : "60px", height: "14px", display: "block" }} />
        </td>
      ))}
    </tr>
  );
}

// ── Component ────────────────────────────────────────────────────

export function TyresTable() {
  const [page,          setPage]          = useState(1);
  const [dateRange,     setDateRange]     = useState("30");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [vehicleQuery,  setVehicleQuery]  = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("search") ?? "";
  });
  const [tyreSizeQuery, setTyreSizeQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("tyreSize") ?? "";
  });
  const [entries,       setEntries]       = useState<TyreEntry[]>([]);
  const [pagination,    setPagination]    = useState<ApiPagination>({ page: 1, limit: LIMIT, total: 0, totalPages: 1 });
  const [loading,       setLoading]       = useState(true);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);

  useEffect(() => {
    const search = vehicleQuery.trim();
    const tyreSize = tyreSizeQuery.trim();
    const url = new URL(window.location.href);
    if (search) url.searchParams.set("search", search);
    else url.searchParams.delete("search");
    if (tyreSize) url.searchParams.set("tyreSize", tyreSize);
    else url.searchParams.delete("tyreSize");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [vehicleQuery, tyreSizeQuery]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(buildUrl(page, statusFilter, paymentFilter, vehicleQuery, tyreSizeQuery))
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setEntries((json.data as ApiTyre[]).map(toEntry));
          setPagination(json.pagination);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, statusFilter, paymentFilter, vehicleQuery, tyreSizeQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleFilterChange<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setPage(1); };
  }

  function handleVehicleChange(nextValue: string) {
    setVehicleQuery(nextValue);
    setPage(1);
  }

  function handleTyreSizeChange(nextValue: string) {
    setTyreSizeQuery(nextValue);
    setPage(1);
  }

  const vehicleTerm = vehicleQuery.trim().toLowerCase();
  const tyreSizeTerm = tyreSizeQuery.trim().toLowerCase();
  const visible = entries.filter((r) => {
    const matchesVehicle = !vehicleTerm || r.vehicleNo.toLowerCase().includes(vehicleTerm);
    const matchesTyreSize = !tyreSizeTerm || r.tyreSize.toLowerCase().includes(tyreSizeTerm);
    return matchesVehicle && matchesTyreSize;
  });

  const pendingCount = entries.filter((r) => r.status === "Pending").length;

  return (
    <>
      {/* Page header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tyres Management</h1>
          <p className={styles.subtitle}>Track and manage all tyre records</p>
        </div>
        <div className={styles.statCards}>
          <div className={styles.statCard}>
            {loading
              ? <span className={[styles.skeleton, styles.skeletonStat].join(" ")} />
              : <span className={styles.statValue}>{pagination.total}</span>
            }
            <span className={styles.statLabel}>Total Records</span>
          </div>
          <div className={[styles.statCard, pendingCount > 0 ? styles.statCardWarn : ""].join(" ")}>
            {loading
              ? <span className={[styles.skeleton, styles.skeletonStat].join(" ")} />
              : <span className={styles.statValue}>{pendingCount}</span>
            }
            <span className={styles.statLabel}>Pending (this page)</span>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className={styles.card}>
        <FilterBar
          dateRange={dateRange}
          statusFilter={statusFilter}
          paymentFilter={paymentFilter}
          vehicleQuery={vehicleQuery}
          tyreSizeQuery={tyreSizeQuery}
          onDateRange={handleFilterChange(setDateRange)}
          onStatus={handleFilterChange(setStatusFilter)}
          onPayment={handleFilterChange(setPaymentFilter)}
          onVehicle={handleVehicleChange}
          onTyreSize={handleTyreSizeChange}
          onNew={() => setModalOpen(true)}
        />

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Vehicle No.</th>
                <th className={styles.th}>Tyre Size</th>
                <th className={styles.th}>Qty</th>
                <th className={styles.th}>Expected Amt</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} />)
                : visible.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className={styles.empty}>No records found.</td>
                    </tr>
                  )
                  : visible.map((row) => (
                    <tr
                      key={row.id}
                      className={styles.tr}
                      onClick={() => setSelectedId(row.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className={styles.td}>{row.date}</td>
                      <td className={styles.td}>
                        <button className={styles.vehicleLink} onClick={(e) => e.stopPropagation()}>{row.vehicleNo}</button>
                      </td>
                      <td className={styles.td}>{row.tyreSize}</td>
                      <td className={styles.td}>{row.qty}</td>
                      <td className={styles.td}>{row.expectedAmt}</td>
                      <td className={styles.td}><TyreStatusBadge status={row.status} /></td>
                      <td className={styles.td}><PaymentBadge status={row.payment} partialAmount={row.partialAmount} /></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={Math.max(1, pagination.totalPages)}
          totalEntries={pagination.total}
          pageSize={LIMIT}
          onPageChange={setPage}
        />
      </div>

      <AddEntryModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <TyreDetailDrawer tyreId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}
