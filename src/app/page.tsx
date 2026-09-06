import { DashboardDesktop } from "@/components/dashboard/DashboardDesktop";
import { DashboardMobile } from "@/components/dashboard/DashboardMobile";
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <>
      <div className={styles.desktop}>
        <DashboardDesktop />
      </div>
      <div className={styles.mobile}>
        <DashboardMobile />
      </div>
    </>
  );
}
