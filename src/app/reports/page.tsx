import { ReportsDesktop } from "@/components/reports/ReportsDesktop";
import { ReportsMobile } from "@/components/reports/ReportsMobile";
import styles from "./page.module.css";

export default function ReportsPage() {
  return (
    <>
      <div className={styles.desktop}>
        <ReportsDesktop />
      </div>
      <div className={styles.mobile}>
        <ReportsMobile />
      </div>
    </>
  );
}
