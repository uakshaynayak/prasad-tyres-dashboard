"use client";

import { useState, useEffect } from "react";
import { TyreCard } from "../TyreCard";
import { AddEntryModal } from "../AddEntryModal";
import { TyreDetailDrawer } from "../TyreDetailDrawer";
import { TyresIcon, PaymentsIcon, CalendarIcon, PlusIcon } from "@/components/icons";
import type { TyreEntry } from "../TyresTable";
import styles from "./TyresMobile.module.css";

// ── Helpers (same mapping as TyresTable) ──────────────────────

const API  = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const LIMIT = 10;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtAmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

interface ApiTyre {
  _id: string; date: string; vehicleNo: string; tyreSize: string;
  tyreNo: string; tyreMake: string; rate: number; qty: number; total: number;
  deliveryStatus: string; paymentStatus: string;
}

function toEntry(t: ApiTyre): TyreEntry {
  const status = t.deliveryStatus === "Delivered" ? "Delivered" : "Pending";
  const payment = t.paymentStatus === "Paid" ? "Paid"
    : t.paymentStatus === "Partially Paid" ? "Partial" : "Unpaid";
  return {
    id: t._id, date: fmtDate(t.date), vehicleNo: t.vehicleNo,
    tyreSize: t.tyreSize, qty: t.qty, expectedAmt: fmtAmt(t.total),
    status, payment,
  };
}

function mapPaymentToApi(p: string) {
  if (p === "Unpaid")  return "Pending";
  if (p === "Partial") return "Partially Paid";
  return p;
}

function buildUrl(page: number, status: string, payment: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status)  params.set("deliveryStatus", status);
  if (payment) params.set("paymentStatus", mapPaymentToApi(payment));
  return `${API}/api/tyres?${params}`;
}

// ── Types ──────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

type ChipStatus  = "" | "Pending" | "Delivered";
type ChipPayment = "" | "Unpaid" | "Partial" | "Paid";

// ── Component ──────────────────────────────────────────────────

export function TyresMobile() {
  const [page,         setPage]         = useState(1);
  const [vehicleQuery, setVehicleQuery] = useState("");
  const [statusChip,   setStatusChip]   = useState<ChipStatus>("");
  const [paymentChip,  setPaymentChip]  = useState<ChipPayment>("");
  const [entries,      setEntries]      = useState<TyreEntry[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(buildUrl(page, statusChip, paymentChip))
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setEntries((json.data as ApiTyre[]).map(toEntry));
          setTotalPages(json.pagination.totalPages);
          setTotal(json.pagination.total);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, statusChip, paymentChip]);

  function toggleStatus(val: ChipStatus) {
    setStatusChip((prev) => (prev === val ? "" : val));
    setPage(1);
  }
  function togglePayment(val: ChipPayment) {
    setPaymentChip((prev) => (prev === val ? "" : val));
    setPage(1);
  }

  const visible = vehicleQuery
    ? entries.filter((r) => r.vehicleNo.toLowerCase().includes(vehicleQuery.toLowerCase()))
    : entries;

  const pendingQty = entries.filter((r) => r.status === "Pending").reduce((s, r) => s + r.qty, 0);
  const unpaidAmt  = entries
    .filter((r) => r.payment === "Unpaid")
    .reduce((s, r) => s + parseInt(r.expectedAmt.replace(/[^\d]/g, ""), 10), 0);

  return (
    <div className={styles.root}>
      {/* Stat cards */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>PENDING TYRES</span>
          <div className={styles.statBottom}>
            <span className={[styles.statValue, styles.statBlue].join(" ")}>
              {loading ? "—" : pendingQty}
            </span>
            <TyresIcon size={32} />
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>UNPAID (THIS PAGE)</span>
          <div className={styles.statBottom}>
            <span className={[styles.statValue, styles.statRed].join(" ")}>
              {loading ? "—" : fmtAmt(unpaidAmt)}
            </span>
            <PaymentsIcon size={32} />
          </div>
        </div>
      </div>

      {/* Search */}
      <label className={styles.searchBar}>
        <SearchIcon />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search Vehicle Number"
          value={vehicleQuery}
          onChange={(e) => setVehicleQuery(e.target.value)}
        />
      </label>

      {/* Filter chips */}
      <div className={styles.chips}>
        <button className={styles.chip}>
          <CalendarIcon size={13} />
          Date
        </button>

        {(["Pending", "Delivered"] as ChipStatus[]).map((s) => (
          <button
            key={s}
            className={[styles.chip, statusChip === s ? styles.chipActive : ""].join(" ")}
            onClick={() => toggleStatus(s)}
          >
            {s}
            {statusChip === s && <span className={styles.chipX}>&times;</span>}
          </button>
        ))}

        {(["Unpaid", "Partial", "Paid"] as ChipPayment[]).map((p) => (
          <button
            key={p}
            className={[styles.chip, paymentChip === p ? styles.chipActive : ""].join(" ")}
            onClick={() => togglePayment(p)}
          >
            {p}
            {paymentChip === p && <span className={styles.chipX}>&times;</span>}
          </button>
        ))}
      </div>

      {/* Card list */}
      <div className={styles.list}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))
          : visible.length === 0
            ? <p className={styles.empty}>No records match your filters.</p>
            : visible.map((row) => (
              <TyreCard
                key={row.id}
                vehicleNo={row.vehicleNo}
                tyreSize={row.tyreSize}
                qty={row.qty}
                expectedAmt={row.expectedAmt}
                date={row.date}
                status={row.status}
                payment={row.payment}
                partialAmount={row.partialAmount}
                onClick={() => setSelectedId(row.id)}
              />
            ))
        }
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className={styles.pageRow}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages} · {total} records</span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* FAB */}
      <button className={styles.fab} aria-label="Add new tyre entry" onClick={() => setModalOpen(true)}>
        <PlusIcon size={22} />
      </button>

      <AddEntryModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <TyreDetailDrawer tyreId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
