"use client";

import { useState } from "react";
import { EditIcon, TrashIcon, PlusIcon } from "@/components/icons";
import type { TyreMasterEntry } from "../TyreMasterTable";
import styles from "./TyreMasterMobile.module.css";

interface TyreMasterMobileProps {
  data: TyreMasterEntry[];
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

const CATEGORY_LABEL: Record<string, string> = {
  truck: "TRUCK",
  bus: "BUS",
  lcv: "LCV",
  tractor: "TRACTOR",
};

export function TyreMasterMobile({ data }: TyreMasterMobileProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState(data);

  const filtered = rows.filter((r) =>
    r.tyreSize.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function toggleActive(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }

  return (
    <div className={styles.root}>
      {/* Page header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Tyre Master</h1>
        <p className={styles.subtitle}>Manage standard pricing and categories</p>
      </div>

      {/* Search + filter */}
      <div className={styles.searchRow}>
        <label className={styles.searchBar}>
          <SearchIcon />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search sizes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
        <button className={styles.filterBtn} aria-label="Filter">
          <FilterIcon />
        </button>
      </div>

      {/* Cards */}
      <div className={styles.list}>
        {filtered.map((row) => (
          <div key={row.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.categoryChip}>
                {CATEGORY_LABEL[row.vehicleType] ?? row.vehicleType.toUpperCase()}
              </span>
              <span className={[styles.statusBadge, row.isActive ? styles.statusActive : styles.statusInactive].join(" ")}>
                {row.isActive ? <CheckCircleIcon /> : <BanIcon />}
                {row.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className={styles.tyreSize}>{row.tyreSize}</p>

            <div className={styles.cardBottom}>
              <div className={styles.priceBlock}>
                <span className={styles.priceLabel}>Default Price</span>
                <span className={styles.priceValue}>{row.defaultPrice}</span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.actionBtn}
                  aria-label="Edit"
                  onClick={() => toggleActive(row.id)}
                >
                  <EditIcon size={17} />
                </button>
                {row.isActive && (
                  <button className={styles.actionBtn} aria-label="Delete">
                    <TrashIcon size={17} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className={styles.empty}>No tyres match your search.</p>
        )}
      </div>

      {/* FAB */}
      <button className={styles.fab} aria-label="Add new tyre">
        <PlusIcon size={22} />
      </button>
    </div>
  );
}
