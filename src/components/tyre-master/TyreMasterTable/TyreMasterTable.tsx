"use client";

import { useState } from "react";
import { EditIcon, PowerIcon, TruckIcon, BusIcon } from "@/components/icons";
import { AddSpecDrawer } from "../AddSpecDrawer";
import styles from "./TyreMasterTable.module.css";

// ── Types ────────────────────────────────────────────────────────

export type VehicleType = "truck" | "bus" | "lcv" | "tractor";

export interface TyreMasterEntry {
  id: string;
  tyreSize: string;
  category: string;
  vehicleType: VehicleType;
  defaultPrice: string;
  isActive: boolean;
}

interface TyreMasterTableProps {
  data: TyreMasterEntry[];
}

// ── Category icon ────────────────────────────────────────────────

function CategoryIcon({ type }: { type: VehicleType }) {
  if (type === "bus") return <BusIcon size={15} />;
  return <TruckIcon size={15} />;
}

// ── Status badge ─────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={[styles.badge, active ? styles.badgeActive : styles.badgeInactive].join(" ")}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────

export function TyreMasterTable({ data }: TyreMasterTableProps) {
  const [rows, setRows] = useState(data);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toggleActive(id: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h1 className={styles.title}>Tyre Master List</h1>
          <p className={styles.subtitle}>Manage accepted tyre sizes, categories, and baseline pricing.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setDrawerOpen(true)}>
          + Add New Tyre
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Tyre Size</th>
              <th className={styles.th}>Category</th>
              <th className={[styles.th, styles.thRight].join(" ")}>Default Price</th>
              <th className={styles.th}>Status</th>
              <th className={[styles.th, styles.thCenter].join(" ")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={styles.tr}>
                <td className={[styles.td, styles.tdSize].join(" ")}>{row.tyreSize}</td>
                <td className={styles.td}>
                  <span className={styles.category}>
                    <CategoryIcon type={row.vehicleType} />
                    {row.category}
                  </span>
                </td>
                <td className={[styles.td, styles.tdRight].join(" ")}>
                  <span className={styles.price}>{row.defaultPrice}</span>
                </td>
                <td className={styles.td}>
                  <StatusBadge active={row.isActive} />
                </td>
                <td className={[styles.td, styles.tdCenter].join(" ")}>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      className={[styles.actionBtn, !row.isActive ? styles.actionBtnDim : ""].join(" ")}
                      aria-label={row.isActive ? "Deactivate" : "Activate"}
                      title={row.isActive ? "Deactivate" : "Activate"}
                      onClick={() => toggleActive(row.id)}
                    >
                      <PowerIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddSpecDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
