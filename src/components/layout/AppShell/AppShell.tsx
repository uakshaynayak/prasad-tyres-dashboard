import { Sidebar } from "../Sidebar";
import { TopBar } from "../TopBar";
import { MobileHeader } from "../MobileHeader";
import { MobileBottomNav } from "../MobileBottomNav";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.desktopSidebar}>
        <Sidebar />
      </div>

      <div className={styles.content}>
        <div className={styles.desktopTopBar}>
          <TopBar />
        </div>
        <div className={styles.mobileTopBar}>
          <MobileHeader />
        </div>

        <main className={styles.main}>{children}</main>
      </div>

      <div className={styles.mobileNav}>
        <MobileBottomNav />
      </div>
    </div>
  );
}
