"use client";

import { FuelIcon, WrenchIcon, HomeIcon, PersonIcon, TruckIcon, TrashIcon, PlusIcon } from "@/components/icons";
import type { ExpenseEntry, ExpenseCategory } from "../ExpensesDesktop";
import styles from "./ExpensesMobile.module.css";

interface ExpensesMobileProps {
  data: ExpenseEntry[];
  date: string;
  total: string;
}

// Category icon circles — colors match mobile design
const CAT_STYLE: Record<ExpenseCategory, { Icon: React.ComponentType<{ size?: number }>; bg: string; color: string }> = {
  Fuel:             { Icon: FuelIcon,    bg: "#dbeafe", color: "#1e40af" },
  Maintenance:      { Icon: WrenchIcon,  bg: "#fee2e2", color: "#991b1b" },
  Rent:             { Icon: HomeIcon,    bg: "#fed7aa", color: "#9a3412" },
  "Worker Advance": { Icon: PersonIcon,  bg: "#fce7f3", color: "#9d174d" },
  Transport:        { Icon: TruckIcon,   bg: "#ccfbf1", color: "#0f766e" },
  Other:            { Icon: FuelIcon,    bg: "#f3f4f6", color: "#4b5563" },
};

export function ExpensesMobile({ data, date, total }: ExpensesMobileProps) {
  return (
    <div className={styles.root}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Today&#39;s Expenses</h1>
          <p className={styles.date}>{date}</p>
        </div>
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValue}>{total}</span>
        </div>
      </div>

      {/* Expense items */}
      <div className={styles.list}>
        {data.map((row) => {
          const cfg = CAT_STYLE[row.category] ?? CAT_STYLE.Other;
          const { Icon } = cfg;
          return (
            <div key={row.id} className={styles.item}>
              <div
                className={styles.itemIcon}
                style={{ background: cfg.bg, color: cfg.color }}
              >
                <Icon size={18} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemCategory}>{row.category}</span>
                <span className={styles.itemSub}>{row.subcategory}</span>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.itemAmount}>{row.amount}</span>
                <button className={styles.deleteBtn} aria-label="Delete expense">
                  <TrashIcon size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button className={styles.fab} aria-label="Add expense">
        <PlusIcon size={22} />
      </button>
    </div>
  );
}
