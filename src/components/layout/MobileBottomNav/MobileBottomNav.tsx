"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, TyresIcon, PaymentsIcon, ExpensesIcon, MoreIcon } from "@/components/icons";
import styles from "./MobileBottomNav.module.css";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/tyres", label: "Tyres", icon: TyresIcon },
  { href: "/payments", label: "Payments", icon: PaymentsIcon },
  { href: "/expenses", label: "Expenses", icon: ExpensesIcon },
  { href: "/more", label: "More", icon: MoreIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={[styles.item, active ? styles.active : ""].join(" ")}
          >
            <span className={styles.icon}><Icon size={22} /></span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
