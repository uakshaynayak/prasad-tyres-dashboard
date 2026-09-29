"use client";

import { CalendarIcon, PlusIcon } from "@/components/icons";
import styles from "./FilterBar.module.css";

interface FilterBarProps {
  dateRange: string;
  statusFilter: string;
  paymentFilter: string;
  vehicleQuery: string;
  tyreSizeQuery: string;
  onDateRange: (v: string) => void;
  onStatus: (v: string) => void;
  onPayment: (v: string) => void;
  onVehicle: (v: string) => void;
  onTyreSize: (v: string) => void;
  onNew: () => void;
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function SearchSmIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function FilterBar({
  dateRange, statusFilter, paymentFilter, vehicleQuery, tyreSizeQuery,
  onDateRange, onStatus, onPayment, onVehicle, onTyreSize, onNew,
}: FilterBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        {/* Date range */}
        <label className={styles.selectWrap}>
          <CalendarIcon size={14} />
          <select
            className={styles.select}
            value={dateRange}
            onChange={(e) => onDateRange(e.target.value)}
          >
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown />
        </label>

        {/* Status filter */}
        <label className={styles.selectWrap}>
          <FilterIcon />
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => onStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
          </select>
          <ChevronDown />
        </label>

        {/* Payment filter */}
        <label className={styles.selectWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <select
            className={styles.select}
            value={paymentFilter}
            onChange={(e) => onPayment(e.target.value)}
          >
            <option value="">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partial">Partial</option>
          </select>
          <ChevronDown />
        </label>
      </div>

      <div className={styles.right}>
        {/* Vehicle search */}
        <label className={styles.vehicleSearch}>
          <SearchSmIcon />
          <input
            type="text"
            className={styles.vehicleInput}
            placeholder="Vehicle No..."
            value={vehicleQuery}
            onChange={(e) => onVehicle(e.target.value)}
          />
        </label>

        <label className={styles.vehicleSearch}>
          <SearchSmIcon />
          <input
            type="text"
            className={styles.vehicleInput}
            placeholder="Tyre Size..."
            value={tyreSizeQuery}
            onChange={(e) => onTyreSize(e.target.value)}
          />
        </label>

        {/* New button */}
        <button className={styles.newBtn} onClick={onNew}>
          <PlusIcon size={16} />
          New
        </button>
      </div>
    </div>
  );
}
