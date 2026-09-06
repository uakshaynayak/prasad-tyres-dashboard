"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon, TyresIcon, VehicleHistoryIcon, PaymentsIcon,
  ExpensesIcon, ReportsIcon, TyreMasterIcon, WorkerActivityIcon, SettingsIcon,
} from "@/components/icons";
import styles from "./Sidebar.module.css";

const navItems = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/tyres", label: "Tyres", icon: TyresIcon },
  { href: "/vehicle-history", label: "Vehicle History", icon: VehicleHistoryIcon },
  { href: "/payments", label: "Payments", icon: PaymentsIcon },
  { href: "/expenses", label: "Expenses", icon: ExpensesIcon },
  { href: "/reports", label: "Reports", icon: ReportsIcon },
  // { href: "/tyre-master", label: "Tyre Master", icon: TyreMasterIcon },
  // { href: "/worker-activity", label: "Worker Activity", icon: WorkerActivityIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <DashboardIcon size={18} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Prasad Tyres</span>
          <span className={styles.brandSub}>Admin Console</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[styles.navItem, active ? styles.active : ""].join(" ")}
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.bottom}>
        <Link
          href="/settings"
          className={[styles.navItem, pathname === "/settings" ? styles.active : ""].join(" ")}
        >
          <span className={styles.navIcon}><SettingsIcon size={18} /></span>
          <span className={styles.navLabel}>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
