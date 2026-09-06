import { TyresTable } from "@/components/tyres/TyresTable";
import { TyresMobile } from "@/components/tyres/TyresMobile";
import styles from "./page.module.css";

export default function TyresPage() {
  return (
    <>
      <div className={styles.desktop}>
        <TyresTable />
      </div>
      <div className={styles.mobile}>
        <TyresMobile />
      </div>
    </>
  );
}
