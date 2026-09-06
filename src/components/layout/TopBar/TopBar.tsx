"use client";

import { usePathname } from "next/navigation";
import { BellIcon, HelpIcon } from "@/components/icons";
import styles from "./TopBar.module.css";

// ── Config ────────────────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/tyres": "Tyres",
  "/vehicle-history": "Vehicle History",
  "/payments": "Payments",
  "/expenses": "Expenses",
  "/reports": "Reports",
  "/tyre-master": "Tyre Master",
  "/worker-activity": "Worker Activity",
  "/settings": "Settings",
};

// Pages where only the search bar is shown
const SEARCH_PAGES: Record<string, string> = {
  "/tyres": "Search Tyres...",
  "/vehicle-history": "Search Vehicles...",
  "/reports": "Search Reports...",
  "/tyre-master": "Search tyre sizes...",
};

// Pages where the title AND search bar are shown side by side
const TITLE_SEARCH_PAGES: Record<string, { title: string; placeholder: string }> = {
  "/payments": { title: "Payments Management", placeholder: "Search payments..." },
  "/expenses": { title: "Expenses Management", placeholder: "Search expenses..." },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────

function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className={styles.searchWrap}>
      <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input type="search" className={styles.searchInput} placeholder={placeholder} />
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const searchPlaceholder = SEARCH_PAGES[pathname];
  const titleSearch = TITLE_SEARCH_PAGES[pathname];

  return (
    <header className={styles.topbar}>
      {titleSearch ? (
        // Title + search + icons (e.g. Payments)
        <>
          <h1 className={styles.title}>{titleSearch.title}</h1>
          <SearchBar placeholder={titleSearch.placeholder} />
          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <BellIcon size={20} />
            </button>
            <button className={styles.iconBtn} aria-label="Help">
              <HelpIcon size={20} />
            </button>
          </div>
        </>
      ) : searchPlaceholder ? (
        // Search only + bell (e.g. Tyres, Tyre Master)
        <>
          <SearchBar placeholder={searchPlaceholder} />
          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <span className={styles.bellWrap}>
                <BellIcon size={20} />
                <span className={styles.notifDot} aria-hidden="true" />
              </span>
            </button>
          </div>
        </>
      ) : (
        // Dashboard mode: title + date + all icons
        <>
          <div className={styles.left}>
            <h1 className={styles.title}>{PAGE_TITLES[pathname] ?? "Dashboard"}</h1>
            <span className={styles.date}>{formatDate(new Date())}</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <BellIcon size={20} />
            </button>
            <button className={styles.iconBtn} aria-label="Help">
              <HelpIcon size={20} />
            </button>
            <div className={styles.avatar}>OP</div>
          </div>
        </>
      )}
    </header>
  );
}
